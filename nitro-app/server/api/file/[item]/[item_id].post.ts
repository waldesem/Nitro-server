import fs from "node:fs";
import path from "node:path";
import { eq } from "drizzle-orm";
import { db } from "~/db/index";
import { persons } from "~/db/src/schema";

export default defineEventHandler(async (event) => {
  const session = await useSession(event, {
    password: SECRET_KEY,
  });
  const item = getRouterParam(event, "item") as string;
  const item_id = parseInt(getRouterParam(event, "item_id") as string);
  const files = await readBody(event);
  const results = await db
    .select()
    .from(persons)
    .where(eq(persons.id, item_id));
  if (results.length == 0) {
    return { message: "error" };
  }
  const person = results[0];
  if (!person.destination || !fs.existsSync(person.destination)) {
    const folderName = makeDestinationFolder(
      session.data.region,
      person.id.toString(),
      person.surname,
      person.firstname,
      person.patronymic || ""
    );
    await db
      .update(persons)
      .set({ destination: folderName })
      .where(eq(persons.id, item_id));
  }
  const itemFolder = path.join(person.destination as string, item);
  if (!fs.existsSync(itemFolder)) {
    fs.mkdirSync(itemFolder);
    if (item == "image") {
      fs.writeFileSync(path.join(itemFolder, item), files.file);
      return { message: "success" };
    }
  }
  const dateFolder = path.join(
    itemFolder,
    `${new Date().toLocaleDateString()}`
  );
  if (!fs.existsSync(dateFolder)) {
    fs.mkdirSync(dateFolder);
  }
  fs.writeFileSync(path.join(dateFolder, item), files.file);
  return { message: "success" };
});
