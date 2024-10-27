import { db } from "~/db/index";
import { users } from "~/db/src/schema";

export default defineEventHandler(async (event) => {
  const data = await readBody(event);
  try {
    await db
      .insert(users)
      .values(data)
      .onConflictDoNothing({
        target: users.username,
      })
      .execute();
    return { message: "success" };
  } catch (error) {
    return { message: error };
  }
});
