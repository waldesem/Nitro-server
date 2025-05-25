import { sql } from "drizzle-orm";
import { db } from "~/db/index";
import { itemsTables } from "~/db/src/schema";

export default defineEventHandler(async (event) => {
  const item = getRouterParam(event, "item");
  const item_id = getRouterParam(event, "item_id");
  if (item == "persons") {
    for (const item in Object.keys(itemsTables)) {
      if (item == "persons") continue;
      db.execute(sql`DELETE FROM {${item}} WHERE person_id = ${item_id}`);
    }
    db.execute(sql`DELETE FROM persons WHERE id = ${item_id}`);
    return { message: "success" };
  }
  db.execute(sql`DELETE FROM {${item}} WHERE id = ${item_id}`);
  return { message: "success" };
});
