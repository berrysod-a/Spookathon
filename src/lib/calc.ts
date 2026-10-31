import { APPLIANCE_BY_ID } from "@/data/appliances";
import { FRIDGE_BASELINE, STAR_FACTOR, ageFactor } from "@/data/fridgeTable";
import type { Upgrade } from "@/data/upgrades";
import type {
  ApplianceDef,
  ApplianceSelection,
  Bill,
  BillMetrics,
  Breakdown,
  BreakdownItem,
  ExtraItem,
  FridgeInput,
  FridgeResult,
  PlanAction,
  PlanProgress,
  Range,
  ValidationIssue,
} from "./types";

/* ------------------------------------------------------------------ helpers */

const DAY_MS = 86_400_000;

export const round = (n: number, dp = 2) => {
  const f = 10 ** dp;
  return Math.round((n + Number.EPSILON) * f) / f;
};

export function daysBetween(fromIso: string, toIso: string): number {
  const [fy, fm, fd] = fromIso.split("-").map(Number);
  const [ty, tm, td] = toIso.split("-").map(Number);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / DAY_MS);
}

const scaleRange = (r: Range, k: number): Range => ({ low: r.low * k, typ: r.typ * k, high: r.high * k });
const addRange = (a: Range, b: Range): Range => ({ low: a.low + b.low, typ: a.typ + b.typ, high: a.high + b.high });
const ZERO: Range = { low: 0, typ: 0, high: 0 };

export const formatINR = (n: number, dp = 0) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: dp, minimumFractionDigits: dp }).format(n);

export const formatRangeINR = (r: Range) => `${formatINR(r.low)} to ${formatINR(r.high)}`;
export const formatRangeUnits = (r: Range) => `${Math.round(r.low)} to ${Math.round(r.high)} units`;

/* -------------------------------------------------------------- bill metrics */

export function billMetrics(bill: Bill): BillMetrics {
  const days = Math.max(1, daysBetween(bill.prevReadingDate, bill.presentReadingDate));
  const units = Math.max(1, bill.units);
  const variableTotal = bill.energyCharge + bill.fuelSurcharge + bill.autoRecoverySurcharge + bill.electricityDuty;
  return {
    days,
    unitsPerDay: bill.units / days,
    avgWatts: (bill.units * 1000) / (days * 24),
    variableTotal,
    allInRate: bill.total / units,
    // The rate to use for EVERY savings figure. The fixed charge does not fall when usage falls.
    marginalRate: variableTotal / units,
    fixedShare: bill.total > 0 ? bill.fixedCharge / bill.total : 0,
  };
}

/** Checks run on the confirm screen. Errors are shown in red; warnings in amber. */
export function validateBill(bill: Bill): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const readingDiff = round(bill.presentReading - bill.prevReading, 2);
  if (Math.abs(readingDiff - bill.units) > 0.5) {
    issues.push({
      field: "units",
      severity: "error",
      message: `Units (${bill.units}) should equal present reading minus previous reading (${readingDiff}). Check the meter readings.`,
    });
  }

  const sum =
    bill.fixedCharge + bill.energyCharge + bill.fuelSurcharge + bill.autoRecoverySurcharge +
    bill.electricityDuty + bill.otherCharges + bill.roundOff;
  if (Math.abs(sum - bill.total) > 1) {
    issues.push({
      field: "charges",
      severity: "error",
      message: `The charges add up to ${formatINR(sum, 2)} but the total says ${formatINR(bill.total, 2)}. One of the amounts may be misread.`,
    });
  }

  const days = daysBetween(bill.prevReadingDate, bill.presentReadingDate);
  if (days <= 0) {
    issues.push({ field: "presentReadingDate", severity: "error", message: "The present reading date must be after the previous one." });
  } else if (days < 20 || days > 70) {
    issues.push({ field: "presentReadingDate", severity: "warning", message: `${days} days is unusual for a billing period. Check the dates.` });
  }

  if (bill.units <= 0) issues.push({ field: "units", severity: "error", message: "Units must be greater than zero." });
  return issues;
}

/* ------------------------------------------------------- appliance estimates */

