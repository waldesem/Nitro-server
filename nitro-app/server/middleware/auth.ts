import { Roles } from "~/utils/objects";

export default defineEventHandler(async (event) => {
  const requestURL = getRequestURL(event).pathname as string;
  const session = await useSession(event, {
    password: SECRET_KEY,
  });

  if (!requestURL.startsWith("/api/login") && !session.data)
    return send(event, 401);

  if (requestURL.startsWith("/api/users") && session.data.role !== Roles.admin)
    return send(event, 403);
});
