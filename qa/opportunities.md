# Opportunities: swag-labs-test-automation

Written 2026-11-23. Built from `qa/audit/2026-11-23-4.md`, `qa/design/swag-labs.md`, the CI workflow and the test code.

## Do this first

Run `cd e2e && npm run test -- standard_user --repeat-each=5`. It runs every `standard_user` test 5 times in parallel. All 75 runs must pass. Time: 1 minute.

Then pick one item from "Opportunities" below.

---

## 1. How to test `fullyParallel`

`fullyParallel: true` is set in `e2e/playwright.config.ts`. It is only safe if no test depends on another test.

1. Run `cd e2e && npm run test -- standard_user --repeat-each=5`. Expect: 75 passed, 0 flaky. (1 min)
2. Run `npm run test -- all_users --workers=1`, then `--workers=4`. Same tests must pass and fail in both runs. (2 min)
3. Run `npm run test -- problem_user --repeat-each=3`. Expect: the same 10 tests red every time, in the same places. (2 min)
4. Read the first line of output: `Running N tests using X workers`. X above 1 means parallel is active.
5. Run step 1 again on GitHub (push, open the Actions tab). CI machines are slower and show timing flakes your laptop hides.

A pass means: same results at 1 and at 4 workers, and zero tests marked `flaky`.
A fail means: a test shares state with another test. Run that test alone with `--repeat-each=10` to find it.

Known weak spot: `catalog.spec.ts` "products show their key information" failed before when images loaded slowly under parallel workers.

## 2. Parallel vs not parallel

| | `fullyParallel: false` (before) | `fullyParallel: true` (now) |
|---|---|---|
| Tests in different files | Run in parallel | Run in parallel |
| Tests in the same file | Run one after another, in one worker | Run in parallel, in any worker |
| Order inside a file | Fixed, top to bottom | Not guaranteed |
| Speed | `cart.spec.ts` (10 tests) and `login.spec.ts` (9) are the slow files | Total time drops. Gain is small today (about 45 s run) and grows with each new user |
| Risk | Hides order dependence between tests | Exposes it. A hidden dependency shows as a random failure |
| Load on the site | Lower | Higher. More sessions on saucedemo.com at the same time |

Worker count is separate. Playwright uses half the CPU cores by default, locally and in CI. A GitHub `ubuntu-latest` runner has 2 to 4 cores, so 1 to 2 workers. `fullyParallel` only lets tests use those workers. It does not add workers.

Why it is safe here: each test gets its own browser context, so cart state (browser local storage) is isolated. The login session in `e2e/.auth/` is read-only during tests. Cart contents come from `seedCart`, not from another test. The design says "no row depends on another".

## 3. Risks living in the suite now

Ranked by cost if it goes wrong.

1. **New `problem_user` failures do not fail the build.** `continue-on-error` on those jobs (`.github/workflows/e2e.yml:16`). A regression in a test that passes today shows only in the Allure artifact. Mitigation: read the artifact, or add the expected-failures gate (opportunity A).
2. **CI never ran on GitHub with this setup.** The 5 secrets (`BASE_URL`, `STANDARD_USER`, `PROBLEM_USER`, `LOCKED_OUT_USER`, `PASSWORD`) must exist. Run 45211067684 is from before the latest changes.
3. **The app under test is an external site.** saucedemo.com can change or go down. Tests have no control over it. A site change fails tests with no code change.
4. **Weak checks pass on the wrong thing.**
   - PDF test: file name matches and size is above 0 (`checkout.spec.ts:65-71`). A blank PDF passes.
   - Empty-cart test: passes on any redirect (`checkout.spec.ts:127-135`). The expected behavior is not defined.
   - Detail page check compares the product name only.
5. **BUG tags are static.** The green `standard_user` twin carries the same `@BUG-nn` as the red `problem_user` test. `--grep @BUG-02` returns both. Nothing checks tags against the bug report.
6. **Random picks.** `SEED=9` is deterministic. `SEED=off`, or a raw `npx playwright test`, picks different products each run and shows different reds. BUG-08 appears only when Fleece Jacket is picked.
7. **One test carries 4 BUG tags** (`cart.spec.ts:15`). It fails at the first bug, so it cannot show which of 03, 05, 07, 08 are fixed.
8. **Known flaky check:** `catalog.spec.ts` image visibility under parallel workers.
9. **Setup logs in both users on every run**, even a `standard_user`-only run. Small time cost, extra load.
10. **Repo hygiene:** `.claude/` and `.playwright-mcp/` are untracked and not in `.gitignore`. Today's changes and `qa/audit/` reports are uncommitted.

## 4. Opportunities

Ranked by cost over effort. Max 5 per group.

### Quick (under 15 minutes each)

| # | Opportunity | Why | Time |
|---|---|---|---|
| Q1 | Add `.claude/` and `.playwright-mcp/` to `.gitignore` | Stops them from being committed by accident | 2 min |
| Q2 | Put `@BUG-nn` tags on `problem_user` tests only (helper in `e2e/data/`) | Fixes risk 5. `--grep @BUG-02` then returns only red tests | 15 min |
| Q3 | Move the duplicated "on the checkout information step" Given into a fixture (`checkout.spec.ts:23-28`, `:82-87`) | One place to change | 10 min |
| Q4 | Document the unseeded bare command in the README, or default the seed in `playwright.config.ts` | Raw runs match CI | 5 min |
| Q5 | Add `seed` to `environmentInfo` in `playwright.config.ts` (`SEED ?? "random"`) | The Allure header shows the seed mode | 5 min |

