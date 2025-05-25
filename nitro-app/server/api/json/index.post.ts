import fs from "node:fs";
import { and, ilike, eq } from "drizzle-orm";
import { db } from "~/db/index";
import { anketaSchema } from "~/schema";
import { itemsSchemas, itemsTables, persons } from "~/db/src/schema";
import { makeDestinationFolder } from "~/utils";

export default defineEventHandler(async (event) => {
  const session = await useSession(event, {
    password: SECRET_KEY,
  });
  const files = await readBody(event);
  const reader = new FileReader();
  reader.readAsText(files[0].file);
  try {
    const jsonData = await new Promise((resolve) => {
      reader.onload = () => {
        resolve(JSON.parse(reader.result as string));
      };
    });
    const validated = anketaSchema.parse(jsonData);
    const anketa = {
      persons: {
        region: session.data.region,
        surname: validated.lastName,
        firstname: validated.firstName,
        patronymic: validated.midName,
        birthday: validated.birthday,
        birthplace: validated.birthplace,
        citizenship: validated.citizen,
        dual: validated.additionalCitizenship,
        marital: validated.maritalStatus,
        inn: validated.inn,
        snils: validated.snils,
      },
      staffs: [
        {
          position: validated.positionName,
          department: validated.department,
        },
      ],
      documents: [
        {
          view: "Паспорт",
          series: validated.passportSerial,
          digits: validated.passportNumber,
          agency: validated.passportIssuedBy,
          issue: validated.passportIssueDate,
        },
      ],
      addresses: [
        {
          view: "Адрес регистрации",
          address: validated.regAddress,
        },
        {
          view: "Адрес проживания",
          address: validated.validAddress,
        },
      ],
      contacts: [
        {
          view: "Адрес электронной почты",
          contact: validated.email,
        },
        {
          view: "Мобильный телефон",
          contact: validated.contactPhone,
        },
      ],
      previous: [],
      educations: [],
      workplaces: [],
      affilations: [],
    };
    for (const prev of validated.previous) {
      Object.assign(anketa.previous, [
        {
          firstname: prev.firstNameBeforeChange,
          surname: prev.lastNameBeforeChange,
          patronymic: prev.midNameBeforeChange,
          changed: prev.yearOfChange,
          reason: prev.reason,
        },
      ]);
    }
    for (const education of validated.educations) {
      Object.assign(anketa.educations, [
        {
          view: education.educationType,
          institution: education.institutionName,
          finished: education.endYear,
          specialty: education.specialty,
        },
      ]);
    }
    for (const work of validated.workplaces) {
      Object.assign(anketa.workplaces, [
        {
          starts: work.beginDate,
          finished: work.endDate,
          now_work: work.currentJob,
          workplace: work.name,
          addresses: work.address,
          position: work.position,
          reason: work.fireReason,
        },
      ]);
    }
    for (const aff of validated.organizations) {
      Object.assign(anketa.affilations, [
        {
          view: aff.view,
          organization: aff.name,
          inn: aff.inn,
        },
      ]);
    }
    for (const aff of validated.relatedPersonsOrganizations) {
      Object.assign(anketa.affilations, [
        {
          view: aff.view,
          organization: aff.name,
          inn: aff.inn,
        },
      ]);
    }
    for (const aff of validated.stateOrganizations) {
      Object.assign(anketa.affilations, [
        {
          view: aff.view,
          organization: aff.name,
        },
      ]);
    }
    for (const aff of validated.publicOfficeOrganizations) {
      Object.assign(anketa.affilations, [
        {
          view: aff.view,
          organization: aff.name,
        },
      ]);
    }
    const query = db
      .select()
      .from(persons)
      .where(
        and(
          ilike(persons.surname, anketa.persons.surname),
          ilike(persons.firstname, anketa.persons.firstname),
          ilike(persons.patronymic, anketa.persons.patronymic || "%%"),
          eq(persons.birthday, anketa.persons.birthday)
        )
      );
    const results = await query.execute();
    const validpersons = itemsSchemas["persons"].parse(anketa.persons);
    if (results.length == 0) {
      Object.assign(anketa.persons, {
        editable: true,
        user_id: session.data.id,
        region: session.data.region,
      });
      const personId = await db
        .insert(persons)
        .values(validpersons)
        .onConflictDoNothing()
        .returning()
        .then((rows) => rows[0].id);
      const folderName = makeDestinationFolder(
        session.data.region,
        personId.toString(),
        anketa.persons.surname,
        anketa.persons.firstname,
        anketa.persons.patronymic || ""
      );
      await db
        .update(persons)
        .set({ destination: folderName })
        .execute();
      for (const [key, values] of Object.entries(anketa)) {
        const table = itemsTables[key as keyof typeof itemsTables];
        if (!table || key == "persons") continue;
        for (const value in values) {
          Object.assign(value, {
            person_id: personId,
            user_id: session.data.id,
          });
          try {
            const validItem =
              itemsSchemas[key as keyof typeof itemsSchemas].parse(value);
            await db.insert(table).values(validItem).execute();
          } catch (error) {
            console.error(error);
          }
        }
      }
      return { person_id: personId };
    }
    const person = results[0];
    const folderName = makeDestinationFolder(
      session.data.region,
      person.id.toString(),
      anketa.persons.surname,
      anketa.persons.firstname,
      anketa.persons.patronymic || ""
    );
    if (anketa.persons.region != person.region && person.destination) {
      try {
        fs.cpSync(person.destination, folderName);
      } catch (err) {
        console.error(err);
      }
    }
    Object.assign(person, { destination: folderName, id: person.id });
    try {
      await db
        .update(persons)
        .set({ ...anketa.persons })
        .where(eq(persons.id, person.id))
        .execute();
    } catch (err) {
      return { person_id: null, message: err };
    }
    for (const [key, values] of Object.entries(anketa)) {
      const table = itemsTables[key as keyof typeof itemsTables];
      if (key == "persons") continue;
      for (const value in values) {
        Object.assign(value, {
          person_id: person.id,
          user_id: session.data.id,
        });
        try {
          const validItem =
            itemsSchemas[key as keyof typeof itemsSchemas].parse(value);
          await db.insert(table).values(validItem).execute();
        } catch (error) {
          console.error(error);
        }
      }
    }
    return { person_id: person.id };
  } catch (error) {
    return { person_id: null, message: error };
  }
});
