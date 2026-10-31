# Antigravity starter pack: Electricity Bill Analyser & Planner

Contents
- `MASTER_PROMPT.md`: paste this into Antigravity (Agent Manager, planning mode) after setup.
- `AGENTS.md`: project rules, placed in the repo root.
- `.agent/skills/*/SKILL.md`: four workspace skills (bill-math, appliance-estimation, dashboard-ui, demo-readiness).
- `src/lib/calc.ts`, `types.ts`, `extraction.ts`, `calc.test.ts`: tested calculation engine (10 passing tests) and the extraction schema.
- `src/data/*`: sample bill, appliance table, fridge table, upgrades, demo household (illustrative values, flagged for verification).
- `src/components/ui/container-scroll.tsx` and `landing-hero.example.tsx`: scroll-reveal hero wired to the Waves background.
- `vitest.config.ts`

Setup (10 minutes)
1. Create the app: `npx create-next-app@latest energy-bill --ts --tailwind --app --src-dir --import-alias "@/*"` and open it in Antigravity.
2. Initialise shadcn: `npx shadcn@latest init`, then `npx shadcn@latest add button card input label select slider tabs badge progress dialog drawer sheet checkbox switch toggle-group tooltip accordion alert separator sonner chart skeleton`.
3. Install libraries: `npm i framer-motion simplex-noise zod lucide-react` and `npm i -D vitest`.
4. Copy this pack's files into the repo, keeping the paths. Add `src/components/ui/wave-background.tsx` from the component code you were given.
5. Add `"test": "vitest run"` to package.json scripts and a `.env.local` with `GEMINI_API_KEY=...` (or the key for whichever vision model you use).
6. Run `npm test`; all 10 tests should pass. Then paste `MASTER_PROMPT.md` into Antigravity.

Antigravity loads workspace skills from `.agent/skills/<name>/SKILL.md`. Restart the agent session after copying so it re-detects them.
