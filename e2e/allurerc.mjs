import { readFileSync } from "node:fs";

// Names each build after its suite and user, e.g. "Swag Labs regression problem_user".
// Reads the values the run wrote to environment.properties, so `npm run report` after the run is named the same.
let info = "";
try {
  info = readFileSync("allure-results/environment.properties", "utf8");
} catch {}
const read = (key) =>
  info.match(new RegExp(`^${key}=(.*)$`, "m"))?.[1] ?? "all";

export default { name: `Swag Labs ${read("suite")} ${read("user")}` };
