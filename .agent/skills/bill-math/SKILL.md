---
name: bill-math
description: Use when computing, displaying, or validating anything derived from the electricity bill: units per day, cost per unit, fixed vs variable split, marginal rate, savings in rupees, bill validation checks, or the sample-bill expected values.
---

# Bill Math

## Goal
Keep every number on screen consistent with one set of formulas, and make sure savings are never overstated.

## Use this skill when
- Showing or computing cost per unit, units per day, average watts, fixed share, or any rupee saving.
- Building or changing the confirm screen validation.
- Writing tests for the calculation engine.

## Do not use this skill when
- Estimating appliance consumption (use `appliance-estimation`).
- Styling or layout work (use `dashboard-ui`).

## Instructions
1. Import from `src/lib/calc.ts`. Never copy formulas into components.
2. Definitions (all from the bill):
   - days = present reading date minus previous reading date
   - unitsPerDay = units / days
   - avgWatts = units x 1000 / (days x 24)
   - variableTotal = energy charge + fuel surcharge + auto recovery surcharge + electricity duty
   - **marginalRate = variableTotal / units** (use this for ALL savings)
   - allInRate = total / units (display only, never for savings)
   - fixedShare = fixed charge / total
3. Show three rates side by side on the dashboard so users see why they differ: energy rate alone, all-in rate, true cost of one extra unit.
4. Validation on the confirm screen: units must equal present minus previous reading (tolerance 0.5); charges must sum to the total within 1 rupee (include other charges and round off). Mismatches are red errors on the specific field.
5. If verified KSERC slab rates become available, add them behind an optional `tariff` module that returns the marginal rate for the user's slab. Until then use the flat marginal rate and say so in the UI.

## Expected values for the sample bill (use as test fixtures)
- days 61, unitsPerDay about 4.61, avgWatts about 192
- variableTotal 1294.85, marginalRate about 4.608, allInRate about 5.242, fixedShare about 12.1%
- A 50 W always-on device: 438 kWh a year, about 2,018 rupees at the marginal rate
- A 200 rupee target is about 43 units

## Constraints
- Never present the all-in rate as "what you save per unit".
- Never round intermediate values; round only when formatting.
