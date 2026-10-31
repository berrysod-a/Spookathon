---
name: dashboard-ui
description: Use when building or styling any screen, component, chart, animation or layout in the app: landing hero, stepper, bill decoder, bento dashboard, appliance picker, savings plan, using shadcn/ui, React Bits, 21st.dev and Framer Motion.
---

# Dashboard UI

## Goal
A dark, confident, data-forward interface that matches the reference direction and stays fast and readable.

## Use this skill when
- Creating or editing any visible component or page.
- Choosing charts, colours, type or motion.

## Do not use this skill when
- Changing calculations (use `bill-math` or `appliance-estimation`).

## Design direction (from the references)
1. **Landing hero**: near-black canvas with a kinetic background that reacts to the cursor (the Waves component in `components/ui/wave-background.tsx`, tinted blue). Large headline, one short sentence, one lime button.
2. **Scroll reveal**: below the hero, `ContainerScroll` shows the dashboard inside a device frame that rotates flat as the user scrolls.
3. **Dashboard**: bento grid on a near-black surface. Large rounded tiles in saturated colours (violet, lime, amber, orange, blue) with a big monospaced number, a small label and a delta chip. Tile area reflects appliance share where practical.
4. **Charts**: shadcn charts (Recharts). Bill composition as a donut or stacked bar; appliance share as horizontal bars with range whiskers; goal progress as a radial bar.

## Tokens
- Background `#09090b`, surface `#18181b`, border `#27272a`, text `#fafafa`, muted `#a1a1aa`.
- Accents: lime `#a3e635` (savings, primary action), violet `#8b5cf6`, amber `#f59e0b`, orange `#f97316`, blue `#3b82f6` (background grid), red `#ef4444` (validation errors only).
- Type: Geist Sans for text, Geist Mono for numbers. Sentence case everywhere; no all-caps eyebrow labels; no arrows appended to buttons.
- Radius: large (16 to 24 px) on tiles, smaller on inputs. Vary it by hierarchy; do not apply one radius to everything.

## Components to use
- shadcn/ui: button, card, input, label, select, slider, tabs, badge, progress, dialog, drawer, sheet, checkbox, switch, toggle-group, tooltip, accordion, alert, separator, sonner, chart, skeleton.
- 21st.dev: search for a scroll container, bento grid, stepper, and file-upload dropzone; adapt rather than copy blindly.
- React Bits (reactbits.dev): CountUp for number reveals, SpotlightCard for tiles. Confirm the exact component names on the site; if one is missing, build it with Framer Motion.

## Motion rules
- Use motion for: the one landing sequence, step transitions, count-up on the key numbers, the savings progress bar filling, and the "not covered" segment shrinking when an appliance is added.
- Do not animate every card on scroll, and do not add hover effects to everything.
- Respect `prefers-reduced-motion` (use `useReducedMotion`).

## Quality floor
Mobile-first (design at 390 px first), visible keyboard focus, 4.5:1 text contrast, buttons say what they do ("Use sample bill", "Save my plan"), error text says what to fix, empty states invite an action.
