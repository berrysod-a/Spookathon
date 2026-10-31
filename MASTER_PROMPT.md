# MASTER PROMPT: Electricity Bill Analyser & Planner

Paste everything below into Antigravity (Agent Manager, planning mode). Antigravity should read `AGENTS.md` and load the skills in `.agent/skills/` automatically.

---

## 1. Role and mission

You are a senior full-stack engineer and product designer building a hackathon MVP in about 10 hours. Build a fully working web app called **Watt Plan** (rename if you prefer) that turns a Kerala (KSEB) electricity bill into: a plain-language decode, the true cost of one extra unit, an estimated appliance breakdown, and a savings plan toward a rupee target.

Before writing code, produce a short implementation plan (files, components, build order) and wait for my approval. Then build in the phases in section 12, committing at each checkpoint.

## 2. Context you must respect

- Sample bill (bi-monthly): 281 units over 61 days (about 4.6 units a day, about 192 W average). Total 1,473 rupees. Fixed charge 178.50 (about 12%). Energy 1,128.60, fuel surcharge 25.29, auto recovery surcharge 28.10, duty 112.86, round off -0.35.
- Problem: a family sees "281 units, 1,473 rupees" and cannot tell what they pay for, what one extra unit costs, where the units likely went, or what to change.
- The app answers one question: **Why is my bill this high, and what can I do about it?**
- Existing tools (Sense, Emporia, smart plug apps) need hardware. This app needs only a photo of the bill.

## 3. Honesty rules (never break)

1. The app **estimates**; it never detects or measures appliances. Banned in copy: "detected", "found your", "identified", "wasting" (as fact), "hidden load" (as fact).
2. Every savings figure uses the **true marginal rate** = (energy + fuel surcharge + auto recovery surcharge + duty) / units, about 4.61 rupees on the sample bill. Never the all-in rate (about 5.24, includes the fixed charge) or the energy rate alone.
3. Appliance figures are **ranges** (low, typical, high) with an "Estimate" badge and a confidence label (Rough estimate, Label-based, Measured).
4. The leftover is labelled "Not covered by your list". It is highlighted as a finding only when even its low end is above zero (`breakdown.status === "finding"`); otherwise say the list roughly explains the bill. If the list exceeds the bill, say by how much and ask the user to revisit the widest-range items.
5. Reference data is illustrative until verified. Show a source note and an "illustrative" flag.

## 4. Tech stack and setup

- Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui.
- Framer Motion (`framer-motion`), Recharts via shadcn `chart`, `lucide-react`, `zod`, `simplex-noise`, Vitest.
- React Bits (reactbits.dev) and 21st.dev for component inspiration and reuse. Confirm exact component names on the sites; if one is unavailable, build it with Framer Motion.
- Vision extraction through a server route using a vision-capable model (Gemini by default, key in `GEMINI_API_KEY`). Check the current SDK docs before wiring it.
- Already provided in the repo (do not rewrite, extend only): `src/lib/calc.ts`, `types.ts`, `extraction.ts`, `calc.test.ts`, `src/data/*`, `src/components/ui/container-scroll.tsx`, `landing-hero.example.tsx`, and the Waves component at `src/components/ui/wave-background.tsx`.
- shadcn components to add: button, card, input, label, select, slider, tabs, badge, progress, dialog, drawer, sheet, checkbox, switch, toggle-group, tooltip, accordion, alert, separator, sonner, chart, skeleton.

## 5. Design direction (from my references)

