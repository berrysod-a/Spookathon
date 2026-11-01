/**
 * Time blocks used for usage input and time-of-day costing.
 * Each block sits inside ONE Kerala ToD zone so costing stays simple.
 * KSEB has proposed changing peak timings in a future tariff revision, so edit this file (not the
 * components) when the hours change. Verify against the current KSERC order before the demo.
 */
export type BlockId = "earlyMorning" | "morning" | "afternoon" | "evening" | "lateNight";
export type TodZone = "night" | "day" | "peak";

export interface TimeBlock {
  id: BlockId;
  label: string; // English label; Malayalam comes from the translation file via key `block.<id>`
  startHour: number; // 0-23, inclusive
  endHour: number; // exclusive; may be < startHour when the block wraps past midnight
  hours: number; // length of the block in hours
  zone: TodZone;
}

export const TIME_BLOCKS: TimeBlock[] = [
  { id: "earlyMorning", label: "Early morning (4 to 6 am)", startHour: 4, endHour: 6, hours: 2, zone: "night" },
  { id: "morning", label: "Morning (6 am to 12 pm)", startHour: 6, endHour: 12, hours: 6, zone: "day" },
  { id: "afternoon", label: "Afternoon (12 to 6 pm)", startHour: 12, endHour: 18, hours: 6, zone: "day" },
  { id: "evening", label: "Evening (6 to 10 pm)", startHour: 18, endHour: 22, hours: 4, zone: "peak" },
  { id: "lateNight", label: "Night (10 pm to 4 am)", startHour: 22, endHour: 4, hours: 6, zone: "night" },
];

export const BLOCK_IDS = TIME_BLOCKS.map((b) => b.id) as BlockId[];
export const BLOCK_BY_ID = Object.fromEntries(TIME_BLOCKS.map((b) => [b.id, b])) as Record<BlockId, TimeBlock>;

/**
 * ToD rules for domestic consumers above the monthly threshold (circular for 2025-27):
 * 10% off the energy charge in the day, 25% extra in the peak, normal rate otherwise.
 * ASSUMPTION: the multiplier is applied to the energy charge only. Verify, and keep it labelled.
 */
export const TOD = {
  monthlyUnitThreshold: 250,
  multiplier: { night: 1, day: 0.9, peak: 1.25 } as Record<TodZone, number>,
};
