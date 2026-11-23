// Fails when a test has no user tag or more than one, so it cannot silently drop out of a per-user run.
const { execSync } = require("node:child_process");

const users = ["standard_user", "problem_user", "locked_out_user"];
const report = JSON.parse(
  execSync("npx playwright test --list --reporter=json", {
    encoding: "utf8",
    env: process.env,
  }),
);
const bad = [];
const walk = (suite) => {
  for (const spec of suite.specs ?? []) {
    const own = (spec.tags ?? []).filter((t) =>
      users.includes(t.replace(/^@/, "")),
    );
    if (own.length !== 1)
      bad.push(`${spec.file}: ${spec.title} (${own.length} user tags)`);
  }
  (suite.suites ?? []).forEach(walk);
};
report.suites.forEach(walk);
if (bad.length) {
  console.error(`Tests without exactly one user tag:\n${bad.join("\n")}`);
  process.exit(1);
}
console.log("Every test has exactly one user tag.");
