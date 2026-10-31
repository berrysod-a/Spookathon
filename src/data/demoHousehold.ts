import type { ApplianceSelection, FridgeInput } from "@/lib/types";

/**
 * Preset for the live demo ("Try a sample household"). Deliberately incomplete so the
 * "Not covered by your list" segment is a real finding; the user then ticks the water pump
 * or a second fridge and watches the gap shrink.
 */
export const DEMO_SELECTIONS: ApplianceSelection[] = [
  { id: "ceiling-fan", qty: 2, hoursPerDay: 6 },
  { id: "led-bulb", qty: 5, hoursPerDay: 4 },
  { id: "wifi-router", qty: 1, hoursPerDay: 24 },
  { id: "set-top-box", qty: 1, hoursPerDay: 24 },
];

export const DEMO_FRIDGE: FridgeInput = {
  litres: 250,
  type: "frost-free",
  ageYears: 15,
  stars: 0,
  newFridgePrice: 25000,
};
