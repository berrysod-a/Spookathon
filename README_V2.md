# Watt Plan v2 change pack

Copy into the existing repo, keeping paths (overwrite AGENTS.md and the skills; add the new files):
- `CHANGE_REQUEST_PROMPT.md`: paste into Antigravity.
- `AGENTS.md`, `.agent/skills/*`: updated rules and skills (new: `usage-schedule`, `i18n-malayalam`; updated: `appliance-estimation`, `demo-readiness`, `dashboard-ui`). Restart the agent session afterwards.
- `src/lib/schedule.ts` and `schedule.test.ts`: appliance entries, time blocks, weekly usage, time-of-day costing, efficiency check, entry-based actions (17 tests; all 27 tests pass together with the v1 suite).
- `src/data/timeBlocks.ts`, `applianceMeta.ts`, `demoEntries.ts`: block and ToD config, per-appliance metadata, hidden-demo household.

After merging, delete the old `src/data/demoHousehold.ts` and its use in `calc.test.ts` (the prompt covers this as C7).
Values in the data files are illustrative; verify against the current tariff order and BEE data.
