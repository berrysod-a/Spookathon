---
name: usage-schedule
description: Use when building or changing the time-of-day usage editor, weekday/weekend hours, the 24-hour and weekly charts, time-of-day (peak) pricing, or time-aware savings actions.
---

# Usage Schedule

## Goal
Let families describe when they use each appliance (morning news, evening serials, fans at night) and turn that into a weekly profile, a 24-hour chart and, where it really applies, peak-time savings.

## Use this skill when
- Editing the hours input for an appliance.
- Rendering the 24-hour chart, weekly chart, peak share, or the time-of-day note.
- Adding actions that move usage between time blocks.

## Do not use this skill when
- Changing bill parsing or the marginal rate (use `bill-math`).

## Instructions
1. Time blocks live in `src/data/timeBlocks.ts`: early morning (4 to 6 am), morning (6 am to 12 pm), afternoon (12 to 6 pm), evening (6 to 10 pm), night (10 pm to 4 am). Each block sits inside one tariff zone. Never hardcode block hours in components; read them from the config because KSEB has proposed changing peak timings.
2. Each appliance entry holds `usage: { weekday, weekend }`, hours per block. The editor shows five chips or small sliders per day type, capped at the block length, with a "same every day" switch. Preset starting values come from `defaultUsageFor`.
3. Weekly average hours per day = (5 x weekday hours + 2 x weekend hours) / 7. All estimates feed this into `estimateEntry`; per-block figures come from `estimateEntryByBlock`.
4. Charts: a 24-hour radial or bar chart of estimated units by block (stacked by appliance), and a seven-bar weekly chart from `weeklyProfile`. Both are labelled "Estimated from your hours".
5. Time-of-day pricing:
   - It applies only when monthly units (units / days x 30) exceed 250, using `todApplies`.
   - Multipliers: day 0.9, peak 1.25, night 1.0, applied to the energy charge only (assumption: verify against the current tariff order and keep it labelled).
   - If it does not apply, say plainly: "Your usage level does not have peak pricing, so shifting will not change your bill. It still helps the grid at peak."
6. Shift actions (`buildShiftActions`) always carry the "helps the grid" tag. Rupees are non-zero only under time-of-day pricing.
7. Time-aware savings are ranked together with the normal actions, by rupees; grid-only actions sit in their own labelled group.

## Honesty rules
- The bill cannot confirm when power was used. Say the time chart is the household's own report, not a measurement.
- Never say "peak-time waste detected". Say "Most of your estimated use is between 6 and 10 pm".
- Peak-hour timings and multipliers are configuration, shown with their source.

## Constraints
- Hours per block are clamped to block length; hours per day never exceed 24.
- Do not invent weekly patterns; use only what the user entered or the labelled presets.
