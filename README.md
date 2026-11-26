# swag-labs-test-automation

Playwright (TypeScript) end-to-end tests for [Swag Labs](https://www.saucedemo.com). Chromium only.

## Quick start (about 5 minutes)

1. Run `node --version`. It must print `v20` or higher. If not, see "Install Node.js" below, then come back.
2. `git clone <repo-url>` (or download the ZIP and unzip it).
3. `cd e2e && npm ci`
4. `npx playwright install chromium`
5. `cp .env.example .env` (Windows: `copy .env.example .env`)
6. `npm run smoke`
7. `npm run report` opens the Allure report.

If your goal is to run the tests you're done when step 6 runs successfully. If you want to see the report continue to step 7.

### Install Node.js

Only if `node --version` fails or prints a version below `v20`.

| System  | Command                                                                      |
| ------- | ---------------------------------------------------------------------------- |
| Any     | Download the LTS installer from [nodejs.org](https://nodejs.org) and run it. |
| macOS   | `brew install node`                                                          |
| Windows | `winget install OpenJS.NodeJS.LTS`                                           |
| Linux   | Use [nvm](https://github.com/nvm-sh/nvm): `nvm install --lts`                |

Then open a new terminal and run `node --version` again.

## Run tests

Pattern: `npm run <smoke|regression|test> [user] [-- playwright flags]`. For one scenario, use `npm test`: it has no suite filter.

| Goal               | Command                                         |
| ------------------ | ----------------------------------------------- |
| Smoke, every user  | `npm run smoke`                                 |
| Regression, 1 user | `npm run regression problem_user`               |
| Everything, 1 user | `npm test standard_user`                        |
| One scenario       | `npm test problem_user -- -g "key information"` |
| Watch it (headed)  | `npm run test:headed -- -g "key information"`   |

Notes:

- No user, or `all_users`, runs every user.
- Smoke tests are also tagged `@regression`, so regression includes smoke. `npm test` runs the same tests as regression plus `locked_out_user`'s one test.
- `npm test` with no user runs 73 tests: 68 tests plus 5 login setup tests (one per user that can log in).
- `-g` is a regex on the test title. Use a part of the title. Titles end with the user, for example `[problem_user]`. `-- --list` shows all titles.
- Headed scripts (`test:headed`, `smoke:headed`, `regression:headed`) use `--workers=1`. Speed: `SLOWMO=1000 npm run test:headed`.
- Parallelism: `npm test -- --workers=4`.
- Each run starts with empty results. The Allure report is named after suite and user, for example `Swag Labs regression problem_user`.

### Users

`standard_user`, `problem_user`, `locked_out_user`, `performance_glitch_user`, `error_user`, `visual_user`

| User                        | Tests          | With login setup |
| --------------------------- | -------------- | ---------------- |
| `standard_user`             | 13 (4 smoke)   | 14               |
| `problem_user`              | 15 (4 smoke)   | 16               |
| `locked_out_user`           | 1 (smoke only) | 1                |
| `performance_glitch_user`   | 13 (4 smoke)   | 14               |
| `error_user`, `visual_user` | 13 (4 smoke)   | 14               |

"With login setup" adds one login test for that user. `locked_out_user` needs no setup.

## Login reuse

On execution, test count add +1 for the login setup test because `tests/auth.setup.ts` logs in every user except `locked_out_user` once per run. It saves each session to `e2e/.auth/`. Other tests load that session. Only `login.spec.ts` uses the real form. No setup needed: it runs before the tests.

## Failing tests

`problem_user` has seeded app bugs. The tests assert the intended behaviour, so some fail by design. They report real defects. They are not flaky.

| Test (problem_user)                       | Result                                              | Bug            |
| ----------------------------------------- | --------------------------------------------------- | -------------- |
| Login, remove from cart page              | pass                                                | none           |
| Detail pages, sorting                     | red                                                 | BUG-05, BUG-09 |
| Add 2 more to the cart (catalog)          | red if a pick is a BUG-03 product                   | BUG-03         |
| Add 2 more to the cart (detail page)      | always red                                          | BUG-05         |
| Remove from catalog, detail page          | red                                                 | BUG-04, BUG-06 |
| Finish an order, checkout required fields | red every run (fields: red at the postal code step) | BUG-02         |

Every `standard_user` test passes. Two tests run for `problem_user` only: username with spaces (BUG-15) and empty-cart checkout (BUG-01).

## Troubleshooting and FAQ

In case of error when running the tests, check this table:

### Errors

| You see                                  | Run this                                                                     |
| ---------------------------------------- | ---------------------------------------------------------------------------- |
| `ENOENT ... package.json`                | `cd e2e`. Every `npm` command runs inside `e2e/`.                            |
| `Usage: run.js <smoke\|regression\|all>` | Use the full user name, e.g. `standard_user`, not a part of it. See "Users". |
| Missing env var or login error           | `cp .env.example .env` (Windows: `copy .env.example .env`)                   |
| `Executable doesn't exist`               | `npx playwright install chromium`                                            |

### Not errors

| You see                                          | Why                                                                    |
| ------------------------------------------------ | ---------------------------------------------------------------------- |
| `problem_user` tests are red                     | Seeded bugs, on purpose. See "Red on purpose".                         |
| `regression locked_out_user` runs 0 tests        | That user has 1 test, smoke only. Run `npm run smoke locked_out_user`. |
| A random failure does not repeat on the next run | The picks changed. Find the seed in the Allure report, run `SEED=<n>`. |

## Layout

```
├── docs
│   └── requirements          test cases (product coverage) and bug report
├── e2e                       Playwright suite (TypeScript)
│   ├── .env.example          required environment variables
│   ├── data                  users, products, env vars, seeded random picks
│   ├── fixtures              Playwright fixtures: page objects, login, cart seeding
│   ├── pages                 page objects, one per screen
│   ├── scripts               run.js (suite and user runner), check-tags.js
│   └── tests                 specs, tagged by suite, user and bug
├── qa                        QA artefacts
│   ├── audit                 dated suite audits
│   ├── design                test design and user model
│   └── opportunities.md      QA opportunities list
└── qa.config.yml             QA framework config (stack, CI, tracker)
```

Requirements: [Test Cases - Product Coverage](docs/requirements/Test%20Cases%20-%20Product%20Coverage.md), [Bug Report](docs/requirements/Bug%20Report.md).

## Tags

Every test has:

- One suite tag: `@smoke` or `@regression`. Add both tags to run in both.
- One user tag passed as parameter in the test: `@${user}`.
- Optional `@BUG-xx` and `@OBS-xx`.

`@BUG-xx` is only on `problem_user` tests. It marks a known bug. A red test with `@BUG` is expected. A red test without it is new.

List the tests with a bug tag: `npx playwright test --list --no-deps --grep "@BUG"`

`npm run check:tags` fails when a test does not have exactly one user tag.

Every test loops over `sessionRoles` (every user except `locked_out_user`) and gets `@${user}`. So `npm run <suite> <user>` runs the same tests for any user. Three exceptions: the BUG-15 and BUG-01 tests are `problem_user` only. The locked-out test is `locked_out_user` only, because that user can never log in. Reasons: `qa/design/swag-labs.md`, "User model".

## CI

`.github/workflows/e2e.yml` runs one job per suite and user:

- Smoke: `standard_user`, `problem_user`, `locked_out_user`
- Regression: `standard_user`, `problem_user`

Each job uploads its own report: `allure-<suite>-<user>`. The `problem_user` jobs are red on purpose. `locked_out_user` has no regression job: its only test is smoke. There is no "all tests for one user" job: the jobs above already cover the same tests.

Set these GitHub secrets (Settings, Secrets and variables, Actions): `BASE_URL`, `STANDARD_USER`, `PROBLEM_USER`, `LOCKED_OUT_USER`, `PERFORMANCE_GLITCH_USER`, `ERROR_USER`, `VISUAL_USER`, `PASSWORD`.

## Random products and SEED

Cart, checkout and detail page tests pick products at random. The seed fixes the picks, so a failure reproduces. The seed is attached to each test in the Allure report.

`npm test`, `npm run smoke` and `npm run regression` default to `SEED=9`. With it, `problem_user` fails on BUG-03 and BUG-04 products in the same places every run. That is deterministic, not flaky.

| Command                                                   | Picks                           |
| --------------------------------------------------------- | ------------------------------- |
| `npm run regression`                                      | SEED 9, same products every run |
| `SEED=42 npm run regression`                              | another fixed seed              |
| `SEED=off npm run regression`                             | new random products every run   |
| Windows PowerShell: `$env:SEED="off"; npm run regression` | same as above                   |

With `SEED=off`, BUG-03 and BUG-04 tests fail only when the picks include an affected product. A failing random run prints its seed in the report. Replay it with `SEED=<n>`. Plain `npx playwright test` has no default seed.
