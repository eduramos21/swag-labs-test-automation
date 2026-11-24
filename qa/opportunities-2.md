# Opportunities 2: swag-labs-test-automation

Written 2026-11-24. Compares the repo now (`f17574c`) with `qa/opportunities.md` (written at `44cea1b`, 9 commits ago).

## Is the project better now?

Yes, a little. It is better in hygiene and docs. It is the same in test signal. No big risk closed.

| Area | Before | Now | Verdict |
|---|---|---|---|
| Repo hygiene (risk 9) | `.claude/` untracked, README and `run.js` uncommitted | `.claude/`, `.playwright-cli/` and `.playwright-mcp/` in `.gitignore`. `git status` clean | Better. Q1 done |
| Stale docs (risk 10, G) | README said 31 tests, wrong per-user counts | README rewritten. Test counts match `--list` (73 runs with 5 setup tests). Smoke inside regression is documented | Better. G half done: `qa/design/swag-labs.md:6` still says "never both" |
| Login setup (risk 8) | Bare `npx playwright test` logged in all users (`shortcut:` comment) | `auth.setup.ts` filters by `RUN_USER`. No shortcut comment left | Better. Risk closed for runs through the runner |
| Empty-cart oracle (risk 3) | Passed on any redirect | Also checks the checkout form is absent (`checkout.spec.ts`). Still marked provisional | Slightly better. Expected behavior still undefined |
| Cart test (risk 6) | One test, 4 BUG tags | Same: 4 tags on one test (`cart.spec.ts:15`) | Same |
| Naming | `rng` | `productPicker` | Better to read, no effect on results |
| Headed runs, screenshots | Viewport screenshots hide the cart | `fullPage: true` screenshots, headed user arg fixed | Better for debugging |
| New problem_user failures (risk 1) | Do not fail the build | Same. `continue-on-error` still on `problem_user` | Same. Biggest open risk |
| Static BUG tags (risk 4) | `--grep @BUG-02` returns green and red tests | Same | Same |
| Seed in Allure header (Q5) | Missing | Missing | Same |
| CI users (F) | 3 of 6 users in CI | Same | Same |
| CI order (E) | Smoke and regression in parallel | Same | Same |
| Tag check (M1), priority labels (M2), detail page check (M3) | Open | Open | Same |

Net: the cheap items moved (Q1, G mostly, risk 8). Every item that changes what a red build means (A, Q2, M1, E, F) is still open. The suite is easier to run and read. It is not more trustworthy as a release signal.

## Problems with the old document

- It cites `qa/audit/2026-11-23-4.md`. That file is deleted. Only `qa/audit/2026-11-23.md` remains. Fix the header of `opportunities.md` or drop the reference.
- Q1 is listed as "Next". It is done.
- Risk 8 and risk 9 are closed. Risk 10 is mostly closed.
- Section 3 item 7 (flaky image check) and the "Do this first" repeat run have no result recorded anywhere. Nobody has shown 75 of 75 passing.

## Opportunities 2

Ranked by cost over effort. Items keep their old id when they carry over.

### Quick (under 15 minutes each)

| # | Opportunity | Why | Time |
|---|---|---|---|
| Q2 | `@BUG-nn` tags on `problem_user` tests only | Still open. Prerequisite for A | 15 min |
| Q5 | Add `seed` to `environmentInfo` in `playwright.config.ts` | Still open. The Allure header shows suite and user, not seed | 5 min |
| N1 | Fix `qa/design/swag-labs.md:6` ("never both") | Last stale rule. Matches D7 | 2 min |
| N2 | Fix the dead audit reference in `qa/opportunities.md`. Mark Q1 done | A reader opens a file that does not exist | 2 min |
| N3 | Point `qa.config.yml` `requirements.path` at the right folder, or confirm `docs/requirements/` is the intended one | It exists now (2 files). Check that tools read it | 5 min |

### Medium (30 minutes to 2 hours)

| # | Opportunity | Why | Time |
|---|---|---|---|
| M1 | `check-tags.js` rejects BUG ids not in `docs/requirements/3- Bug Report.md` | Open. The script already walks all tags, so it is a small add | 30 min |
| M2 | Allure priority and severity labels from the bug report | Open | 1 hour |
| M3 | Detail page: image, price, description, not name only | Open | 1 hour |
| N4 | Split the 4-tag cart test (`cart.spec.ts:15`) into one test per bug, or one assertion group per bug | Risk 6. Today the first bug hides the other three | 1 hour |
| M5 | `standard_user` empty-cart and spaces tests in a non-blocking job | Open. Needs decision D4 | 30 min |

### Larger

| # | Opportunity | Why | Time |
|---|---|---|---|
| A | Expected-failures gate for `problem_user` jobs | Biggest open risk. Do Q2 first | 1 hour |
| E | CI order: smoke first, then regression | Open | 30 min |
| F | CI jobs for `performance_glitch_user`, `error_user`, `visual_user` | Open. Three users never run in CI | 30 min |
| D | Tests for logout, menu links, checkout totals, cancel | Open. Totals first | 30 min each |
| C | PDF text check | Open. Needs a PDF dependency | 2 hours |

Dropped: B stays declined (2026-11-23).

## Do this first

1. Run `cd e2e && npm run test -- standard_user --repeat-each=5`. Expect 70 passed (14 runs per pass with the setup test, per the README, x 5; the old document said 75). Write the result in `qa/`. It is the only proof for D16.
2. Then Q2, then A. Together they turn `problem_user` reds from noise into a gate. About 75 minutes.

## Not checked

I did not run the suite. All comparisons come from reading code, git history and `--list`. The `--repeat-each` result is unknown.