1. **Kinetic grid hero**: dark canvas, a background that warps toward the cursor and ripples on click. Use the provided Waves component, tinted blue (`strokeColor="#3b82f6"`, `backgroundColor="#09090b"`). If a closer interactive-grid component exists on reactbits.dev, you may use it instead; keep the Waves component as the fallback. Headline over it, one lime button.
2. **Scroll reveal**: under the hero, `ContainerScroll` shows the dashboard inside a rotating device frame. Use a static screenshot or a live read-only preview of the sample bill.
3. **Bento dashboard**: near-black surface, large rounded tiles in violet, lime, amber, orange and blue, big monospaced numbers, small labels, delta chips (for example "12% fixed"). Include a radial or polar-style chart for goal progress.
4. Tokens: background `#09090b`, surface `#18181b`, border `#27272a`, text `#fafafa`, muted `#a1a1aa`; accents lime `#a3e635`, violet `#8b5cf6`, amber `#f59e0b`, orange `#f97316`, blue `#3b82f6`; error red only for validation. Geist Sans plus Geist Mono for numbers. Sentence case, no all-caps eyebrow labels, no arrows on buttons.
5. Motion: one orchestrated landing moment, step transitions, count-up on key numbers, the progress bar fill, and the "not covered" segment shrinking when an appliance is added. Nothing else. Respect `prefers-reduced-motion`.
6. Mobile first (design at 390 px), visible keyboard focus, 4.5:1 contrast.

## 6. Screens and flow

A single-page flow with a visible stepper. State lives in a small store (Zustand or React context); no accounts, no database.

1. **Landing**: hero, scroll-reveal preview, two actions: "Upload my bill" and "Use sample bill".
2. **Upload and confirm** (Step 1): drag-and-drop or camera upload, "Use sample bill", and "Enter manually". After extraction, show an editable form with every field. Run `validateBill`; show errors in red on the exact field (units vs readings, charges vs total, dates). The user must press "Looks right" to continue.
3. **Your bill, decoded** (Step 2): plain-language explanation of each charge, a stacked bar or donut of fixed vs variable, a three-rate comparison (energy rate, all-in rate, true cost of one extra unit), and tiles: units used, units per day, fixed share, average draw. English by default with a Malayalam toggle for the explanations.
4. **Where the units likely went** (Step 3): appliance picker, per-appliance quantity and hours (defaults from the table), a chart of estimated shares as ranges, a "Not covered by your list" segment, and a forgotten-appliance strip. Include "Try a sample household".
5. **Your savings plan** (Step 4): rupee target input (default 200), the target in units, ranked actions with rupees saved, a progress bar or radial chart, a "free actions only" filter, and a final summary: "Do these things this cycle to save about X".
6. **Fridge and upgrades** (drawer from Step 3 or 4): fridge inputs (litres, type, age, stars, optional label kWh, optional price), result with ranges, the fix-first ladder, then payback and verdict. Below it, a ranked upgrade list (filament bulb to LED, tube to LED, old fan to BLDC) by payback.

## 7. Feature specifications and acceptance criteria

**F1 Bill intake.** Upload an image or PDF to `POST /api/extract-bill` (server route). Use `EXTRACTION_SYSTEM_PROMPT` and validate the reply with `BillSchema`. Timeout 20 s. On any failure open the manual form with parsed fields prefilled and a short, specific message. Acceptance: sample bill and manual entry work offline; extraction never blocks the flow.

**F2 Decoder.** One card per charge with a plain-language line, for example: Fixed charge "You pay this even if you use zero units." Energy, fuel surcharge, auto recovery surcharge and duty: "These grow with every unit." Acceptance: all jargon (FC, EC, FS, FSM, ED) appears only with its explanation; Malayalam toggle swaps the explanations.

**F3 Key numbers.** Units per day, three rates, fixed share, average draw. Acceptance: sample bill shows 61 days, about 4.61 units a day, about 4.61 rupees true cost, about 5.24 all-in, about 12% fixed.

**F4 Appliance breakdown.** Use `computeBreakdown` with the fridge as an extra item. Acceptance: demo household yields a finding; ticking the water pump shrinks the segment and the status becomes "roughly explained"; a very large list shows the over-listed message.

**F5 Savings plan.** Use `buildActions` and `planProgress`. Acceptance: ticking three actions moves the bar; target converts to units (200 rupees is about 43 units); free actions are tagged.

**F6 Replace-or-keep.** Use `fridgeReplaceOrKeep` and `upgradePayback`. Acceptance: the fix-first ladder is shown before any replacement advice; an old 250 L frost-free fridge with a 25,000 rupee replacement shows a long payback (more than 10 years) and the verdict "fix first".

