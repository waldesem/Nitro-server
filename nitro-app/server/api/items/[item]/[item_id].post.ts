import { db } from "~/db/index";
import { itemsTables, itemsSchemas } from "~/db/src/schema";

export default defineEventHandler(async (event) => {
  const item = getRouterParam(event, "item");
  const item_id = getRouterParam(event, "item_id");
  const session = await useSession(event, {
    password: SECRET_KEY,
  });
  const data = await readBody(event);
  const schema = itemsSchemas[item as keyof typeof itemsSchemas];
  const table = itemsTables[item as keyof typeof itemsTables];
  const validated = schema.parse(data);
  Object.assign(validated, { user_id: session.data.id });
  if (item !== "persons") {
    Object.assign(validated, { person_id: item_id });
  } else {
    Object.assign(validated, { id: item_id });
  }
  try {
    await db.insert(table).values(validated).onConflictDoUpdate({
      target: table.id,
      set: validated,
    }).execute();
    return { message: "success" };
  } catch (error) {
    return { error: error };
  }
});
