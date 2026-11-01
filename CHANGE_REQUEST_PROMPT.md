# CHANGE REQUEST: Watt Plan v2

Paste everything below into Antigravity (Agent Manager, planning mode). `AGENTS.md` and the skills in `.agent/skills/` have been updated; reload them first (restart the agent session after copying).

---

## 1. Role and approach

You are a senior full-stack engineer and product designer working on the existing Watt Plan app (Next.js, TypeScript, Tailwind, shadcn/ui, Framer Motion). This is a **change request, not a rebuild**. First inspect the current codebase and tell me what you found (routes, components, state, translation approach). Then produce a short plan mapping each change below to files, and wait for my approval before editing.

Keep what works: the bill extraction route, `calc.ts`, the confirm-screen validation, the decoder, the key numbers, the savings plan and the visual design. Follow `AGENTS.md`. Use the skills: `dashboard-ui`, `i18n-malayalam`, `usage-schedule`, `appliance-estimation`, `bill-math`, `demo-readiness`.

New code is provided in the repo for you to integrate: `src/lib/schedule.ts` (with `schedule.test.ts`), `src/data/timeBlocks.ts`, `src/data/applianceMeta.ts`, `src/data/demoEntries.ts`. Merge `FRIDGE_DEF` into the appliance table, and keep the existing 10 tests in `calc.test.ts` green (update any that reference removed v1 items).

## 2. Changes

### C1. Homepage: remove "Use sample bill"
Remove the "Use sample bill" button next to "Analyse my bill". The hero keeps one primary action. Acceptance: no sample-related text on the landing page.

### C2. Upload area: photo first
In the upload section remove "Use sample bill". Show a primary **Take photo** button (file input with `accept="image/*"` and `capture`), a secondary **Choose from gallery** link (also accepts PDF), and **Enter manually**. Nothing else. Acceptance: on desktop the gallery link opens a file picker; on a phone the primary button opens the camera.

### C3. Hidden demo link
Visiting `/?demo=<token>` (token from `NEXT_PUBLIC_DEMO_TOKEN`, default `ksb26`) loads `SAMPLE_BILL` and `DEMO_ENTRIES`, jumps to the confirm step, then removes the parameter from the address bar using `history.replaceState`. No button, link, tooltip, keyboard hint or visible text anywhere may mention it, and nothing is logged to the console. Acceptance: opening the link works offline; the normal URL shows no trace of it.

### C4. Confirm screen: clear, friendly editing
Replace the "verification needed" warning screen with:
- Title "Check your bill details" and the line "We read these from your photo. Tap any number to fix it."
- Every field visibly editable (pencil icon, input styling).
- Only fields that fail a check turn red, each with one specific message (units vs readings, charges vs total, dates).
- A green "Everything adds up" state when all checks pass.
- One primary button "Confirm and continue". No generic warning banner.
Acceptance: a first-time user knows without instruction that they can edit and confirm; failing fields are obvious; passing bills show green.

### C5. Malayalam toggle covers everything
Audit and fix per the `i18n-malayalam` skill:
- One typed dictionary (`src/i18n/en.ts`, `ml.ts`); every visible string goes through `t()`, including chart titles, legends, tooltips, appliance names, action labels, validation messages, toasts, empty and error states, aria-labels.
- Functions in `calc.ts`, `schedule.ts` and the data files currently return English sentences or labels. Change them to return translation keys plus values.
- Add Noto Sans Malayalam as the font fallback and set `lang` on the root; allow longer text to wrap.
- Persist the choice and apply it before first paint.
- Mark machine-drafted Malayalam with `// REVIEW`.
Acceptance: run the coverage audit in the skill on every screen and state; the list of leftover English words (other than units, brand names, numbers) is empty. Report the audit result.

### C6. One smooth downward flow
Make the analysis a continuous page per `dashboard-ui`:
- Confirming a step reveals the next section below and scrolls to it smoothly (instant under reduced motion). The user never scrolls up to continue, including after "Confirm and continue" and "Where did my units go".
- Completed steps collapse into a one-line summary with an **Edit** button; editing recalculates everything below.
- A slim sticky progress indicator lets the user jump back but is never required.
Acceptance: from upload to savings plan, the user only scrolls down or taps one button per step.

### C7. Remove the sample household and the fridge calculator
Delete the "Try a sample household" option and the separate fridge calculator (drawer, route, components, tests, translation keys). The fridge becomes an ordinary appliance (C8 and C10). Acceptance: no references remain; `npx tsc --noEmit` and tests pass.

### C8. Appliance manager: add, remove, edit
Replace the fixed appliance picker with a manager using `ApplianceEntry`:
- **Add** from a searchable list (including the fridge) or **Add custom appliance** (name, typical running watts, optional low and high).
- **Remove** with one tap and an undo toast.
- **Edit** quantity (stepper), name for custom rows, and usage hours (C9). The same appliance can appear twice (for example two fridges, or a bedroom fan and a hall fan).
- Totals and the "Not covered by your list" segment update instantly via `computeBreakdown(bill, metrics, [], entriesToExtras(entries, metrics.days))`.
Acceptance: adding, removing and editing any row changes the breakdown immediately; custom appliances work in the breakdown and chart.

### C9. Usage by time of day, weekday and weekend
Per `usage-schedule`:
- Each appliance has a **Usage** disclosure with five time blocks (early morning, morning, afternoon, evening 6 to 10 pm, night) and a Weekday / Weekend toggle plus a "same every day" switch. Use chips or small sliders capped at the block length. New rows start from `defaultUsageFor` (for example TV: morning news, evening serials; fans: early morning and night).
- Weekly average hours per day = (5 x weekday + 2 x weekend) / 7, feeding `estimateEntry`.
- Show the total hours per day for the row, and warn gently if it exceeds 24.
Acceptance: changing the evening hours of the TV changes its estimated units and the charts below.

