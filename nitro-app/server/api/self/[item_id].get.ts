import { sql } from "drizzle-orm";
import { db } from "~/db/index";

export default defineEventHandler(async (event) => {
  const item_id = getRouterParam(event, "item_id");
  const editables = await db.execute(
    sql`SELECT editable FROM persons WHERE id = ${item_id}`
  );
  const editable = editables["editable" as keyof typeof editables] ? 0 : 1;
  db.execute(
    sql`UPDATE persons SET editable = ${editable} WHERE id = ${item_id}`
  );
  return { message: "success" };
});
