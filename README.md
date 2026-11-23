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

## Red on purpose

`problem_user` is a user with seeded app bugs, and the tests assert the intended behaviour. These fail by design and report real defects, they are not flaky tests.

| Test (problem_user) | Result | Bug |
|---|---|---|
| Login, remove from cart page | pass | none |
| Detail pages, sorting | red | BUG-05/07, BUG-09 |
| Add 2 more to the cart (catalog, detail page) | red when a pick is a BUG-03 product, always red on the detail page | BUG-03, BUG-05/07, BUG-08 |
| Remove from catalog, detail page | red | BUG-04, BUG-06 |
| Finish an order | red every run | BUG-02 |

Two `standard_user` tests are red too: a username with surrounding spaces (BUG-15) and checkout with an empty cart (BUG-01). Everything else passes.

## Random products and SEED

Cart and checkout tests pick products at random. The seed is attached to each test in the report. `npm run regression` uses a fixed seed (`SEED=9`) whose picks include BUG-03 and BUG-04 products. To replay a run: `SEED=<n> npx playwright test` (Windows PowerShell: `$env:SEED=<n>; npx playwright test`).

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

Tests are tagged in their titles: `@smoke`, `@regression` (all), `@BUG-xx`, `@OBS-xx`. Select with `npx playwright test --grep @BUG-03`.

## CI

`.github/workflows/e2e.yml` runs smoke, then regression, and fails the job if either is red. It reads `BASE_URL`, `STANDARD_USER`, `PROBLEM_USER`, `LOCKED_OUT_USER` and `PASSWORD` from GitHub secrets (Settings, Secrets and variables, Actions).
