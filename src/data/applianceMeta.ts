import type { ApplianceDef } from "@/lib/types";

/**
 * Extra metadata layered on top of APPLIANCES (so the existing table stays untouched).
 * ILLUSTRATIVE values; verify before the demo.
 */
export type ApplianceCategory = "fridge" | "ac" | "fan" | "tv" | "washing" | "geyser" | "light" | "other";

export interface ApplianceMeta {
  category: ApplianceCategory;
  hasStarLabel: boolean; // BEE star ratings exist for this category
  shiftable?: boolean; // can sensibly be moved out of the evening peak
  modernWatts?: number; // typical running watts of a modern efficient equivalent
  defaultReplacementPrice?: number; // rupees, editable by the user
}

export const APPLIANCE_META: Record<string, ApplianceMeta> = {
  fridge: { category: "fridge", hasStarLabel: true, defaultReplacementPrice: 25000 },
  "second-fridge": { category: "fridge", hasStarLabel: true, defaultReplacementPrice: 20000 },
  "ceiling-fan": { category: "fan", hasStarLabel: true, modernWatts: 32, defaultReplacementPrice: 3500 },
  "ac-split": { category: "ac", hasStarLabel: true, modernWatts: 1000, defaultReplacementPrice: 38000 },
  tv: { category: "tv", hasStarLabel: true, modernWatts: 60, defaultReplacementPrice: 25000 },
  "washing-machine": { category: "washing", hasStarLabel: true, shiftable: true, modernWatts: 350, defaultReplacementPrice: 18000 },
  geyser: { category: "geyser", hasStarLabel: true, shiftable: true, modernWatts: 1800, defaultReplacementPrice: 7000 },
  iron: { category: "other", hasStarLabel: false, shiftable: true },
  induction: { category: "other", hasStarLabel: false },
  "water-pump": { category: "other", hasStarLabel: false, shiftable: true },
  "led-bulb": { category: "light", hasStarLabel: false },
  "tube-light": { category: "light", hasStarLabel: false, modernWatts: 20, defaultReplacementPrice: 400 },
  "incandescent-bulb": { category: "light", hasStarLabel: false, modernWatts: 9, defaultReplacementPrice: 100 },
};

/** The fridge as an ordinary appliance (v1 handled it in a separate calculator). Add this to APPLIANCES. */
export const FRIDGE_DEF: ApplianceDef = {
  id: "fridge",
  name: "Refrigerator",
  icon: "Refrigerator",
  watts: { low: 80, typ: 110, high: 160 },
  duty: { low: 0.25, typ: 0.35, high: 0.5 },
  defaultHours: 24,
  hoursUncertainty: 0.02,
  alwaysOn: true,
};
