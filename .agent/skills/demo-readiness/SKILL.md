---
name: demo-readiness
description: Use when preparing, testing or rehearsing the hackathon demo: fallbacks, offline behaviour, sample data, smoke tests, performance, and the two-minute demo script.
---

# Demo Readiness

## Goal
The demo works on stage even if the network, the API key, or the OCR fails.

## Use this skill when
- Wiring the upload flow, error states, or the sample bill path.
- Writing smoke tests or the final checklist.

## Instructions
1. Offline path: "Use sample bill" fills the confirm form from `SAMPLE_BILL`; "Try a sample household" fills appliances from `DEMO_SELECTIONS` and `DEMO_FRIDGE`. Both work with no network.
2. Extraction failure (network error, schema mismatch, timeout over 20 s): show a short message and open the manual form with any parsed fields prefilled. Never block the user.
3. Always show the confirm screen before the dashboard, even when extraction succeeds.
4. Smoke test (must pass before demo): sample bill, confirm, dashboard shows 4.61 per extra unit and about 12% fixed; demo household shows a "not covered" finding; adding the water pump shrinks it; setting a 200 rupee target and ticking three actions moves the bar; fridge view shows the fix-first ladder and a payback in years.
5. Performance: first meaningful paint under 2 s on a mid-range phone; lazy-load the Waves background and keep it off the dashboard routes.
6. Deploy early (Vercel or similar) and test the live URL on a phone.

## Demo script (2 minutes)
1. Upload or choose the sample bill; decoded view in seconds.
2. "One extra unit really costs 4.61 rupees, and 12% of this bill is fixed."
3. Sample household: show estimated breakdown and the "not covered" segment; tick the water pump and watch it shrink.
4. Set a 200 rupee goal, tick three actions, watch the bar fill.
5. Open the fridge view: fix-first steps, then honest payback.

## Constraints
- Never claim detection or measurement on stage.
- Have the answer to "how accurate is this?" ready: estimates with ranges, labelled as such, and a meter test or plug to confirm.
