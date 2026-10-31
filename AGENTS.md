# AGENTS.md: Electricity Bill Analyser & Planner

Project rules for any coding agent working in this repo. Read before changing anything.

## What this app is
A web app where a household uploads a KSEB electricity bill and gets (1) the bill decoded in plain language, (2) the true cost of one extra unit, (3) an estimated appliance breakdown with ranges, and (4) a savings plan toward a rupee target. No hardware. No accounts.

## Non-negotiable rules
1. **Honesty.** The app estimates; it never detects or measures. Never write copy that says it "detects", "finds", or "identifies" an appliance, a leak, or theft. Use "estimated", "likely", "not covered by your list".
2. **One savings rate.** Every rupee saving uses `billMetrics(bill).marginalRate` (variable charges / units). Never use the all-in rate (`total / units`) or the energy rate alone for savings.
3. **Ranges, not points.** Appliance and fridge figures are `Range` objects (low / typ / high). Show ranges in the UI with an "Estimate" badge.
4. **Gap wording.** The leftover is called "Not covered by your list" (or "Unaccounted energy"). It is highlighted as a finding only when `breakdown.status === "finding"` (low end above zero).
5. **Fallbacks stay.** The "Use sample bill" button, the manual entry form, and the demo household preset must work with no network and no API key.
6. **Source labels.** Reference data (wattages, fridge table, tariffs) carries a source string and shows it in the UI. Illustrative values are marked as such until verified.
7. **No secrets in the client.** The vision API key lives in a server route only.

## Where things live
- `src/lib/calc.ts`: all maths. Pure functions. Do not re-implement formulas in components.
- `src/lib/types.ts`: shared types. `src/lib/extraction.ts`: zod schema and extraction prompt.
- `src/data/*`: appliance table, fridge table, upgrades, sample bill, demo household.
- `.agent/skills/*`: task skills (bill-math, appliance-estimation, dashboard-ui, demo-readiness).

## Commands
Install: `npm i`. Dev: `npm run dev`. Tests: `npm test` (vitest). Type check: `npx tsc --noEmit`.

## Definition of done for any change
Type check passes, unit tests pass, the sample-bill path works end to end offline, and no new copy breaks rule 1.
