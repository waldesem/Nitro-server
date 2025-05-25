import fs from "node:fs";
import { eq } from "drizzle-orm";
import { db } from "~/db/index";
import { persons } from "~/db/src/schema";
import { makeDestinationFolder } from "~/utils";

export default defineEventHandler(async (event) => {
  const person_id = parseInt(getRouterParam(event, "person_id") as string);
  const region = getQuery(event).region as string;
  const results = await db
    .select()
    .from(persons)
    .where(eq(persons.id, person_id))
    .execute();
  if (results.length == 0) {
    return { message: "error" };
  }
  const person = results[0];
  const folderName = makeDestinationFolder(
    region,
    person.id.toString(),
    person.surname,
    person.firstname,
    person.patronymic || ""
  );
  if (person.destination) {
    fs.cpSync(person.destination, folderName);
  }
  db.update(persons)
    .set({ destination: folderName, editable: false })
    .where(eq(persons.id, person_id))
    .execute();
  return { message: "success" };
});
