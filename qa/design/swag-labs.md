# Swag Labs test design

Requirement: Qualifyze-assignment files 1-4 (Obsidian, Interview-Prep-Qualifyze). Designed: 2026-11-22

Decisions: plain Playwright (no playwright-bdd), page objects as fixtures, known bugs stay red,
seeded random products (`SEED` env, logged as report attachment), BUG tags as Playwright `tag` (not in titles); a test is `@smoke` or `@regression`, never both, and has one user tag.

## Coverage

L = likelihood, C = cost, 1 to 3. All rows are e2e: the app is a black box, no API or unit layer exists.

| ID  | Condition                                                                                                                                                   | From             | Technique      | L   | C   | Risk | Layer | Automate | Exists |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | -------------- | --- | --- | ---- | ----- | -------- | ------ |
| T1  | standard_user and problem_user log in and see products page (2 rows) `@smoke`                                                                               | Login            | flow           | 1   | 3   | 3    | e2e   | yes      | no     |
| T2  | locked_out_user sees lock message, cannot reach products `@smoke @OBS-01`                                                                                   | Login            | rules          | 2   | 3   | 6    | e2e   | yes      | no     |
| T3  | Wrong password / unknown user shows mismatch error (2 rows, per user, no setup cost)                                                                                  | Login            | EP             | 2   | 3   | 6    | e2e   | yes      | no     |
| T4  | Username with surrounding spaces logs in `@BUG-15` (problem_user only)                                                                                          | Login            | boundary       | 2   | 1   | 2    | e2e   | yes      | no     |
| T5  | Catalog shows image, title, price, description, add button (both users)                                                                                  | Product display  | EP             | 1   | 2   | 2    | e2e   | yes      | no     |
| T6  | 3 random products open their own detail page, one test per user, soft asserts `@BUG-05 @BUG-07`                                                             | Product display  | EP             | 3   | 2   | 6    | e2e   | yes      | no     |
| T7  | Every sort option orders the list, one test per user, soft asserts `@BUG-09`                                                                                | Sort             | EP             | 2   | 1   | 2    | e2e   | yes      | no     |
| T8  | Keep shopping, add 2 more to a cart of 1; badge 3, cart lists 3 (catalog, detail page; both users; catalog rows `@smoke`) `@BUG-03 @BUG-05 @BUG-07 @BUG-08` | Cart             | combinations   | 3   | 3   | 9    | e2e   | yes      | no     |
| T9  | Remove 3 products from cart page, catalog, detail page; cart empty (both users; cart page rows `@smoke`) `@BUG-04 @BUG-06`                                  | Cart             | combinations   | 3   | 3   | 9    | e2e   | yes      | no     |
| T10 | Full order: cart, info, overview (lists product, quantity, description), finish, confirmation; both users `@smoke @BUG-02`                                  | Checkout, Finish | flow           | 3   | 3   | 9    | e2e   | yes      | no     |
| T11 | standard*user order then generate PDF: a `order*\*.pdf` download is non-empty (merged into T10 run)                                                         | PDF              | flow           | 2   | 2   | 4    | e2e   | yes      | no     |
| T12 | Required fields: empty submit shows first name, then last name, then postal code error (one test per user)                                            | Checkout         | decision table | 2   | 2   | 4    | e2e   | yes      | no     |
| T13 | Empty cart cannot start checkout (problem_user only) `@BUG-01`                                                                                                  | Checkout         | rules          | 3   | 2   | 6    | e2e   | yes      | no     |

Test count: T1 2, T2 1, T3 4 (2 rows x 2 users), T4 1, T5 2, T6 2, T7 2, T8 4, T9 6, T10 2, T11 0 extra, T12 2, T13 1 = 29 tests (was 43 rows).

## User model

Every test loops over `sessionRoles` and is tagged `@${user}`, so `npm run <suite> <user>` runs the same tests for whichever user is picked.

Exceptions:

- Extra spaces in the username (T4, BUG-15): `problem_user` only. Keeps every `standard_user` run green.
- Empty cart (T13, BUG-01): `problem_user` only, for the same reason. The app lets every user into checkout with an empty cart.
- Locked-out login (T2): `locked_out_user` only. That user can never log in, so a loop has no meaning.
- Unknown-user login (part of T3) does not depend on the user. It repeats once per user so each user's run contains it.

Advantage: results compare like for like. The same test runs for each user, so a red test for one user and green for another points to a user-specific bug. Adding a user to `sessionRoles` adds its tests with no spec edits. Separate CI builds per suite and user show those differences side by side.

## Running

`npm test <user>` runs every test for one user (smoke and regression). Totals: standard_user 13, problem_user 15, locked_out_user 1, plus 2 login setup tests that run before every filtered run. CI runs smoke and regression per user, not a combined job.

## Expected results

Smoke runs standard_user, problem_user and locked_out_user. Regression runs standard_user and problem_user. Each combination is its own run and report. standard_user is green. problem_user is red by design, so a run reports the seeded app bugs.

