---
name: appliance-estimation
description: Use when estimating appliance or fridge consumption, building the appliance picker, the breakdown chart, the "not covered by your list" segment, the savings plan actions, or the fridge replace-or-keep calculator.
---

# Appliance Estimation

## Goal
Turn a short appliance list into honest, range-based estimates of where the bill's units likely went, and into actions with rupee savings.

## Use this skill when
- Adding or editing appliances, defaults, or the fridge table.
- Rendering the breakdown, the unaccounted segment, or forgotten-appliance prompts.
- Building the savings plan or the replace-or-keep view.

## Do not use this skill when
- Parsing or validating the bill itself (use `bill-math`).

## Instructions
1. Formula: units = qty x watts x duty x hours/day x days / 1000, evaluated at low, typical and high values. Implemented in `estimateAppliance`.
2. Every figure shown to the user is a range with an "Estimate" badge. Confidence levels: `rough` (our table), `label` (user typed the BEE label kWh), `measured` (meter test or plug, stretch).
3. Fridge: use `fridgeExtraItem` for the breakdown and `fridgeReplaceOrKeep` for the decision. Baseline from the label kWh if entered, otherwise the table x star factor; then the age factor. Age and star factors are assumptions and are labelled as assumptions in the UI.
4. Gap logic is in `computeBreakdown`:
   - Always draw the "Not covered by your list" segment (typical value, with its range).
   - Highlight it as a finding only if `status === "finding"`.
   - If `status === "over-listed"`, show how many units the list exceeds the bill by and ask the user to revisit the widest-range items (usually AC or geyser hours).
   - If `status === "roughly-explained"`, say so; do not invent a mystery.
5. Forgotten-appliance strip (water pump, second fridge or freezer, geyser, inverter or UPS): ticking one adds it to the list and the segment visibly shrinks.
6. Savings plan: actions come from `buildActions`, ranked by rupees saved. Progress uses `planProgress`. Free actions are tagged so renters can filter to them.
7. Replace-or-keep verdicts: show the fix-first ladder before any replacement advice. Replacing a working fridge rarely pays back on electricity alone; the UI must say what the payback actually is.

## Copy rules
Allowed: "estimated", "likely", "typical", "not covered by your list", "worth checking".
Not allowed: "detected", "found your", "identified", "wasting", "hidden load" stated as fact.

## Constraints
- Reference values in `src/data` are illustrative until verified. Do not remove the "illustrative" flag without adding a source.
- Do not add a precise-looking single number where a range exists.