/** units = qty x watts x duty x hours x days / 1000, as a low / typical / high range. */
export function estimateAppliance(def: ApplianceDef, sel: ApplianceSelection, days: number): Range {
  const h = Math.min(24, Math.max(0, sel.hoursPerDay));
  const hLow = Math.max(0, h * (1 - def.hoursUncertainty));
  const hHigh = Math.min(24, h * (1 + def.hoursUncertainty));
  const k = (sel.qty * days) / 1000;
  return {
    low: def.watts.low * def.duty.low * hLow * k,
    typ: def.watts.typ * def.duty.typ * h * k,
    high: def.watts.high * def.duty.high * hHigh * k,
  };
}

/* ------------------------------------------------------------------- fridge */

function fridgeBaseline(type: FridgeInput["type"], litres: number): number {
  const row = FRIDGE_BASELINE.find((r) => r.type === type && litres <= r.maxLitres);
  return (row ?? FRIDGE_BASELINE.filter((r) => r.type === type).slice(-1)[0]).kwhPerYear;
}

/** Annual kWh for the fridge the user already owns. */
export function fridgeOldAnnual(input: FridgeInput): { range: Range; confidence: "rough" | "label" } {
  const labelBased = typeof input.labelKwhPerYear === "number" && input.labelKwhPerYear > 0;
  const base = labelBased
    ? (input.labelKwhPerYear as number)
    : fridgeBaseline(input.type, input.litres) * STAR_FACTOR[input.stars];
  const typ = base * ageFactor(input.ageYears);
  const spread = labelBased ? 0.08 : 0.15;
  return { range: { low: typ * (1 - spread), typ, high: typ * (1 + spread) }, confidence: labelBased ? "label" : "rough" };
}

/** Annual kWh for a new 5-star fridge of the same type and size. */
export function fridgeNewAnnual(input: FridgeInput): Range {
  const typ = fridgeBaseline(input.type, input.litres) * STAR_FACTOR[5];
  return { low: typ * 0.9, typ, high: typ * 1.1 };
}

/** Converts the fridge into a breakdown row for the billing period. */
export function fridgeExtraItem(input: FridgeInput, days: number): ExtraItem {
  const { range, confidence } = fridgeOldAnnual(input);
  return { id: "fridge", name: "Refrigerator", qty: 1, units: scaleRange(range, days / 365), confidence };
}

export function fridgeReplaceOrKeep(input: FridgeInput, marginalRate: number): FridgeResult {
  const old = fridgeOldAnnual(input);
  const next = fridgeNewAnnual(input);
  const saving: Range = {
    low: Math.max(0, (old.range.low - next.high) * marginalRate),
    typ: Math.max(0, (old.range.typ - next.typ) * marginalRate),
    high: Math.max(0, (old.range.high - next.low) * marginalRate),
  };

  let paybackYears: Range | null = null;
  if (input.newFridgePrice && input.newFridgePrice > 0 && saving.typ > 0) {
    const p = input.newFridgePrice;
    paybackYears = { low: p / Math.max(saving.high, 1), typ: p / saving.typ, high: saving.low > 1 ? p / saving.low : 99 };
  }

  let verdict: FridgeResult["verdict"] = "fix-first";
  if (saving.typ <= 0) verdict = "no-saving";
  else if (paybackYears) {
    // ASSUMPTION: thresholds are a judgement call, shown to the user as such.
    verdict = paybackYears.typ <= 5 ? "worth-it" : paybackYears.typ <= 10 ? "borderline" : "fix-first";
  }

  return { oldAnnualKwh: old.range, newAnnualKwh: next, annualSavingRupees: saving, paybackYears, verdict, confidence: old.confidence };
}

/* ---------------------------------------------------------------- upgrades */

export function upgradePayback(u: Upgrade, qty: number, hoursPerDay: number, marginalRate: number) {
  const kwhYear = ((u.oldWatts - u.newWatts) * hoursPerDay * 365 * qty) / 1000;
  const rupeesYear = kwhYear * marginalRate;
  const cost = u.pricePerUnitItem * qty;
  return { kwhYear, rupeesYear, cost, paybackYears: rupeesYear > 0 ? cost / rupeesYear : null };
}

