import { APPLIANCE_BY_ID } from "@/data/appliances";
import { APPLIANCE_META, FRIDGE_DEF } from "@/data/applianceMeta";
import { BLOCK_BY_ID, BLOCK_IDS, TIME_BLOCKS, TOD, type BlockId } from "@/data/timeBlocks";
import { fridgeNewAnnual, fridgeOldAnnual, estimateAppliance } from "./calc";
import { STAR_FACTOR, ageFactor } from "@/data/fridgeTable";
import type {
  ActionTemplate, ApplianceDef, Bill, BillMetrics, Confidence, ExtraItem, FridgeInput, FridgeType, PlanAction, Range,
} from "./types";

/* ------------------------------------------------------------------ types */

/** Hours of use inside each time block, for a typical weekday and a typical weekend day. */
export interface WeeklyUsage {
  weekday: Partial<Record<BlockId, number>>;
  weekend: Partial<Record<BlockId, number>>;
}

export interface EfficiencyInput {
  ageYears?: number;
  stars?: 0 | 1 | 2 | 3 | 4 | 5; // 0 = unrated / pre-label
  nameplateWatts?: number; // from the sticker
  labelKwhPerYear?: number; // BEE label figure, if the user has it
  capacityLitres?: number; // fridges
  fridgeType?: FridgeType; // fridges
  replacementPrice?: number; // rupees
}

export interface ApplianceEntry {
  uid: string; // unique per row so the same appliance can appear twice
  defId: string; // id in APPLIANCES / FRIDGE_DEF, or "custom"
  name: string;
  qty: number;
  usage: WeeklyUsage;
  custom?: { watts: Range; duty: Range; hoursUncertainty?: number }; // for user-added appliances
  efficiency?: EfficiencyInput;
}

export interface ShiftAction extends PlanAction {
  helpsGrid: true;
  unitsShifted: number;
}

/* --------------------------------------------------------- usage helpers */

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

/** Clamp each block to its length and to >= 0. */
export function clampUsage(u: WeeklyUsage): WeeklyUsage {
  const fix = (m: Partial<Record<BlockId, number>>) => {
    const out: Partial<Record<BlockId, number>> = {};
    for (const id of BLOCK_IDS) {
      const v = m[id] ?? 0;
      out[id] = Math.min(BLOCK_BY_ID[id].hours, Math.max(0, v));
    }
    return out;
  };
  return { weekday: fix(u.weekday), weekend: fix(u.weekend) };
}

export const dayHours = (m: Partial<Record<BlockId, number>>) => sum(BLOCK_IDS.map((id) => m[id] ?? 0));

/** Average hours per day over a week: five weekdays and two weekend days. */
export function weeklyAvgHoursPerDay(u: WeeklyUsage): number {
  return (5 * dayHours(u.weekday) + 2 * dayHours(u.weekend)) / 7;
}

export function weeklyAvgHoursInBlock(u: WeeklyUsage, id: BlockId): number {
  return (5 * (u.weekday[id] ?? 0) + 2 * (u.weekend[id] ?? 0)) / 7;
}

/** Same hours on every day: handy for presets and for the "same every day" toggle in the UI. */
export function uniformUsage(perBlock: Partial<Record<BlockId, number>>): WeeklyUsage {
  return { weekday: { ...perBlock }, weekend: { ...perBlock } };
}

/* -------------------------------------------------------------- presets */

/** Typical Kerala household patterns (morning news, evening serials, fans at night and early morning). */
const PRESETS: Record<string, WeeklyUsage> = {
  "ceiling-fan": uniformUsage({ earlyMorning: 1.5, afternoon: 0.5, evening: 2, lateNight: 4 }),
  tv: {
    weekday: { morning: 1, evening: 3 },
    weekend: { morning: 1.5, afternoon: 1, evening: 3 },
  },
  "led-bulb": uniformUsage({ earlyMorning: 1, evening: 4 }),
  "tube-light": uniformUsage({ earlyMorning: 1, evening: 3 }),
  "incandescent-bulb": uniformUsage({ evening: 4 }),
  "set-top-box": uniformUsage({ earlyMorning: 2, morning: 6, afternoon: 6, evening: 4, lateNight: 6 }),
  "wifi-router": uniformUsage({ earlyMorning: 2, morning: 6, afternoon: 6, evening: 4, lateNight: 6 }),
  fridge: uniformUsage({ earlyMorning: 2, morning: 6, afternoon: 6, evening: 4, lateNight: 6 }),
  "second-fridge": uniformUsage({ earlyMorning: 2, morning: 6, afternoon: 6, evening: 4, lateNight: 6 }),
  "inverter-ups": uniformUsage({ earlyMorning: 2, morning: 6, afternoon: 6, evening: 4, lateNight: 6 }),
  "washing-machine": { weekday: {}, weekend: { morning: 2.5 } },
  "water-pump": uniformUsage({ earlyMorning: 0.25, morning: 0.5 }),
  geyser: uniformUsage({ earlyMorning: 0.25, morning: 0.25 }),
  iron: { weekday: { earlyMorning: 0.25 }, weekend: { morning: 0.25 } },
  laptop: { weekday: { afternoon: 2, evening: 2 }, weekend: { afternoon: 2, evening: 2 } },
  "phone-charger": uniformUsage({ lateNight: 3 }),
  "ac-split": uniformUsage({ lateNight: 4 }),
  induction: uniformUsage({ earlyMorning: 0.25, evening: 0.5 }),
};

