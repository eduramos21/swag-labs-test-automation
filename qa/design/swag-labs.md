# Swag Labs test design

Requirement: Qualyfize-assignment files 1-4 (Obsidian, Interview-Prep-Qualifyze). Designed: 2026-11-22

Decisions: plain Playwright (no playwright-bdd), page objects as fixtures, known bugs stay red,
seeded random products (`SEED` env, logged as report attachment), BUG tags in titles.

## Coverage

L = likelihood, C = cost, 1 to 3. All rows are e2e: the app is a black box, no API or unit layer exists.

| ID | Condition | From | Technique | L | C | Risk | Layer | Automate | Exists |
|---|---|---|---|---|---|---|---|---|---|
| T1 | standard_user and problem_user log in and see products page (2 rows) `@smoke` | Login | flow | 1 | 3 | 3 | e2e | yes | no |
| T2 | locked_out_user sees lock message, cannot reach products `@smoke @OBS-01` | Login | rules | 2 | 3 | 6 | e2e | yes | no |
| T3 | Wrong password / unknown user shows mismatch error (2 rows, no setup cost) | Login | EP | 2 | 3 | 6 | e2e | yes | no |
| T4 | Username with surrounding spaces logs in `@BUG-15` (standard_user) | Login | boundary | 2 | 1 | 2 | e2e | yes | no |
| T5 | Catalog shows image, title, price, description, add button (standard_user) | Product display | EP | 1 | 2 | 2 | e2e | yes | no |
| T6 | 3 random products open their own detail page, one test per user, soft asserts `@BUG-05 @BUG-07` | Product display | EP | 3 | 2 | 6 | e2e | yes | no |
| T7 | Every sort option orders the list, one test per user, soft asserts `@BUG-09` | Sort | EP | 2 | 1 | 2 | e2e | yes | no |
| T8 | Keep shopping, add 2 more to a cart of 1; badge 3, cart lists 3 (catalog, detail page; both users; catalog rows `@smoke`) `@BUG-03 @BUG-05 @BUG-07 @BUG-08` | Cart | combinations | 3 | 3 | 9 | e2e | yes | no |
| T9 | Remove 3 products from cart page, catalog, detail page; cart empty (both users; cart page rows `@smoke`) `@BUG-04 @BUG-06` | Cart | combinations | 3 | 3 | 9 | e2e | yes | no |
| T10 | Full order: cart, info, overview (lists product, quantity, description), finish, confirmation; both users `@smoke @BUG-02` | Checkout, Finish | flow | 3 | 3 | 9 | e2e | yes | no |
| T11 | standard_user order then generate PDF: a `order_*.pdf` download is non-empty (merged into T10 run) | PDF | flow | 2 | 2 | 4 | e2e | yes | no |
| T12 | Required fields: empty submit shows first name, then last name, then postal code error (one test, standard_user) | Checkout | decision table | 2 | 2 | 4 | e2e | yes | no |
| T13 | Empty cart cannot start checkout (standard_user) `@BUG-01` | Checkout | rules | 3 | 2 | 6 | e2e | yes | no |

Test count: T1 2, T2 1, T3 2 rows, T4 1, T5 1, T6 2, T7 2, T8 4, T9 6, T10 2, T11 0 extra, T12 1, T13 1 = 25 tests (was 43 rows).

## Expected results

Smoke and regression both run standard_user and problem_user. standard_user is green. problem_user is red by design, so a run reports the seeded app bugs.

| Test (problem_user) | Result | Bug |
|---|---|---|
| T1 login | passes | none |
| T6, T7 | red | BUG-05/07, BUG-09 |
| T8 catalog, detail page | red when picks include a BUG-03 product, always red on detail page | BUG-03, BUG-05/07, BUG-08 |
| T9 cart page | passes | none |
| T9 catalog, detail page | red | BUG-04, BUG-06 |
| T10 | red, every run | BUG-02 |

Smoke is always red through T10. Regression uses a fixed seed that includes BUG-03 and BUG-04 products, so T8 and T9 are red there. T4 (BUG-15) is red for standard_user in regression.

## Not covering

| Condition | Why not |
|---|---|
| problem_user rows for T1, T4, T5, T12, T13 | Same code path as standard_user, no user-specific behavior. problem_user is still covered where its bugs live (T6, T7, T8, T9, T10) |
| Separate "checkout info accepted" scenario | Covered by T10, which runs the info step |
| PDF for problem_user | Blocked by BUG-02, can never reach the PDF button |
| PDF content | Manual, per test plan. T11 checks the download only |
| error_user, performance_glitch_user, visual_user | Out of scope per test plan |
| Cross-browser, mobile, load | Out of scope per test plan |
| Images shown per product (BUG-10) | Manual, per test plan |

## Explore instead

| Charter | Why this is not a scripted test |
|---|---|
| Images match their product (BUG-10, visual) | Needs human judgement, no stable oracle |
| PDF content matches the order | Plan says manual |
| Odd input in checkout fields (long, unicode, spaces) | No stated expected result |

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
- Known bugs stay red by design, see Expected results. CI runs smoke then regression and reports both red.

## README

Root `README.md`, written for a reviewer with nothing installed. Steps in order, each one command:

1. Get the code: `git clone <repo>` or download the ZIP and unzip.
2. Install Node.js 20 or newer (link).
3. `cd e2e && npm ci`
4. `npx playwright install chromium`
5. `cp .env.example .env` (Windows: `copy .env.example .env`)
6. Run: `npm run smoke`, `npm run regression`, or `npm test`.
7. Open the report: `npm run report`.

Also in the README: what is red on purpose and why, how to replay a run with `SEED=<n>`, the folder layout, and how CI gets the same vars from GitHub secrets.

## Next

`/qa:generate qa/design/swag-labs.md` writes the tests.
