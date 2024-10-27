import { sql } from "drizzle-orm";
import { db } from "~/db/index";

export default defineEventHandler(async (event) => {
  const item_id = getRouterParam(event, "item_id");
  const editables = db.all(
    sql`SELECT editable FROM persons WHERE id = ${item_id}`
  );
  if (editables.length == 0) {
    return { message: "error" };
  }
  const firstRow = editables[0] as Record<string, number>;
  const editable = firstRow["editable" as keyof typeof firstRow] ? 0 : 1;
  db.run(sql`UPDATE persons SET editable = ${editable} WHERE id = ${item_id}`);
  return { message: "success" };
});
