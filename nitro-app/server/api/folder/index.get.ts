import fs from "fs";
import child_process from "child_process";

export default defineEventHandler((event) => {
  const folder = getQuery(event).folder as string;
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }
  child_process.exec(`explorer ${folder}`);
  // child_process.exec(`xdg-open ${folder}`);
  return "";
});
