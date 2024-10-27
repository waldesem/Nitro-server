import { eq } from "drizzle-orm";
import { db } from "~/db/index";
import { users } from "~/db/src/schema";
import { createPasswordHash } from "~/utils";
import { Roles, Regions } from "~/utils/objects";

export default defineEventHandler(async (event) => {
  const user_id = parseInt(getRouterParam(event, "user_id") as string);
  const item = getQuery(event).item as string;
  const results = await db.select().from(users).where(eq(users.id, user_id));
  if (results.length == 0) {
    return { message: "error" };
  }
  const user = results[0];
  const setData = {};
  if (item == "drop") {
    Object.assign(setData, {
      blocked: true,
      attempt: 0,
      change_pswd: true,
      passhash: createPasswordHash("88888888"),
    });
  } else if (item == "block") {
    Object.assign(setData, { blocked: !user.blocked });
  } else if (item == "delete") {
    Object.assign(setData, { deleted: !user.deleted });
  } else if (Object.values(Roles).includes(item)) {
    Object.assign(setData, { role: item });
  } else if (Object.keys(Regions).includes(item)) {
    Object.assign(setData, { region: item });
  }
  await db.update(users).set(setData).where(eq(users.id, user_id));
  return { message: "success" };
});
