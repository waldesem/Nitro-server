import { desc, eq, like } from "drizzle-orm";
import { db } from "~/db/index";
import { persons } from "~/db/src/schema";
import { Regions } from "~/utils/objects";

export default defineEventHandler(async (event) => {
  const pagination = 10;
  const page = parseInt(getRouterParam(event, "page") as string);
  const search = getQuery(event).search as string;
  const session = await useSession(event, {
    password: SECRET_KEY,
  });
  let query = db.select().from(persons).$dynamic();
  if (search && search.length > 2) {
    const buffered = Buffer.from(search, "ascii").toString("utf-8");
    const searchData = buffered.toUpperCase().split(" ").slice(0, 3);
    if (searchData.length) {
      query = query.where(like(persons.surname, `%${searchData[0]}%`));
    }
    if (searchData.length > 1) {
      query = query.where(like(persons.firstname, `%${searchData[1]}%`));
    }
    if (searchData.length > 2) {
      query = query.where(like(persons.patronymic, `%${searchData[2]}%`));
    }
  }
  if (session.data.region !== Regions.main) {
    query = query.where(eq(persons.region, session.data.region));
  }
  query = query
    .limit(pagination + 1)
    .offset((page - 1) * pagination)
    .orderBy(desc(persons.id));
  const results = await query;
  const hasNext = results.length > pagination;
  return [hasNext ? results.slice(0, pagination) : results, hasNext];
});