/** Yearly cost of one always-on device at typical values. */
export function alwaysOnYearly(def: ApplianceDef, qty: number, marginalRate: number) {
  const kwh = (qty * def.watts.typ * def.duty.typ * 24 * 365) / 1000;
  return { kwh, rupees: kwh * marginalRate };
}

/* --------------------------------------------------------------- breakdown */

export function computeBreakdown(
  bill: Bill,
  metrics: BillMetrics,
  selections: ApplianceSelection[],
  extras: ExtraItem[] = [],
): Breakdown {
  const rate = metrics.marginalRate;
  const items: BreakdownItem[] = [];

  for (const sel of selections) {
    const def = APPLIANCE_BY_ID[sel.id];
    if (!def || sel.qty <= 0) continue;
    const units = estimateAppliance(def, sel, metrics.days);
    items.push({
      id: def.id, name: def.name, qty: sel.qty, units, cost: scaleRange(units, rate),
      shareOfBill: units.typ / bill.units, confidence: "rough",
    });
  }
  for (const x of extras) {
    items.push({
      id: x.id, name: x.name, qty: x.qty, units: x.units, cost: scaleRange(x.units, rate),
      shareOfBill: x.units.typ / bill.units, confidence: x.confidence,
    });
  }
  items.sort((a, b) => b.units.typ - a.units.typ);

  const listed = items.reduce((acc, i) => addRange(acc, i.units), ZERO);
  const unaccounted: Range = {
    low: Math.max(0, bill.units - listed.high), // best case for the user's list
    typ: Math.max(0, bill.units - listed.typ),
    high: Math.max(0, bill.units - listed.low), // worst case
  };
  const overBy = Math.max(0, listed.low - bill.units);

  // Only call it a finding if even the low end of the gap is above zero.
  const status = overBy > 0 ? "over-listed" : unaccounted.low > 0 ? "finding" : "roughly-explained";

  return { items, listed, unaccounted, unaccountedCost: scaleRange(unaccounted, rate), status, overBy };
}

/* ------------------------------------------------------------ savings plan */

export function buildActions(selections: ApplianceSelection[], metrics: BillMetrics): PlanAction[] {
  const out: PlanAction[] = [];
  for (const sel of selections) {
    const def = APPLIANCE_BY_ID[sel.id];
    if (!def?.actions || sel.qty <= 0) continue;
    const typicalUnits = estimateAppliance(def, sel, metrics.days).typ;
    for (const a of def.actions) {
      let unitsSaved = 0;
      if (a.kind === "hours") {
        const hours = Math.min(a.hoursSaved, sel.hoursPerDay);
        unitsSaved = (sel.qty * def.watts.typ * def.duty.typ * hours * metrics.days) / 1000;
      } else {
        unitsSaved = typicalUnits * a.pct;
      }
      if (unitsSaved <= 0) continue;
      out.push({
        id: `${def.id}:${a.id}`, applianceId: def.id, label: a.label,
        unitsSaved, rupeesSaved: unitsSaved * metrics.marginalRate, free: a.free,
      });
    }
  }
  return out.sort((a, b) => b.rupeesSaved - a.rupeesSaved);
}

export const targetToUnits = (targetRupees: number, marginalRate: number) => targetRupees / marginalRate;

export function planProgress(actions: PlanAction[], selectedIds: string[], targetRupees: number, marginalRate: number): PlanProgress {
  const chosen = actions.filter((a) => selectedIds.includes(a.id));
  const savedUnits = chosen.reduce((s, a) => s + a.unitsSaved, 0);
  const savedRupees = chosen.reduce((s, a) => s + a.rupeesSaved, 0);
  return {
    targetRupees,
    targetUnits: targetToUnits(targetRupees, marginalRate),
    savedRupees,
    savedUnits,
    pct: targetRupees > 0 ? Math.min(1, savedRupees / targetRupees) : 0,
    remainingRupees: Math.max(0, targetRupees - savedRupees),
    met: savedRupees >= targetRupees && targetRupees > 0,
  };
}
