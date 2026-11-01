---
name: demo-readiness
description: Use when preparing, testing or rehearsing the hackathon demo: the hidden demo link, offline fallbacks, smoke tests, performance, and the two-minute demo script.
---

# Demo Readiness (v2)

## Goal
The demo works on stage even if the network, the API key, or extraction fails, without any visible "sample" buttons.

## Use this skill when
- Wiring the upload flow, error states, or the hidden demo link.
- Writing smoke tests or the final checklist.

## Instructions
1. **Hidden demo link.** Visiting `/?demo=<token>` (token from `NEXT_PUBLIC_DEMO_TOKEN`, default `ksb26`) loads `SAMPLE_BILL` and `DEMO_ENTRIES`, jumps to the confirm step, and then removes the parameter from the address bar with `history.replaceState`. No button, link, tooltip, keyboard hint, sitemap entry or text anywhere in the UI mentions it. Do not log it to the console.
2. No visible "Use sample bill" or "Try a sample household" anywhere.
3. Extraction failure (network error, schema mismatch, timeout over 20 s): show a short, specific message and open the manual form with parsed fields prefilled. Never block the user.
4. Always show the confirm screen before the analysis, even when extraction succeeds.
5. Smoke test before demo (run through the hidden link and once with a real photo):
   - Confirm screen shows editable fields, a green "adds up" state, and one "Confirm and continue" button.
   - Flow continues downward with no manual scroll-up; earlier steps collapse with an Edit button.
   - Decoded view shows about 4.61 rupees per extra unit and about 12% fixed.
   - Adding, removing and editing an appliance changes the breakdown immediately.
   - Time-block editor updates the 24-hour chart; the sample household is not on peak pricing, so the note says so.
   - Water pump added to the demo list closes the "not covered" finding.
   - Fridge efficiency panel shows the fix-first ladder and a long payback.
   - Malayalam toggle: walk every screen; no English words remain except units and numbers.
6. Performance: first meaningful paint under 2 s on a mid-range phone; lazy-load the Waves background and keep it off the analysis sections.
7. Deploy early and test the live URL on a phone, including the hidden link.

## Demo script (2 minutes)
1. Photo of the bill, confirm the numbers.
2. "One extra unit really costs 4.61 rupees; 12% of this bill is fixed."
3. Add the family's appliances; set the evening serials and night fans; show the 24-hour chart and the "not covered" segment.
4. Open the fridge efficiency panel: fix-first steps, then honest payback.
5. Set a goal, tick actions, watch the bar fill; switch to Malayalam.

## Constraints
- Never claim detection or measurement on stage.
- Have the answer ready for "how accurate is this?": estimates with ranges, labelled, confirmed with a meter test or a plug.
