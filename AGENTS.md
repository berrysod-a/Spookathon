# AGENTS.md: Electricity Bill Analyser & Planner

Project rules for any coding agent working in this repo. Read before changing anything.

## What this app is
A web app where a household uploads a KSEB electricity bill and gets (1) the bill decoded in plain language, (2) the true cost of one extra unit, (3) an estimated appliance breakdown with ranges, and (4) a savings plan toward a rupee target. No hardware. No accounts.

## Non-negotiable rules
1. **Honesty.** The app estimates; it never detects or measures. Never write copy that says it "detects", "finds", or "identifies" an appliance, a leak, or theft. Use "estimated", "likely", "not covered by your list".
2. **One savings rate.** Every rupee saving uses `billMetrics(bill).marginalRate` (variable charges / units). Never use the all-in rate (`total / units`) or the energy rate alone for savings.
3. **Ranges, not points.** Appliance and fridge figures are `Range` objects (low / typ / high). Show ranges in the UI with an "Estimate" badge.
4. **Gap wording.** The leftover is called "Not covered by your list" (or "Unaccounted energy"). It is highlighted as a finding only when `breakdown.status === "finding"` (low end above zero).
5. **Fallbacks stay, invisible.** The manual entry form works with no network and no API key. The sample bill and demo appliances load only through the hidden demo link (`/?demo=<token>`). No visible button, link or hint offers them, and the parameter is removed from the address bar after loading.
6. **Source labels.** Reference data (wattages, fridge table, tariffs) carries a source string and shows it in the UI. Illustrative values are marked as such until verified.
7. **No secrets in the client.** The vision API key lives in a server route only.

8. **Everything translates.** Every visible string goes through `t()` (English and Malayalam). No literal English in JSX or in strings returned from `calc.ts` or `schedule.ts` (return keys and values). Switching to Malayalam must leave no English except units, brand names and numbers.
9. **Time data is the household's own report.** The bill cannot confirm when power was used. Peak-time rupee savings appear only when monthly units exceed 250; otherwise shifting is shown as helping the grid.
10. **No separate fridge calculator and no sample household UI.** The fridge is an ordinary appliance with an optional efficiency panel.

## Where things live
- `src/lib/calc.ts`: all maths. Pure functions. Do not re-implement formulas in components.
- `src/lib/schedule.ts`: appliance entries, time blocks, weekly usage, time-of-day costing, efficiency check, entry-based actions.
- `src/i18n/en.ts`, `src/i18n/ml.ts`: all visible text.
- `src/lib/types.ts`: shared types. `src/lib/extraction.ts`: zod schema and extraction prompt.
- `src/data/*`: appliance table, fridge table, upgrades, sample bill, demo household.
- `.agent/skills/*`: task skills (bill-math, appliance-estimation, usage-schedule, i18n-malayalam, dashboard-ui, demo-readiness).

## Commands
Install: `npm i`. Dev: `npm run dev`. Tests: `npm test` (vitest). Type check: `npx tsc --noEmit`.

## Definition of done for any change
Type check passes, unit tests pass, the sample-bill path works end to end offline, and no new copy breaks rule 1.
