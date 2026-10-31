import type { FridgeType } from "@/lib/types";

/**
 * ILLUSTRATIVE annual kWh for a typical 3-star-equivalent fridge, by type and size band.
 * TODO: replace with BEE star-label data and keep a `source` string visible in the UI.
 */
export const FRIDGE_BASELINE: { type: FridgeType; maxLitres: number; kwhPerYear: number }[] = [
  { type: "direct-cool", maxLitres: 200, kwhPerYear: 250 },
  { type: "direct-cool", maxLitres: 300, kwhPerYear: 330 },
  { type: "direct-cool", maxLitres: 9999, kwhPerYear: 400 },
  { type: "frost-free", maxLitres: 250, kwhPerYear: 380 },
  { type: "frost-free", maxLitres: 350, kwhPerYear: 450 },
  { type: "frost-free", maxLitres: 9999, kwhPerYear: 560 },
];

/** Multiplier vs the 3-star baseline. 0 = unrated / pre-label. ASSUMPTION: show as an assumption in the UI. */
export const STAR_FACTOR: Record<0 | 1 | 2 | 3 | 4 | 5, number> = {
  0: 1.2,
  1: 1.12,
  2: 1.06,
  3: 1.0,
  4: 0.88,
  5: 0.75,
};

/** Wear multiplier by age (compressor wear, worn door seal, frost build-up). ASSUMPTION: show as an assumption. */
export function ageFactor(ageYears: number): number {
  if (ageYears < 5) return 1.0;
  if (ageYears < 10) return 1.05;
  if (ageYears < 15) return 1.15;
  return 1.25;
}

export const FRIDGE_FIX_FIRST_STEPS = [
  "Check the door seal: a paper strip should grip when the door is closed on it.",
  "Defrost, and clean the coils at the back.",
  "Leave a gap behind the fridge and keep it away from heat and direct sun.",
  "Set the recommended temperature, not the coldest.",
  "Only then compare against a replacement.",
];