/** Starting usage for a newly added appliance; the user edits it afterwards. */
export function defaultUsageFor(defId: string, fallbackHoursPerDay = 2): WeeklyUsage {
  const p = PRESETS[defId];
  if (p) return clampUsage(p);
  // Unknown or custom appliance: put the hours in the evening, spill into the afternoon.
  const evening = Math.min(4, fallbackHoursPerDay);
  return clampUsage(uniformUsage({ evening, afternoon: Math.max(0, fallbackHoursPerDay - evening) }));
}

/* ------------------------------------------------------ entry -> def/units */

export function resolveDef(entry: ApplianceEntry): ApplianceDef {
  if (entry.defId === "custom") {
    const c = entry.custom ?? { watts: { low: 50, typ: 100, high: 150 }, duty: { low: 1, typ: 1, high: 1 } };
    return {
      id: entry.uid, name: entry.name, icon: "Plug", watts: c.watts, duty: c.duty,
      defaultHours: 2, hoursUncertainty: c.hoursUncertainty ?? 0.3,
    };
  }
  if (entry.defId === "fridge") return FRIDGE_DEF;
  const def = APPLIANCE_BY_ID[entry.defId];
  if (!def) throw new Error(`Unknown appliance: ${entry.defId}`);
  return def;
}

const scale = (r: Range, k: number): Range => ({ low: r.low * k, typ: r.typ * k, high: r.high * k });

/** Applies the user's efficiency inputs (nameplate, label, star, age, fridge size) to the base appliance. */
export function effectiveDef(entry: ApplianceEntry): { def: ApplianceDef; confidence: Confidence } {
  const base = resolveDef(entry);
  const e = entry.efficiency;
  const meta = APPLIANCE_META[entry.defId];
  if (!e) return { def: base, confidence: "rough" };

  // Fridges: reuse the table-based fridge model when size and type are known, or the label kWh is typed.
  if (meta?.category === "fridge" && (e.labelKwhPerYear || (e.capacityLitres && e.fridgeType))) {
    const input: FridgeInput = {
      litres: e.capacityLitres ?? 250, type: e.fridgeType ?? "frost-free", ageYears: e.ageYears ?? 5,
      stars: e.stars ?? 3, labelKwhPerYear: e.labelKwhPerYear,
    };
    const old = fridgeOldAnnual(input);
    const duty = base.duty.typ;
    const w = (kwh: number) => (kwh * 1000) / (8760 * duty);
    return {
      def: { ...base, watts: { low: w(old.range.low), typ: w(old.range.typ), high: w(old.range.high) }, duty: { low: duty, typ: duty, high: duty } },
      confidence: old.confidence,
    };
  }

  if (e.nameplateWatts && e.nameplateWatts > 0) {
    const w = e.nameplateWatts;
    return { def: { ...base, watts: { low: w * 0.85, typ: w, high: w } }, confidence: "label" };
  }

  if (e.stars !== undefined || e.ageYears !== undefined) {
    // ASSUMPTION: generic star and age factors; label them as assumptions in the UI.
    const k = (e.stars !== undefined ? STAR_FACTOR[e.stars] : 1) * (e.ageYears !== undefined ? ageFactor(e.ageYears) : 1);
    return { def: { ...base, watts: scale(base.watts, k) }, confidence: "rough" };
  }
  return { def: base, confidence: "rough" };
}

/** Units for the whole billing period, as a range, using the weekly average hours per day. */
export function estimateEntry(entry: ApplianceEntry, days: number): Range {
  const { def } = effectiveDef(entry);
  return estimateAppliance(def, { id: def.id, qty: entry.qty, hoursPerDay: weeklyAvgHoursPerDay(entry.usage) }, days);
}

