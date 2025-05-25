import fs from "fs";
import path from "path";
import { db } from "~/db";
import { eq } from "drizzle-orm";
import { persons } from "~/db/src/schema";

export default defineEventHandler(async (event) => {
  const personId = parseInt(getRouterParam(event, "item_id") as string);
  const result = await db
    .select()
    .from(persons)
    .where(eq(persons.id, personId));
  if (result.length) {
    const person = result[0];
    const imagesFolder = path.join(person.destination as string, "image");
    if (fs.existsSync(imagesFolder)) {
      for (const file of fs.readdirSync(imagesFolder)) {
        if (file.match(/\.(jpg|jpeg|png)$/i)) {
          const imagePath = path.join(imagesFolder, file);
          const buffer = fs.readFileSync(imagePath);
          return send(event, buffer, "image/jpeg");
        }
      }
    }
  }
  const buffer = fs.readFileSync("static/no-photo.png");
  return send(event, buffer, "image/jpeg");
});
