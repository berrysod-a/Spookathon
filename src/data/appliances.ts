import type { ApplianceDef } from "@/lib/types";
import { FRIDGE_DEF } from "@/data/applianceMeta";

/**
 * ILLUSTRATIVE VALUES. These are ballpark figures for a hackathon demo, not sourced data.
 * TODO (first hour of the build): verify wattages against nameplates / BEE data and add a
 * `source` note per row. The UI must keep showing "Estimate" next to every figure derived from this table.
 */
const r = (low: number, typ: number, high: number) => ({ low, typ, high });

export const APPLIANCES: ApplianceDef[] = [
  // Fridge is first so it appears at the top of the add-appliance list.
  FRIDGE_DEF,
  {
    id: "ceiling-fan",
    name: "Ceiling fan",
    icon: "Fan",
    watts: r(50, 70, 85),
    duty: r(0.9, 1, 1),
    defaultHours: 8,
    hoursUncertainty: 0.3,
    actions: [{ id: "fan-1h", label: "Run each fan one hour less", kind: "hours", hoursSaved: 1, free: true }],
  },
  {
    id: "led-bulb",
    name: "LED bulb",
    icon: "Lightbulb",
    watts: r(7, 9, 12),
    duty: r(1, 1, 1),
    defaultHours: 5,
    hoursUncertainty: 0.3,
    actions: [{ id: "led-1h", label: "Switch off unused lights, one hour a day", kind: "hours", hoursSaved: 1, free: true }],
  },
  {
    id: "tube-light",
    name: "Tube light (with choke)",
    icon: "Lamp",
    watts: r(36, 45, 55),
    duty: r(1, 1, 1),
    defaultHours: 5,
    hoursUncertainty: 0.3,
  },
  {
    id: "incandescent-bulb",
    name: "Old filament bulb",
    icon: "Lightbulb",
    watts: r(40, 60, 75),
    duty: r(1, 1, 1),
    defaultHours: 4,
    hoursUncertainty: 0.3,
  },
  {
    id: "tv",
    name: "Television",
    icon: "Tv",
    watts: r(50, 90, 150),
    duty: r(1, 1, 1),
    defaultHours: 4,
    hoursUncertainty: 0.4,
    actions: [{ id: "tv-1h", label: "Watch one hour less TV", kind: "hours", hoursSaved: 1, free: true }],
  },
  {
    id: "set-top-box",
    name: "Set-top box",
    icon: "Satellite",
    watts: r(8, 15, 25),
    duty: r(1, 1, 1),
    defaultHours: 24,
    hoursUncertainty: 0.05,
    alwaysOn: true,
    actions: [{ id: "stb-night", label: "Switch off the set-top box at night (8 h)", kind: "hours", hoursSaved: 8, free: true }],
  },
  {
    id: "wifi-router",
    name: "Wi-Fi router",
    icon: "Router",
    watts: r(5, 8, 12),
    duty: r(1, 1, 1),
    defaultHours: 24,
    hoursUncertainty: 0.05,
    alwaysOn: true,
    actions: [{ id: "router-night", label: "Switch off the router at night (8 h)", kind: "hours", hoursSaved: 8, free: true }],
  },
  {
    id: "washing-machine",
    name: "Washing machine",
    icon: "WashingMachine",
    watts: r(300, 450, 600),
    duty: r(0.8, 1, 1),
    defaultHours: 0.7,
    hoursUncertainty: 0.4,
  },
  {
    id: "ac-split",
    name: "Split AC (1.5 ton, non-inverter)",
    icon: "AirVent",
    watts: r(1200, 1500, 1800),
    duty: r(0.5, 0.65, 0.8),
    defaultHours: 4,
    hoursUncertainty: 0.4,
    actions: [
      { id: "ac-1h", label: "Use the AC one hour less", kind: "hours", hoursSaved: 1, free: true },
      // ASSUMPTION: a few degrees higher setpoint trims roughly 10% of AC energy. Label as assumption in UI.
      { id: "ac-setpoint", label: "Set the AC to 24-26 C instead of colder", kind: "percent", pct: 0.1, free: true },
    ],
  },
  {
    id: "geyser",
    name: "Water heater (geyser)",
    icon: "Flame",
    watts: r(1500, 2000, 3000),
    duty: r(0.4, 0.6, 0.8),
    defaultHours: 0.5,
    hoursUncertainty: 0.5,
    forgottenPrompt: "A geyser left on or on a bad timer",
    actions: [{ id: "geyser-15m", label: "Heat water 15 minutes less per day", kind: "hours", hoursSaved: 0.25, free: true }],
  },
  {
    id: "water-pump",
    name: "Water pump / motor",
    icon: "Droplets",
    watts: r(370, 550, 750),
    duty: r(0.9, 1, 1),
    defaultHours: 0.75,
    hoursUncertainty: 0.4,
    forgottenPrompt: "A water pump or motor",
  },
  {
    id: "induction",
    name: "Induction cooktop",
    icon: "CookingPot",
    watts: r(1200, 1500, 2000),
    duty: r(0.5, 0.7, 0.9),
    defaultHours: 0.75,
    hoursUncertainty: 0.4,
  },
  {
    id: "iron",
    name: "Clothes iron",
    icon: "Shirt",
    watts: r(750, 1000, 1200),
    duty: r(0.5, 0.6, 0.8),
    defaultHours: 0.3,
    hoursUncertainty: 0.5,
  },
  {
    id: "laptop",
    name: "Laptop / desktop",
    icon: "Laptop",
    watts: r(40, 70, 150),
    duty: r(0.6, 0.8, 1),
    defaultHours: 4,
    hoursUncertainty: 0.4,
  },
  {
    id: "phone-charger",
    name: "Phone charger",
    icon: "BatteryCharging",
    watts: r(3, 5, 10),
    duty: r(0.5, 0.8, 1),
    defaultHours: 3,
    hoursUncertainty: 0.3,
  },
  {
    id: "inverter-ups",
    name: "Inverter / UPS (idle + charging)",
    icon: "BatteryFull",
    watts: r(25, 40, 70),
    duty: r(1, 1, 1),
    defaultHours: 24,
    hoursUncertainty: 0.05,
    alwaysOn: true,
    forgottenPrompt: "An inverter or UPS that is always plugged in",
  },
  {
    id: "second-fridge",
    name: "Second fridge or chest freezer",
    icon: "Refrigerator",
    // Uses the generic formula like every other row (about 340 kWh/year at typical values).
    watts: r(80, 110, 160),
    duty: r(0.25, 0.35, 0.5),
    defaultHours: 24,
    hoursUncertainty: 0.05,
    alwaysOn: true,
    forgottenPrompt: "A second fridge or chest freezer in the store room",
  },
];

export const APPLIANCE_BY_ID: Record<string, ApplianceDef> = Object.fromEntries(
  APPLIANCES.map((a) => [a.id, a]),
);

// Re-export FRIDGE_DEF so consumers can import from one place.
export { FRIDGE_DEF } from "@/data/applianceMeta";

/** Items shown in the "Did you forget...?" strip next to the Unaccounted segment. */
export const FORGOTTEN_PROMPTS = APPLIANCES.filter((a) => a.forgottenPrompt).map((a) => ({
  id: a.id,
  text: a.forgottenPrompt as string,
}));
