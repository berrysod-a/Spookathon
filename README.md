# Watt Plan (v2): Kerala KSEB Electricity Bill Analyser & Planner

A web application for domestic (LT-1A) electricity consumers under the Kerala State Electricity Board (KSEB). Watt Plan decodes complex bi-monthly bills into plain language, calculates the true marginal cost of electricity consumption, estimates appliance-level usage with honest range-based uncertainty, and provides an actionable savings roadmap.

## Key Features

1. **Photo-First Bill Reading & Plain Language Decoder**
   - Direct camera photo capture, gallery upload, or manual entry.
   - Extracts meter readings, dates, connected load, and tariff charges.
   - Clear edit interface where only failing checks turn red, and passing bills show "Everything adds up".
   - Explains Fixed Charges (unavoidable), Energy Charges, Fuel Surcharges, Auto-Recovery (FSM), and Electricity Duty.

2. **True Marginal Cost Calculation**
   - Strictly calculates savings using the true marginal rate:
     $$\text{Marginal Rate} = \frac{\text{Variable Charges}}{\text{Units}} = \frac{\text{Energy Charge} + \text{Surcharges} + \text{Duty}}{\text{Units}}$$
   - Never uses the misleading all-in rate ($\text{Total} / \text{Units}$) or base energy charge alone.

3. **Appliance Manager & Time-of-Day Editor**
   - Add, edit, and remove appliances, including custom appliances with user-specified wattages.
   - 5-block diurnal usage schedule (Early Morning, Morning, Afternoon, Evening Peak 6–10 pm, Night).
   - Weekday vs. Weekend differentiation and "Same every day" toggle.
   - Refrigerator integrated as a standard appliance with efficiency disclosure.

4. **Per-Appliance Efficiency Disclosure**
   - Inputs for age, BEE star ratings, nameplate wattage, and annual label kWh.
   - Compares existing appliance consumption against modern 5-star benchmarks.
   - Calculates annual rupee savings and payback periods.
   - Refrigerator "Fix-first" guidance (door seals, coil cleaning, 5 cm gap, setpoint calibration) before replacement recommendations.

5. **24-Hour & Weekly Diurnal Profiles**
   - Stacked diurnal block breakdown identifying evening peak concentration.
   - 7-day weekly load profile with weekday vs. weekend coloring.
   - Highlights Kerala Time-of-Day (ToD) tariff rules (>250 units/month).

6. **Actionable Savings Plan**
   - Ranked savings recommendations prioritized by rupee savings at the true marginal rate.
   - Free actions filter.
   - Peak-to-day shift actions clearly tagged as "Helps the grid".
   - Radial target tracker toward household rupee goals.

7. **One Smooth Downward Flow**
   - Continuous vertical flow with collapsed summary strips and direct "Edit" jump-backs.
   - Instant scrolling under reduced-motion preferences.
   - Slim sticky progress pill.

8. **Full English & Malayalam Localization**
   - 100% string coverage via typed dictionaries (`src/i18n/en.ts` and `src/i18n/ml.ts`).
   - Noto Sans Malayalam font integration.
   - Preference persisted before first paint.

---

## Non-Negotiable Product Rules

1. **Honesty:** Watt Plan estimates; it never detects or measures. No copy states that it "detects", "finds", or "identifies" leaks, theft, or appliances.
2. **One Savings Rate:** Every rupee saving uses `billMetrics(bill).marginalRate`.
3. **Ranges, Not Points:** Appliance figures are shown as ranges with an "Estimate" badge.
4. **Leftover Energy:** Labelled as "Not covered by your list" (or "Unaccounted energy").
5. **No Secrets in the Client:** Vision extraction runs exclusively server-side (`src/app/api/extract-bill/route.ts`).

---

## Hidden Demo Link

For offline testing and presentations without camera input, visit:
```
/?demo=ksb26
```
(Configurable via `NEXT_PUBLIC_DEMO_TOKEN`).

Opening this URL immediately loads `SAMPLE_BILL` and `DEMO_ENTRIES`, advances to the confirm step, and quietly scrubs the parameter from the address bar using `history.replaceState`. No visible UI button, tooltip, or link exposes this path.

---

## Development & Verification

### Prerequisites
- Node.js 18+
- npm or pnpm

### Commands
```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run unit tests (Vitest)
npm test

# Run TypeScript type check
npx tsc --noEmit
```

All 27 unit tests in `src/lib/calc.test.ts` and `src/lib/schedule.test.ts` pass cleanly with zero TypeScript errors.
