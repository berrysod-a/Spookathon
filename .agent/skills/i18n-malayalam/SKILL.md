---
name: i18n-malayalam
description: Use when adding, changing, or auditing any user-visible text, or when working on the English/Malayalam toggle: translation dictionary, fonts, dynamic strings, charts, errors, and coverage checks.
---

# English and Malayalam

## Goal
Switching to Malayalam changes every visible word in the app, on every screen, with no leftover English.

## Use this skill when
- Adding any text a user can see (labels, buttons, tooltips, chart labels, errors, toasts, empty states, aria-labels).
- Debugging text that does not translate.

## Do not use this skill when
- Changing calculation logic with no visible text.

## Instructions
1. One source of truth: `src/i18n/en.ts` and `src/i18n/ml.ts`, same keys, typed so a missing Malayalam key is a compile error. Components call `t("key")` or `t("key", { n: 4 })`. No literal English strings in JSX, props, or `aria-label`.
2. Dynamic text uses placeholders, never concatenation: `"Units should be {expected}, your readings differ by {diff}"`. Word order differs in Malayalam, so each language owns its full sentence.
3. Everything in the app routes through `t()`: appliance names and descriptions, action labels (including those generated in `calc.ts` and `schedule.ts`: return keys plus values, not English sentences), validation messages, time block labels, chart titles, legends, tooltips, units ("units", "kWh"), month and day names, the confirm screen, the plan summary, toasts and error pages.
4. Numbers: keep Western digits and the rupee symbol in both languages. Format money with `Intl.NumberFormat("en-IN")`.
5. Fonts: add Noto Sans Malayalam as the fallback for `font-sans` and set `lang="ml"` on the root when Malayalam is active. Geist has no Malayalam glyphs. Use line-height around 1.6 for Malayalam text.
6. Layout: Malayalam strings run longer. Allow wrapping, avoid fixed-width labels and truncation, and check every chart legend and button at 390 px.
7. Persist the choice in browser storage and read it before first paint to avoid a flash of English.
8. Coverage audit (run after every feature): switch to Malayalam, walk every screen and every state (empty, error, validation, modal, drawer, tooltip), and list any Latin-script words that are not units, brand names or numbers. Fix until the list is empty.
9. Mark machine-drafted Malayalam as `// REVIEW` in `ml.ts`. A native speaker must review before the demo.

## Starter translations (review before the demo)
| Key | English | Malayalam |
|---|---|---|
| block.earlyMorning | Early morning (4 to 6 am) | അതിരാവിലെ (4 മുതൽ 6 വരെ) |
| block.morning | Morning (6 am to 12 pm) | രാവിലെ (6 മുതൽ 12 വരെ) |
| block.afternoon | Afternoon (12 to 6 pm) | ഉച്ചയ്ക്ക് ശേഷം (12 മുതൽ 6 വരെ) |
| block.evening | Evening (6 to 10 pm) | വൈകുന്നേരം (6 മുതൽ 10 വരെ) |
| block.lateNight | Night (10 pm to 4 am) | രാത്രി (10 മുതൽ 4 വരെ) |
| day.weekday | Weekday | പ്രവൃത്തി ദിവസം |
| day.weekend | Weekend | വാരാന്ത്യം |
| action.addAppliance | Add appliance | ഉപകരണം ചേർക്കുക |
| action.remove | Remove | നീക്കം ചെയ്യുക |
| action.confirm | Confirm and continue | ശരിയാണ്, തുടരുക |
| action.edit | Edit | തിരുത്തുക |

## Constraints
- No string concatenation to build sentences.
- No English fallback shown to a Malayalam user; a missing key fails the build.