| Test (problem_user)     | Result                                                             | Bug                       |
| ----------------------- | ------------------------------------------------------------------ | ------------------------- |
| T1 login                | passes                                                             | none                      |
| T6, T7                  | red                                                                | BUG-05/07, BUG-09         |
| T8 catalog, detail page | red when picks include a BUG-03 product, always red on detail page | BUG-03, BUG-05/07, BUG-08 |
| T12                     | red at the postal code step (last name text lands in first name)   | BUG-02                    |
| T9 cart page            | passes                                                             | none                      |
| T9 catalog, detail page | red                                                                | BUG-04, BUG-06            |
| T10                     | red, every run                                                     | BUG-02                    |

Smoke is always red through T10. Regression uses a fixed seed that includes BUG-03 and BUG-04 products, so T8 and T9 are red there. T4 (BUG-15) runs for problem_user only, where it is red. T13 (BUG-01) also runs for problem_user only, so every standard_user run is green.

**Decision: problem_user-only tests.** T4 (BUG-15, username with spaces) and T13 (BUG-01, empty cart) run for problem_user only. BUG-01 is reported against standard_user and the requirement says checkout is not allowed for any user, so a standard_user run would be red too. The suite keeps standard_user as the green baseline for regressions, and the two known standard_user bugs stay visible through the problem_user run. Revisit if standard_user is no longer meant to be the green baseline.

## Not covering

| Condition                                        | Why not                                                                                                                             |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Separate "checkout info accepted" scenario       | Covered by T10, which runs the info step                                                                                            |
| PDF for problem_user                             | Blocked by BUG-02, can never reach the PDF button                                                                                   |
| PDF content                                      | Manual, per test plan. T11 checks the download only                                                                                 |
| error_user, performance_glitch_user, visual_user | Out of scope per test plan                                                                                                          |
| Cross-browser, mobile, load                      | Out of scope per test plan                                                                                                          |
| Images shown per product (BUG-10)                | Manual, per test plan                                                                                                               |
| Logout                                           | Not in the test plan or the coverage document                                                                                       |
| Side menu links (About, Reset App State)         | Not in the test plan or the coverage document                                                                                       |
| Checkout overview totals (subtotal, tax, total)  | Not in the test plan or the coverage document                                                                                       |
| Cancel buttons (cart, checkout steps)            | Not in the test plan or the coverage document                                                                                       |
| BUG-11 to BUG-14                                 | Seeded for performance_glitch_user and error_user. No test on purpose: those users are out of scope                                  |

## Explore instead

| Charter                                              | Why this is not a scripted test         |
| ---------------------------------------------------- | --------------------------------------- |
| Images match their product (BUG-10, visual)          | Needs human judgement, no stable oracle |
| PDF content matches the order                        | Plan says manual                        |
| Odd input in checkout fields (long, unicode, spaces) | No stated expected result               |

## Test data

- Only three users are used: `standard_user`, `problem_user`, `locked_out_user`. The other site users stay unused.
- Credentials are secrets. They come from env vars `BASE_URL`, `STANDARD_USER`, `PROBLEM_USER`, `LOCKED_OUT_USER` and `PASSWORD`, read from a gitignored `e2e/.env`. CI reads them from GitHub secrets. A fixture fails fast with a clear error naming the missing var. Products live in `e2e/data/products.ts`.
- Reviewer setup: a committed `e2e/.env.example` holds the five names with the demo values the login page publishes. The reviewer runs `cp .env.example .env` and nothing else to configure.
- Cart state is browser local storage, isolated per Playwright context. `require_test_data_cleanup` is met by a fixture teardown that resets app state through the menu, on the cart and checkout tests.
- Login: `auth.setup.ts` logs in once per user and saves the session cookie to gitignored `e2e/.auth/`. `loginAs` loads it, so only T1 to T4 use the login form. Each test gets its own context, so cart state stays isolated.
- Given steps that need products in the cart seed local storage directly instead of clicking through the catalog. Otherwise a catalog bug breaks setup and the failure points at the wrong step.
- Random picks come from a seeded helper reading `SEED`. Regression sets a fixed seed whose picks include BUG-03 products (Bolt T-Shirt, Fleece Jacket, Red T-Shirt) and BUG-04 products (Backpack, Bike Light, Onesie).
- No row depends on another, so tests run in parallel.

## Blocked / open

- Empty cart "can't be started": the app has no stated behavior (BUG-01 shows it proceeds). T13 asserts the user does not reach the checkout info page. Confirm this oracle.
- Seed value is chosen when generating, then checked against the 3-product removal pick.
- Known bugs stay red by design, see Expected results. CI runs one job per suite and user (5 jobs); problem_user jobs are red.

## README

Root `README.md`, written for a reviewer with nothing installed. Steps in order, each one command:

1. Get the code: `git clone <repo>` or download the ZIP and unzip.
2. Install Node.js 20 or newer (link).
3. `cd e2e && npm ci`
4. `npx playwright install chromium`
5. `cp .env.example .env` (Windows: `copy .env.example .env`)
6. Run: `npm run smoke`, `npm run regression`, or `npm test`, optionally followed by a user (`standard_user`, `problem_user`, `locked_out_user`, `all_users`).
7. Open the Allure report: `npm run report`.

Also in the README: what is red on purpose and why, how to replay a run with `SEED=<n>`, the folder layout, and how CI gets the same vars from GitHub secrets.

## Next

`/qa:generate qa/design/swag-labs.md` writes the tests.
