import { db } from "~/db/index";
import { users, userSchema } from "~/db/src/schema";

export default defineEventHandler(async (event) => {
  const data = await readBody(event);
  try {
    const validated = userSchema.parse(data);
    console.log(validated);
    await db
      .insert(users)
      .values({...validated})
      .onConflictDoNothing({
        target: users.username,
      })
      .execute();
    return { message: "success" };
  } catch (error) {
    return { message: error };
  }
});
