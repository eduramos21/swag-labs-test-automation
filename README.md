# swag-labs-test-automation

Playwright (TypeScript) end-to-end tests for [Swag Labs](https://www.saucedemo.com). Chromium only.

## Quick start (about 5 minutes)

1. Install [Node.js](https://nodejs.org) 20 or newer.
2. `git clone <repo-url>` (or download the ZIP and unzip it).
3. `cd e2e && npm ci`
4. `npx playwright install chromium`
5. `cp .env.example .env` (Windows: `copy .env.example .env`)
6. `npm run smoke`
7. `npm run report` opens the Allure report.

Done when step 6 is green and step 7 shows the report.

## Run tests

Pattern: `npm run <smoke|regression|test> [user] [-- playwright flags]`

| Goal               | Command                                                   |
| ------------------ | --------------------------------------------------------- |
| Smoke, every user  | `npm run smoke`                                           |
| Regression, 1 user | `npm run regression problem_user`                         |
| Everything, 1 user | `npm test standard_user`                                  |
| One scenario       | `npm run regression problem_user -- -g "key information"` |
| Watch it (headed)  | `npm run test:headed -- -g "key information"`             |

Notes:

- No user, or `all_users`, runs every user.
- Smoke tests are also tagged `@regression`, so regression includes smoke. `npm test` runs the same tests as regression plus `locked_out_user`'s one test.
- `npm test` with no user runs 64 tests: 59 tests plus 5 login setup tests (one per user that can log in).
- `-g` is a regex on the test title. Use a part of the title. Titles end with the user, for example `[problem_user]`. `-- --list` shows all titles.
- Headed scripts (`test:headed`, `smoke:headed`, `regression:headed`) use `--workers=1`. Speed: `SLOWMO=1000 npm run test:headed`.
- Parallelism: `npm test -- --workers=4`.
- Each run starts with empty results. The Allure report is named after suite and user, for example `Swag Labs regression problem_user`.

### Users

`standard_user`, `problem_user`, `locked_out_user`, `performance_glitch_user`, `error_user`, `visual_user`

| User                      | Tests          | With setup |
| ------------------------- | -------------- | ---------- |
| `standard_user`           | 13 (4 smoke)   | 14         |
| `problem_user`            | 15 (4 smoke)   | 16         |
| `locked_out_user`         | 1 (smoke only) | 1          |
| `performance_glitch_user` | 10 (3 smoke)   | 11         |
| `error_user`              | 10 (3 smoke)   | 11         |

On execution, test count add +1 for the login setup test.

`visual_user` has the same counts as `error_user`. "With setup" adds the one login setup test for that user. `locked_out_user` needs no setup.

## Red on purpose

`problem_user` has seeded app bugs. The tests assert the intended behaviour, so some fail by design. They report real defects. They are not flaky.

| Test (problem_user)                           | Result                                                       | Bug                       |
| --------------------------------------------- | ------------------------------------------------------------ | ------------------------- |
| Login, remove from cart page                  | pass                                                         | none                      |
| Detail pages, sorting                         | red                                                          | BUG-05/07, BUG-09         |
| Add 2 more to the cart (catalog, detail page) | red if a pick is a BUG-03 product; always red on detail page | BUG-03, BUG-05/07, BUG-08 |
| Remove from catalog, detail page              | red                                                          | BUG-04, BUG-06            |
| Finish an order, checkout required fields     | red every run (fields: red at the postal code step)          | BUG-02                    |

Every `standard_user` test passes. Two tests run for `problem_user` only: username with spaces (BUG-15) and empty-cart checkout (BUG-01).

## Troubleshooting and FAQ

**`npm error ENOENT ... package.json` when running `npm test`**
You are in the repo root. Run `cd e2e` first. Every `npm` command in this README runs inside `e2e/`.

**`Usage: run.js <smoke|regression|all> [user] ...`**
The user name is wrong or shortened (for example `standard` instead of `standard_user`). Use the full name: `standard_user`, `problem_user`, `locked_out_user`, `performance_glitch_user`, `error_user`, `visual_user`, or `all_users`.

**Tests fail with a missing env var or login error**
`.env` is missing. Run `cp .env.example .env` (Windows: `copy .env.example .env`) inside `e2e/`.

**`Executable doesn't exist` from Playwright**
The browser is not installed. Run `npx playwright install chromium`.

**`problem_user` tests are red**
Expected. See "Red on purpose".

**`npm run regression locked_out_user` runs 0 tests**
Expected. That user has one test, and it is smoke only. Run `npm run smoke locked_out_user`.

**A failure does not reproduce on the next run**
Check the seed in the Allure report. Replay it with `SEED=<n>`.

## Login reuse

`tests/auth.setup.ts` logs in every user except `locked_out_user` once per run. It saves each session to `e2e/.auth/`. Other tests load that session. Only `login.spec.ts` uses the real form. No setup needed: it runs before the tests.

## Layout

```
├── e2e                       Playwright suite (TypeScript)
│   ├── data                  users, products, env vars, seeded random picks
│   ├── fixtures              page objects, login and cart-seeding fixtures
│   ├── pages                 page objects, one per screen
│   ├── scripts               run.js (suite and user runner), check-tags.js
│   └── tests                 specs, tagged by suite, user and bug
├── qa                        QA artefacts
│   ├── audit                 dated suite audits
│   ├── design                test design and user model
│   └── opportunities.md      QA opportunities list
├── qa.config.yml             QA framework config (stack, CI, tracker)
└── .env.example              required environment variables
```

## Tags

Tags are not in the title. Every test has:

- One suite tag: `@smoke` or `@regression`. Add both tags to run in both.
- One user tag passed as parameter in the test: `@${user}`.
- Optional `@BUG-xx` and `@OBS-xx`.

Select by tag: `npx playwright test --grep @BUG-03`

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
