import { like } from "drizzle-orm";
import { db } from "~/db/index";
import { users } from "~/db/src/schema";

export default defineEventHandler(async (event) => {
  const search = getQuery(event).search as string;
  let query = db.select().from(users).$dynamic();
  if (search && search.length > 2) {
    const buffered = Buffer.from(search, "ascii").toString("utf-8");
    if (buffered.match(/^[a-zA-Z_]+$/)) {
      query = query.where(like(users.username, `%${buffered}%`));
    } else {
      query = query.where(like(users.fullname, `%${buffered}%`));
    }
  }
  return await query.execute();
});
