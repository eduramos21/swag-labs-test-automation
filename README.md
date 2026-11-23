# swag-labs-test-automation

Playwright (TypeScript) end-to-end tests for [Swag Labs](https://www.saucedemo.com), Chromium only.

## Run it

1. Get the code: `git clone <repo-url>`, or download the ZIP and unzip it.
2. Install [Node.js](https://nodejs.org) 20 or newer.
3. `cd e2e && npm ci`
4. `npx playwright install chromium`
5. `cp .env.example .env` (Windows: `copy .env.example .env`)
6. Run one of: `npm run smoke`, `npm run regression`, `npm test` (everything).
7. Open the Allure report: `npm run report`

## Run by suite and user

Add a user after the command. Without one, every user runs.

```
npm run smoke standard_user
npm run regression problem_user
npm run regression all_users     # same as: npm run regression
npm test locked_out_user
npm run regression standard_user -- --headed    # extra Playwright flags go after --
```

### Run everything for one user

```
npm test standard_user
npm test problem_user
npm test locked_out_user
```

`npm test` is the `all` suite, so it runs smoke and regression together for that user. It takes extra flags too, for example `npm test standard_user -- --headed`. The Allure report is named `Swag Labs all standard_user`. `npm test` with no user, or `npm test all_users`, runs all 31 tests (29 tests plus 2 login setup tests).

| User | Tests | With setup |
| --- | --- | --- |
| `standard_user` | 13 (4 smoke, 9 regression) | 15 |
| `problem_user` | 15 (4 smoke, 11 regression) | 17 |
| `locked_out_user` | 1 (smoke) | 3 |

CI has no "all tests for one user" job: the smoke and regression jobs per user already cover the same tests.

Users: `standard_user`, `problem_user`, `locked_out_user`. Each run starts with empty results, and its Allure report is named after the suite and user (`Swag Labs regression problem_user`). `npm run check:tags` fails when a test does not have exactly one user tag.

## Red on purpose

`problem_user` is a user with seeded app bugs, and the tests assert the intended behaviour. These fail by design and report real defects, they are not flaky tests.

| Test (problem_user)                           | Result                                                             | Bug                       |
| --------------------------------------------- | ------------------------------------------------------------------ | ------------------------- |
| Login, remove from cart page                  | pass                                                               | none                      |
| Detail pages, sorting                         | red                                                                | BUG-05/07, BUG-09         |
| Add 2 more to the cart (catalog, detail page) | red when a pick is a BUG-03 product, always red on the detail page | BUG-03, BUG-05/07, BUG-08 |
| Remove from catalog, detail page              | red                                                                | BUG-04, BUG-06            |
| Finish an order                               | red every run                                                      | BUG-02                    |
| Checkout required fields                      | red at the postal code step                                        | problem_user checkout bug |

Every test runs for every user (see "Tags" below). The two exceptions, the username-with-spaces test (BUG-15) and the empty-cart checkout test (BUG-01), run for `problem_user` only, so every `standard_user` test passes.

## Random products and SEED

Cart, checkout and detail page tests pick products at random. The seed decides the picks: the same seed gives the same products every run, so results compare between runs and a failure reproduces. The seed is attached to each test in the Allure report.

`npm test`, `npm run smoke` and `npm run regression` default to `SEED=9`. With that seed the `problem_user` tests that hit BUG-03 and BUG-04 products fail on every run, in the same places. That is deterministic, not flaky (same failures on repeated runs of `regression problem_user`).

| Command                                                          | Picks                                          |
| ---------------------------------------------------------------- | ---------------------------------------------- |
| `npm run regression`                                             | SEED 9, same products every run                |
| `SEED=42 npm run regression`                                     | another fixed seed                             |
| `SEED=off npm run regression`                                    | no seed, new random products every run         |
| Windows PowerShell: `$env:SEED="off"; npm run regression`        | same as above                                  |

With `SEED=off`, `problem_user` tests for BUG-03 and BUG-04 fail only when the random picks include an affected product. A failing random run prints its seed in the report, replay it with `SEED=<n>`. Plain `npx playwright test` (without the runner) has no default seed and picks random products.

## Login reuse

`tests/auth.setup.ts` logs in `standard_user` and `problem_user` once per run and saves each session to `e2e/.auth/`. Every other test loads that session instead of using the login form. Only `login.spec.ts` uses the real form. Nothing to set up: the setup runs by itself before the tests.

## Layout

```
e2e/
  tests/      specs by area: login, catalog, cart, checkout
  pages/      one page object per screen, exposed as fixtures
  fixtures/   test.extend: page objects, loginAs, seedCart, rng
  .auth/      sessions saved by tests/auth.setup.ts (gitignored, created on each run)
  data/       products, sort options, users, env, seeded random
  .env.example  names and public demo values of the five variables
```

Tests carry tags (not in the title): `@smoke` or `@regression` (never both, so no test runs twice), one user tag (`@standard_user`, `@problem_user`, `@locked_out_user`), plus `@BUG-xx` and `@OBS-xx`. Select with `npx playwright test --grep @BUG-03`. Every test loops over `sessionRoles` (`standard_user`, `problem_user`) and is tagged `@${user}`, so `npm run <suite> <user>` runs the same tests for whichever user you pick. Three exceptions: the username-with-spaces test (BUG-15) and the empty-cart test (BUG-01) are `problem_user` only, and the locked-out test is `locked_out_user` only (that user can never log in). The reasons are in `qa/design/swag-labs.md`, "User model". Allure shows every tag on the test and the suite and user in the report header.

To add a user: add it to `roles` and `envVar` in `e2e/data/users.ts`, add its secret to the workflow env, add it to `sessionRoles` if it can log in (every looping test then runs for it), and add a row to the CI matrix.

## CI

`.github/workflows/e2e.yml` runs one job per suite and user: smoke for `standard_user`, `problem_user` and `locked_out_user`, regression for `standard_user` and `problem_user`. Each job uploads its own Allure report (`allure-<suite>-<user>`), so the results of every combination are separate. The `problem_user` jobs are red on purpose (see above). `locked_out_user` has no regression job because its only test is a smoke test. The workflow reads `BASE_URL`, `STANDARD_USER`, `PROBLEM_USER`, `LOCKED_OUT_USER` and `PASSWORD` from GitHub secrets (Settings, Secrets and variables, Actions).

### Why tags and a runner instead of one Playwright project per user

Projects per user would give the cleanest per-user results in a single report. They would also require every test to take its user from a fixture instead of the current loops in each spec, which is a bigger rewrite. Tags plus `e2e/scripts/run.js` keep the specs as they are, at the cost of a convention to maintain (every test needs a user tag, enforced by `npm run check:tags`) and one `npm ci` plus browser install per CI job. The separate jobs are intentional: each suite and user gets its own build and report.
