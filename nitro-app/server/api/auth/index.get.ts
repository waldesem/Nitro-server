import { eq } from "drizzle-orm";
import { db } from "~/db/index";
import { users } from "~/db/src/schema";

export default defineEventHandler(async (event) => {
  const session = await useSession(event, {
    password: SECRET_KEY,
  });
  const results = await db
    .select()
    .from(users)
    .where(eq(users.id, session.data.id));
  if (results.length == 0) {
    return { message: "error" };
  } else {
    const user = results[0];
    if (!user || user.blocked || user.deleted) {
      return { message: "error" };
    }
    return user;
  }
});