/** Units per time block for the billing period. */
export function estimateEntryByBlock(entry: ApplianceEntry, days: number): Record<BlockId, Range> {
  const { def } = effectiveDef(entry);
  const out = {} as Record<BlockId, Range>;
  for (const id of BLOCK_IDS) {
    out[id] = estimateAppliance(def, { id: def.id, qty: entry.qty, hoursPerDay: weeklyAvgHoursInBlock(entry.usage, id) }, days);
  }
  return out;
}

/** Entries as breakdown rows; feed the result to computeBreakdown(bill, metrics, [], extras). */
export function entriesToExtras(entries: ApplianceEntry[], days: number): ExtraItem[] {
  return entries
    .filter((e) => e.qty > 0)
    .map((e) => ({
      id: e.uid, name: e.name, qty: e.qty, units: estimateEntry(e, days), confidence: effectiveDef(e).confidence,
    }));
}

/* ------------------------------------------------------- time-of-day costing */

export function monthlyUnits(bill: Bill, metrics: BillMetrics): number {
  return (bill.units / metrics.days) * 30;
}

/** ToD pricing only applies above the monthly threshold; below it, shifting does not change the bill. */
export function todApplies(bill: Bill, metrics: BillMetrics): boolean {
  return monthlyUnits(bill, metrics) > TOD.monthlyUnitThreshold;
}

/** Rupees per extra unit in each block. Flat marginal rate unless ToD applies. */
export function blockRates(bill: Bill, metrics: BillMetrics): Record<BlockId, number> {
  const out = {} as Record<BlockId, number>;
  const tod = todApplies(bill, metrics);
  const energyRate = bill.energyCharge / bill.units;
  const otherRate = metrics.marginalRate - energyRate;
  for (const b of TIME_BLOCKS) {
    out[b.id] = tod ? energyRate * TOD.multiplier[b.zone] + otherRate : metrics.marginalRate;
  }
  return out;
}

/** Estimated units and rupees per block across all appliances (for the 24-hour chart). */
export function usageByBlock(entries: ApplianceEntry[], bill: Bill, metrics: BillMetrics) {
  const rates = blockRates(bill, metrics);
  const units = {} as Record<BlockId, Range>;
  for (const id of BLOCK_IDS) units[id] = { low: 0, typ: 0, high: 0 };
  for (const e of entries) {
    if (e.qty <= 0) continue;
    const per = estimateEntryByBlock(e, metrics.days);
    for (const id of BLOCK_IDS) {
      units[id] = { low: units[id].low + per[id].low, typ: units[id].typ + per[id].typ, high: units[id].high + per[id].high };
    }
  }
  const rupees = Object.fromEntries(BLOCK_IDS.map((id) => [id, scale(units[id], rates[id])])) as Record<BlockId, Range>;
  const totalTyp = sum(BLOCK_IDS.map((id) => units[id].typ));
  const peakShare = totalTyp > 0 ? units.evening.typ / totalTyp : 0;
  return { units, rupees, rates, peakShare, todApplies: todApplies(bill, metrics) };
}

/** Typical units per day for each day of the week (five weekdays, two weekend days). */
export function weeklyProfile(entries: ApplianceEntry[]) {
  const perDay = (kind: "weekday" | "weekend") => {
    let kwh = 0;
    for (const e of entries) {
      if (e.qty <= 0) continue;
      const { def } = effectiveDef(e);
      kwh += (e.qty * def.watts.typ * def.duty.typ * dayHours(e.usage[kind])) / 1000;
    }
    return kwh;
  };
  const wd = perDay("weekday");
  const we = perDay("weekend");
  return { weekdayKwh: wd, weekendKwh: we, week: [wd, wd, wd, wd, wd, we, we] };
}

/* ------------------------------------------------------------------ actions */

/** Reduce-hours and percent actions, now keyed by entry so duplicates and custom rows work. */
export function buildEntryActions(entries: ApplianceEntry[], metrics: BillMetrics): PlanAction[] {
  const out: PlanAction[] = [];
  for (const e of entries) {
    if (e.qty <= 0 || e.defId === "custom") continue;
    const base = resolveDef(e);
    const templates: ActionTemplate[] = base.actions ?? [];
    const { def } = effectiveDef(e);
    const avg = weeklyAvgHoursPerDay(e.usage);
    const typical = estimateEntry(e, metrics.days).typ;
    for (const a of templates) {
      const unitsSaved =
        a.kind === "hours"
          ? (e.qty * def.watts.typ * def.duty.typ * Math.min(a.hoursSaved, avg) * metrics.days) / 1000
          : typical * a.pct;
      if (unitsSaved <= 0) continue;
      out.push({
        id: `${e.uid}:${a.id}`, applianceId: e.uid, label: `${e.name}: ${a.label}`,
        unitsSaved, rupeesSaved: unitsSaved * metrics.marginalRate, free: a.free,
      });
    }
  }
  return out.sort((a, b) => b.rupeesSaved - a.rupeesSaved);
}

