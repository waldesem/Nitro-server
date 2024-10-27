export default defineNitroPlugin((nitro) => {
    nitro.hooks.hookOnce("close", async () => {
      console.log("Closing nitro server...")
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log("Task is done!");
    });
  })
  