### Medium (30 minutes to 2 hours)

| # | Opportunity | Why | Time |
|---|---|---|---|
| M1 | `check-tags.js` rejects BUG ids not in `docs/requirements/3- Bug Report.md` | A typo in a tag passes today | 30 min |
| M2 | Add priority and severity labels in Allure from the bug report | The plan promises a report sorted by priority | 1 hour |
| M3 | Detail page: check image, price and description, not name only | Matches `2- Test Cases` | 1 hour |
| M4 | Finish-order test: assert the text "Thank you for your order!", not only that the header is visible | Weak oracle today | 15 min |
| M5 | Run `standard_user` for the empty-cart and username-with-spaces tests, red, in a separate non-blocking job | Records BUG-01 and BUG-15 for the user the bug report names. Needs a decision, see decision D4 | 30 min |

### Larger

| # | Opportunity | Why | Time |
|---|---|---|---|
| A | Expected-failures gate for `problem_user` jobs: fail the job only on a failure with no `@BUG` tag | Closes risk 1. Do Q2 first | 1 hour |
| B | Deterministic Fleece Jacket test for BUG-07 and BUG-08 | BUG-08 is "partial" today. **Declined by the user on 2026-11-23.** Kept here for the record | 1 hour |
| C | PDF text check | Closes the PDF weak oracle. Needs a PDF parsing dependency. The test plan says PDF content is manual | 2 hours |
| D | Tests for logout, menu links, checkout totals, cancel buttons | Not in either requirements file. Totals are the likeliest to matter | 30 min each |
| E | CI order: smoke first, then regression | The test plan says so. Today both run in parallel | 30 min |

### Not worth doing

- Lower layers (API, unit). The app is a black box on an external site.
- Cross-browser, mobile, load tests. Out of scope per the test plan.
- Tests for `error_user`, `performance_glitch_user`, `visual_user`. Out of scope (see D2).

## 5. Decisions and why

From `qa/design/swag-labs.md` and this session.

| # | Decision | Why |
|---|---|---|
| D1 | Plain Playwright, no playwright-bdd. Page objects as fixtures | Less tooling. Fixtures give setup and teardown per test |
| D2 | Users: `standard_user`, `problem_user`, `locked_out_user` only. BUG-10 to BUG-14 have no test | The test plan puts `error_user`, `performance_glitch_user` and `visual_user` out of scope. Images (BUG-10) are manual |
| D3 | `problem_user` tests stay red. No `skip`, no `test.fail` | Red is the report of a real bug. Hiding it removes the signal |
| D4 | Empty-cart (BUG-01) and username-with-spaces (BUG-15) tests run for `problem_user` only | Keeps every `standard_user` run green, so a red `standard_user` always means something new. BUG-01 is reported against `standard_user`, so those bugs show only through `problem_user` |
| D5 | Every test runs for every user and is tagged `@${user}`. Exactly one user tag per test (`npm run check:tags`) | The same test for each user shows user-specific bugs side by side. A new user in `sessionRoles` adds its tests with no spec edits |
| D6 | Locked-out login test is `@smoke` only, runs for `locked_out_user` only | That user can never log in, so a loop has no meaning. Decided by the user |
| D7 | Smoke tests also carry `@regression` (commit 497320c). The first design said a test is one or the other, never both | The regression suite now includes smoke, so one regression run covers everything. The design header still has the old rule, update it |
| D8 | BUG tags are Playwright `tag`, not in titles | Titles stay readable. `--grep` works on tags |
| D9 | Seeded random products (`SEED`, default 9). `SEED=off` for random. Seed attached to each test report | Same failures on every run, replay with `SEED=<n>` |
| D10 | Seed 9 includes BUG-03 and BUG-04 products | Regression always shows those bugs |
| D11 | Cart seeded through local storage (`seedCart`), not by clicking the catalog | A catalog bug must not break the setup of an unrelated test |
| D12 | Login once per user in `auth.setup.ts`, session saved in `e2e/.auth/` | Only the login tests use the login form. Faster, fewer failure points |
| D13 | Credentials from env vars and GitHub secrets. `.env.example` holds the published demo values | No secrets in the repo. A reviewer sets up with one `cp` |
| D14 | CI: one job per suite and user (5 jobs), `fail-fast: false`, Allure artifact per job | Per-user results side by side. One red job does not cancel others |
| D15 | `continue-on-error` for `problem_user` jobs only (2026-11-23, option A) | Known reds cannot hide a real failure in `standard_user` or `locked_out_user`, which still turn the build red. Trade-off: risk 1 |
| D16 | `fullyParallel: true` (2026-11-23) | Tests are independent, so same-file tests can run together. See section 2 |
| D17 | Allure is the default report, with Playwright traces | Traces open from the report for failed tests |
| D18 | PDF checked by file name and size only | The test plan says PDF content is manual |

## Next

Open `.gitignore` and add `.claude/` and `.playwright-mcp/` (Q1, 2 minutes).