### C10. Efficiency check for any appliance
Replace the old fridge calculator with an **Efficiency** disclosure on each appliance row (`efficiencyCheck`):
- Inputs: age, star rating (shown only for categories with BEE labels per `APPLIANCE_META`), nameplate watts, label kWh per year, and for fridges capacity and type. All optional.
- Output: current vs modern-equivalent annual kWh (ranges), a newness label, yearly saving as a range, payback if a price is entered (default price editable), and a verdict (worth it, borderline, fix first, no saving).
- For fridges show the fix-first ladder (door seal, defrost and coils, ventilation gap, temperature) before any replacement verdict.
- Typed nameplate watts or label kWh upgrade the badge to "Label-based"; otherwise "Rough estimate". Show age and star factors as labelled assumptions.
- **Do not** add model-number lookup. Optional stretch: a "Photograph the label" button reusing the extraction route to read stars, wattage and annual kWh into an editable form.
- Categories with no modern benchmark simply show no efficiency verdict.
Acceptance: the old 250 L frost-free demo fridge shows "much less efficient" with a payback over 10 years and "fix first".

### C11. Time-of-day and weekly views
- **24-hour chart:** estimated units by time block, stacked by appliance, plus the evening share of usage ("Most of your estimated use is between 6 and 10 pm").
- **Weekly chart:** seven bars from `weeklyProfile`, weekends visibly different.
- Label both "Estimated from your hours".
- **Time-of-day pricing note** via `todApplies`: if monthly units exceed 250, show peak vs daytime rates and rupee effects; otherwise show: "Your usage level does not have peak pricing, so shifting will not change your bill. It still helps the grid at peak."
- Block hours, multipliers and the 250-unit threshold are read from `timeBlocks.ts`; show their source and mark them "verify" until checked against the current tariff order. Peak hours may change in a future revision.
Acceptance: the sample household (about 138 units a month) shows the "no peak pricing" note; a test bill above 250 units a month shows peak rates.

### C12. Savings plan v2: weekly, time-aware
Keep the rupee target, ranked actions, progress bar and summary. Add:
- Actions from `buildEntryActions` (keyed by row) and `buildShiftActions` ("run it in the daytime, not 6 to 10 pm").
- Shift actions carry a "helps the grid" tag. Rupees count toward the target only when time-of-day pricing applies.
- A "weekly plan" summary grouped by when the action happens (morning, daytime, evening, night), such as "This week: switch off the set-top box at night, run the washing machine before 6 pm".
- A filter for free actions.
- Savings use the marginal rate (or block rates when ToD applies); ranges are shown where estimated.
Acceptance: ticking actions fills the progress bar; grid-only actions never inflate rupee totals for non-ToD households.

### C13. Housekeeping
Update tests for removed v1 items and add tests for any new logic you write; keep `schedule.test.ts` and `calc.test.ts` green. Update README with the hidden-demo usage (not in the UI). No new visible copy may claim detection or measurement.

## 3. Data model summary

`ApplianceEntry { uid, defId, name, qty, usage: { weekday, weekend }, custom?, efficiency? }`. Time blocks and ToD rules in `timeBlocks.ts`. Metadata (category, star label, shiftable, modern watts, default price) in `applianceMeta.ts`. See `schedule.ts` for the functions: `estimateEntry`, `estimateEntryByBlock`, `entriesToExtras`, `usageByBlock`, `weeklyProfile`, `blockRates`, `todApplies`, `buildEntryActions`, `buildShiftActions`, `efficiencyCheck`.

## 4. Copy to add (English; supply Malayalam via the dictionary)

- Confirm: "Check your bill details", "We read these from your photo. Tap any number to fix it.", "Everything adds up", "Confirm and continue", "Edit".
- Appliances: "Add appliance", "Add custom appliance", "Remove", "Undo", "Usage", "Efficiency", "Same every day", "Weekday", "Weekend".
- Charts: "Estimated from your hours", "Most of your estimated use is between 6 and 10 pm".
- ToD: "Your usage level does not have peak pricing, so shifting will not change your bill. It still helps the grid at peak."
- Plan: "Helps the grid", "This week", "Free actions only".

## 5. Priorities and cut order

1. Must: C1, C2, C3, C4, C6, C7, then C8 and C9, then C5 (audit after every other change).
2. Should: C11 charts, C10 efficiency, C12 plan.
3. Stretch: label photo scan in C10.
If time runs short cut: label photo scan, weekly chart, efficiency for categories other than fridge and fans.

## 6. Quality and testing

- `npx tsc --noEmit` clean; all tests pass.
- Run the smoke test in the `demo-readiness` skill through the hidden link and once with a real bill photo, on a 390 px viewport.
- Malayalam coverage audit passes on every screen and state.
- Keep first load fast: lazy-load the Waves background and keep it off the analysis sections.

## 7. Do not

- Do not add visible sample-data buttons anywhere.
- Do not claim detection or measurement of appliances, or of when power was used.
- Do not build model-number lookup.
- Do not duplicate formulas in components or return English sentences from logic files.
- Do not add decorative animation beyond what `dashboard-ui` allows.

## 8. First response expected

What you found in the codebase, a plan mapping C1 to C13 to files, any conflicts between the existing code and the new modules, and questions. Wait for approval, then start with C1 to C4.
