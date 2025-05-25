export default defineEventHandler(async (event) => {
  const session = await useSession(event, {
    password: SECRET_KEY,
  });
  await session.clear();
  return { message: "success" };
});