/**
 * "Run it in the daytime instead of the evening" for shiftable appliances.
 * Rupees are only non-zero when ToD pricing applies; otherwise the action is shown as helping the grid.
 */
export function buildShiftActions(entries: ApplianceEntry[], bill: Bill, metrics: BillMetrics): ShiftAction[] {
  const rates = blockRates(bill, metrics);
  const out: ShiftAction[] = [];
  for (const e of entries) {
    if (e.qty <= 0 || !APPLIANCE_META[e.defId]?.shiftable) continue;
    const eveningHours = weeklyAvgHoursInBlock(e.usage, "evening");
    if (eveningHours <= 0) continue;
    const { def } = effectiveDef(e);
    const unitsShifted = (e.qty * def.watts.typ * def.duty.typ * eveningHours * metrics.days) / 1000;
    const rupeesSaved = unitsShifted * Math.max(0, rates.evening - rates.afternoon);
    out.push({
      id: `${e.uid}:shift`, applianceId: e.uid, label: `${e.name}: run it in the daytime, not 6 to 10 pm`,
      unitsSaved: 0, unitsShifted, rupeesSaved, free: true, helpsGrid: true,
    });
  }
  return out.sort((a, b) => b.rupeesSaved - a.rupeesSaved);
}

/* ------------------------------------------------------- efficiency check */

export interface EfficiencyResult {
  currentAnnualKwh: Range;
  modernAnnualKwh: Range;
  annualSavingRupees: Range;
  ratio: number; // current / modern, typical values
  newness: "about-as-efficient-as-new" | "somewhat-less-efficient" | "much-less-efficient";
  paybackYears: Range | null;
  verdict: "worth-it" | "borderline" | "fix-first" | "no-saving";
  confidence: Confidence;
}

/** Compares one appliance against a modern equivalent. Needs a fridge model or APPLIANCE_META.modernWatts. */
export function efficiencyCheck(entry: ApplianceEntry, marginalRate: number): EfficiencyResult | null {
  const meta = APPLIANCE_META[entry.defId];
  if (!meta) return null;
  const { def, confidence } = effectiveDef(entry);
  const hours = weeklyAvgHoursPerDay(entry.usage);
  const annual = (watts: number, duty: number) => (entry.qty * watts * duty * hours * 365) / 1000;

  const current: Range = {
    low: annual(def.watts.low, def.duty.low),
    typ: annual(def.watts.typ, def.duty.typ),
    high: annual(def.watts.high, def.duty.high),
  };

  let modern: Range;
  if (meta.category === "fridge") {
    const e = entry.efficiency ?? {};
    modern = scale(fridgeNewAnnual({
      litres: e.capacityLitres ?? 250, type: e.fridgeType ?? "frost-free", ageYears: 0, stars: 5,
    }), entry.qty);
  } else if (meta.modernWatts) {
    const typ = annual(meta.modernWatts, def.duty.typ);
    modern = { low: typ * 0.9, typ, high: typ * 1.1 };
  } else {
    return null; // no modern benchmark for this category
  }

  const saving: Range = {
    low: Math.max(0, (current.low - modern.high) * marginalRate),
    typ: Math.max(0, (current.typ - modern.typ) * marginalRate),
    high: Math.max(0, (current.high - modern.low) * marginalRate),
  };
  const ratio = modern.typ > 0 ? current.typ / modern.typ : 1;
  const newness = ratio <= 1.1 ? "about-as-efficient-as-new" : ratio <= 1.4 ? "somewhat-less-efficient" : "much-less-efficient";

  const price = entry.efficiency?.replacementPrice ?? meta.defaultReplacementPrice;
  let paybackYears: Range | null = null;
  if (price && saving.typ > 0) {
    paybackYears = { low: price / Math.max(saving.high, 1), typ: price / saving.typ, high: saving.low > 1 ? price / saving.low : 99 };
  }
  // ASSUMPTION: thresholds are a judgement call, shown to the user as such.
  let verdict: EfficiencyResult["verdict"] = "fix-first";
  if (saving.typ <= 0) verdict = "no-saving";
  else if (paybackYears) verdict = paybackYears.typ <= 5 ? "worth-it" : paybackYears.typ <= 10 ? "borderline" : "fix-first";

  return { currentAnnualKwh: current, modernAnnualKwh: modern, annualSavingRupees: saving, ratio, newness, paybackYears, verdict, confidence };
}
