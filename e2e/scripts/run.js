// Usage: npm run <smoke|regression|test> [user|all_users] [playwright args]
// Filters by suite tag and user tag, labels the Allure report, starts from clean results.
const { spawnSync } = require("node:child_process");
const { rmSync } = require("node:fs");

const [suite, user = "all_users", ...rest] = process.argv.slice(2);
const suites = ["smoke", "regression", "all"];
const users = ["standard_user", "problem_user", "locked_out_user"];
if (
  !suites.includes(suite) ||
  (user !== "all_users" && !users.includes(user))
) {
  console.error(
    `Usage: run.js <${suites.join("|")}> [${users.join("|")}|all_users] [playwright args]`,
  );
  process.exit(2);
}

const lookaheads = [];
if (suite !== "all") lookaheads.push(`@${suite}`);
if (user !== "all_users") lookaheads.push(`@${user}`);
const grep = lookaheads.length
  ? ["--grep", lookaheads.map((t) => `(?=.*${t}\\b)`).join("")]
  : [];

rmSync("allure-results", { recursive: true, force: true });
// SEED=9 by default. SEED=<n> picks another; SEED=off lets every run pick random products.
const env = { SEED: "9", ...process.env, RUN_SUITE: suite, RUN_USER: user };
if (env.SEED === "off") delete env.SEED;
const result = spawnSync("npx", ["playwright", "test", ...grep, ...rest], {
  stdio: "inherit",
  shell: process.platform === "win32",
  env,
});
process.exit(result.status ?? 1);
