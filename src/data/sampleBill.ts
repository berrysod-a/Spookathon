import type { Bill } from "@/lib/types";

/** The sample KSEB bill used for the "Use sample bill" button. Never remove this fallback. */
export const SAMPLE_BILL: Bill = {
  prevReadingDate: "2024-05-11",
  presentReadingDate: "2024-07-11",
  prevReading: 12895,
  presentReading: 13176,
  units: 281,
  fixedCharge: 178.5,
  energyCharge: 1128.6,
  fuelSurcharge: 25.29,
  autoRecoverySurcharge: 28.1,
  electricityDuty: 112.86,
  otherCharges: 0,
  roundOff: -0.35,
  total: 1473,
  connectedLoadW: 3155,
};
