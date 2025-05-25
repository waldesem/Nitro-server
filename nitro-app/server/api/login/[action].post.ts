import { eq } from "drizzle-orm";
import { db } from "~/db/index";
import { users } from "~/db/src/schema";

export default defineEventHandler(async (event) => {
  const action = getRouterParam(event, "action");
  const json_data = await readBody(event);
  if (!json_data) {
    send(event, 400);
  }
  const results = await db
    .select()
    .from(users)
    .where(eq(users.username, json_data["username"]));
  const user = results[0];
  if (!user || user.blocked || user.deleted) {
    return { message: "Invalid" };
  }
  if (!checkPasswordHash(json_data["password"], user.passhash)) {
    if (user.attempt < 5) {
      await db
        .update(users)
        .set({ attempt: (user.attempt += 1) })
        .where(eq(users.id, user.id));
    } else {
      await db
        .update(users)
        .set({ blocked: true })
        .where(eq(users.id, user.id));
    }
    return { message: "Invalid" };
  }
  if (action == "update") {
    await db
      .update(users)
      .set({
        attempt: 0,
        change_pswd: false,
        passhash: createPasswordHash(json_data["new_pswd"]),
      })
      .where(eq(users.id, user.id));
    return { message: "Updated" };
  }
  const delta = new Date().getTime() - new Date(user.pswd_create).getTime();
  if (delta > 86400000 * 365 || !user.change_pswd) {
    const session = await useSession(event, {
      password: SECRET_KEY,
    });
    await db
      .update(users)
      .set({ attempt: 0, pswd_create: new Date() })
      .where(eq(users.id, user.id));
    await session.update({ ...user });
    return { message: "Success" };
  }
  return { message: "Denied" };
});
