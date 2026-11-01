---
name: appliance-estimation
description: Use when adding, editing, or removing appliances, estimating consumption, the breakdown chart, the "not covered by your list" segment, the per-appliance efficiency check (star, age, nameplate, label), or the savings plan actions.
---

# Appliance Estimation (v2)

## Goal
Turn the household's own appliance list into honest, range-based estimates of where the bill's units likely went, and into ranked savings actions.

## Use this skill when
- Building the appliance manager (add, remove, edit quantity and hours, custom appliances).
- Rendering the breakdown or the "not covered" segment.
- Building the efficiency check or the savings plan.

## Do not use this skill when
- Parsing the bill (use `bill-math`) or designing the time editor (use `usage-schedule`).

## What changed from v1
- There is no separate fridge calculator and no sample household. The fridge is an ordinary appliance (`FRIDGE_DEF`) with an optional efficiency panel.
- Rows are `ApplianceEntry` objects (`src/lib/schedule.ts`), not `ApplianceSelection`. They have a unique `uid`, so duplicates and custom appliances work.

## Instructions
1. Estimate with `estimateEntry` (period units, range) and `estimateEntryByBlock`. Feed rows to the existing gap logic with `computeBreakdown(bill, metrics, [], entriesToExtras(entries, metrics.days))`.
2. Appliance manager: searchable picker from `APPLIANCES` plus the fridge; "Add custom appliance" asks for a name and running watts (typical value, optional range); remove with one tap and an undo toast; quantity stepper; usage editor per `usage-schedule`.
3. Efficiency check (`efficiencyCheck`) is optional per appliance. Inputs: age, star rating (only for categories with BEE labels per `APPLIANCE_META`), nameplate watts, label kWh per year, and for fridges capacity and type. It shows: current vs modern-equivalent annual kWh, estimated yearly saving as a range, a newness label, payback if a price is entered, and a verdict.
4. Confidence: `rough` (table), `label` (nameplate watts or label kWh typed), `measured` (stretch). Show the badge on every figure.
5. Do not offer model-number lookup; there is no reliable data behind it. If time allows, a "Photograph the label" button may reuse the extraction route to read stars, wattage and annual kWh, shown in an editable form like the bill.
6. Gap logic as before: always show the "Not covered by your list" segment; highlight it only when `status === "finding"`; handle `over-listed` and `roughly-explained` honestly.
7. Show the fix-first ladder (seal, defrost and coils, ventilation, temperature) for fridges before any replacement verdict. Replacement rarely pays back on electricity alone; show the real payback.
8. Actions come from `buildEntryActions` and `buildShiftActions`, ranked by rupees at the marginal rate; grid-only actions are labelled.

## Copy rules
Allowed: "estimated", "likely", "typical", "not covered by your list", "worth checking".
Not allowed: "detected", "found your", "identified", "wasting" as fact.

## Constraints
- Reference values in `src/data` are illustrative until verified; keep the flag and add sources.
- Never show a single precise-looking number where a range exists.