**Stretch only if time remains:** second-bill comparison, 10-minute meter test (two meter readings give a measured watt figure that upgrades confidence to Measured), slab-aware marginal rate once KSERC rates are verified.

## 8. Extraction route (contract)

`POST /api/extract-bill` with multipart `file`. Returns `200 { bill }` matching `BillSchema`, or `422 { error, partial? }`. The key stays server-side. Log nothing from the image. Do not store the file.

## 9. Copy deck (use these; keep the tone plain)

- Hero: "See what your bill is hiding." Sub: "Upload your KSEB bill. Get the real cost of one extra unit, a likely breakdown by appliance, and a plan to cut your next bill."
- Confirm screen button: "Looks right". Error example: "Units (287) should equal present reading minus previous reading (281). Check the meter readings."
- Unaccounted segment: "Not covered by your list. Typical: 90 units, up to 153." Prompt: "Did you list the water pump, a second fridge, a geyser or an inverter?"
- Plan summary: "Do these 3 things this cycle to save about 148 rupees."
- Malayalam (have a native speaker review before the demo): Fixed charge = "സ്ഥിര ചാർജ്: ഒരു യൂണിറ്റും ഉപയോഗിച്ചില്ലെങ്കിലും അടയ്ക്കണം." Energy charge = "ഊർജ്ജ ചാർജ്: ഉപയോഗിച്ച ഓരോ യൂണിറ്റിനുമുള്ള നിരക്ക്." Fuel surcharge = "ഇന്ധന സർചാർജ്: ഓരോ യൂണിറ്റിനും അധികമായി ചേർക്കുന്ന തുക." Electricity duty = "വൈദ്യുതി തീരുവ: സർക്കാരിലേക്കുള്ള നികുതി."

## 10. Data to verify (first hour)

Wattages and duty cycles (`src/data/appliances.ts`), fridge annual kWh by type, size and star rating (`fridgeTable.ts`, BEE label data), the age and star factors (assumptions, keep labelled), upgrade wattages and prices, and current KSERC domestic slabs. Add a `source` string for each and display it. If slabs are not verified, keep the flat marginal rate and say so.

## 11. Skills to use

`bill-math` for all rate and validation work, `appliance-estimation` for breakdown, plan and fridge, `dashboard-ui` for every visual decision, `demo-readiness` for fallbacks, smoke tests and the demo script.

## 12. Build phases and checkpoints (10 hours)

| Phase | Hours | Deliverable and checkpoint |
|---|---|---|
| 0 Setup | 0 to 1 | App scaffolded, shadcn and libraries installed, starter pack in place, `npm test` green, data sources verified |
| 1 Intake | 1 to 2.5 | Upload, extraction route, confirm form with validation, sample bill and manual fallbacks |
| 2 Decode | 2.5 to 4 | Decoder cards, three-rate comparison, key number tiles, Malayalam strings |
| 3 Breakdown | 4 to 6 | Appliance picker, ranges chart, "not covered" segment, forgotten strip, demo household |
| 4 Plan | 6 to 7.5 | Target, ranked actions, progress chart, fridge and upgrades drawer |
| 5 Polish | 7.5 to 8.5 | Landing hero and scroll reveal, motion pass, mobile pass, empty and error states |
| 6 Demo | 8.5 to 10 | Smoke test, deploy, phone test, rehearsal, buffer |

If behind schedule, cut in this order: Malayalam toggle, upgrade list, scroll reveal, always-on highlight. Never cut the sample bill fallback.

## 13. Testing and quality

- Unit tests for every function in `calc.ts` (extend `calc.test.ts`); all must pass.
- `npx tsc --noEmit` clean.
- Smoke test from the `demo-readiness` skill passes on the deployed URL on a phone.
- Add loading, empty and error states for every async or empty view.

## 14. Do not

- Do not add accounts, a database, smart-plug support or monthly reminders.
- Do not duplicate formulas in components.
- Do not claim detection or measurement anywhere in the UI, docs or demo.
- Do not animate every card or add decorative gradients.

## 15. First response expected from you

A plan with the file tree, the component list mapped to shadcn, React Bits or 21st.dev sources, the state model, the API route design, and any questions. Wait for approval, then start Phase 0.
