import { describe, expect, it } from "vitest";
import { SAMPLE_BILL } from "@/data/sampleBill";
import { DEMO_ENTRIES } from "@/data/demoEntries";
import { billMetrics, computeBreakdown } from "./calc";
import {
  blockRates, buildEntryActions, buildShiftActions, clampUsage, defaultUsageFor, efficiencyCheck,
  entriesToExtras, estimateEntry, estimateEntryByBlock, todApplies, uniformUsage, usageByBlock,
  weeklyAvgHoursPerDay, weeklyProfile, type ApplianceEntry,
} from "./schedule";
import { BLOCK_IDS } from "@/data/timeBlocks";

const m = billMetrics(SAMPLE_BILL);
const entry = (defId: string, name: string, qty: number, usage = defaultUsageFor(defId), extra: Partial<ApplianceEntry> = {}): ApplianceEntry =>
  ({ uid: `${defId}-t`, defId, name, qty, usage, ...extra });

describe("weekly usage", () => {
  it("averages five weekdays and two weekend days", () => {
    const tv = defaultUsageFor("tv"); // weekday 4 h, weekend 5.5 h
    expect(weeklyAvgHoursPerDay(tv)).toBeCloseTo((5 * 4 + 2 * 5.5) / 7, 6);
  });
  it("clamps hours to each block's length", () => {
    const u = clampUsage({ weekday: { evening: 9, morning: -2 }, weekend: {} });
    expect(u.weekday.evening).toBe(4);
    expect(u.weekday.morning).toBe(0);
  });
  it("gives every preset at most 24 hours a day", () => {
    for (const id of ["ceiling-fan", "tv", "set-top-box", "fridge", "ac-split", "washing-machine"]) {
      const u = defaultUsageFor(id);
      expect(weeklyAvgHoursPerDay(u)).toBeLessThanOrEqual(24);
    }
  });
  it("falls back to the evening for unknown appliances", () => {
    const u = defaultUsageFor("something-new", 3);
    expect(u.weekday.evening).toBe(3);
  });
});

describe("per-block estimates", () => {
  it("per-block typical units add up to the whole-period estimate", () => {
    const e = entry("ceiling-fan", "Fan", 2);
    const total = estimateEntry(e, m.days).typ;
    const blocks = estimateEntryByBlock(e, m.days);
    const sum = BLOCK_IDS.reduce((s, id) => s + blocks[id].typ, 0);
    expect(sum).toBeCloseTo(total, 6);
  });
});

describe("time-of-day pricing", () => {
  const bigBill = { ...SAMPLE_BILL, units: 600, prevReading: 12895, presentReading: 13495, energyCharge: 2400, total: 3000, fuelSurcharge: 60, autoRecoverySurcharge: 60, electricityDuty: 240, fixedCharge: 240, roundOff: 0 };
  const bm = billMetrics(bigBill);
  it("does not apply to the sample household (about 138 units a month)", () => {
    expect(todApplies(SAMPLE_BILL, m)).toBe(false);
    const r = blockRates(SAMPLE_BILL, m);
    expect(new Set(Object.values(r)).size).toBe(1);
  });
  it("applies above 250 units a month, with peak dearer than day", () => {
    expect(todApplies(bigBill, bm)).toBe(true);
    const r = blockRates(bigBill, bm);
    expect(r.evening).toBeGreaterThan(r.afternoon);
    expect(r.afternoon).toBeLessThan(r.lateNight);
  });
  it("makes shift actions worth rupees only under ToD, and always flags grid help", () => {
    const wm = entry("washing-machine", "Washing machine", 1, uniformUsage({ evening: 1 }));
    const flat = buildShiftActions([wm], SAMPLE_BILL, m)[0];
    expect(flat.helpsGrid).toBe(true);
    expect(flat.rupeesSaved).toBe(0);
    const tod = buildShiftActions([wm], bigBill, bm)[0];
    expect(tod.rupeesSaved).toBeGreaterThan(0);
  });
  it("reports the evening share of usage", () => {
    const u = usageByBlock(DEMO_ENTRIES, SAMPLE_BILL, m);
    expect(u.peakShare).toBeGreaterThan(0);
    expect(u.peakShare).toBeLessThan(1);
    expect(u.todApplies).toBe(false);
  });
});

describe("entries feed the existing breakdown", () => {
  it("demo entries show a finding; adding the water pump closes it", () => {
    const base = computeBreakdown(SAMPLE_BILL, m, [], entriesToExtras(DEMO_ENTRIES, m.days));
    expect(base.status).toBe("finding");
    const pump = entry("water-pump", "Water pump", 1);
    const after = computeBreakdown(SAMPLE_BILL, m, [], entriesToExtras([...DEMO_ENTRIES, pump], m.days));
    expect(after.unaccounted.typ).toBeLessThan(base.unaccounted.typ);
    expect(after.status).toBe("roughly-explained");
  });
  it("supports custom appliances and duplicates", () => {
    const custom = entry("custom", "Aquarium pump", 1, uniformUsage({ morning: 6, afternoon: 6, evening: 4, lateNight: 6, earlyMorning: 2 }),
      { uid: "c1", custom: { watts: { low: 4, typ: 6, high: 8 }, duty: { low: 1, typ: 1, high: 1 } } });
    const units = estimateEntry(custom, m.days);
    expect(units.typ).toBeCloseTo((6 * 24 * 61) / 1000, 4);
    const two = entriesToExtras([custom, { ...custom, uid: "c2" }], m.days);
    expect(two).toHaveLength(2);
  });
  it("lets a typed nameplate wattage upgrade confidence to label-based", () => {
    const tv = entry("tv", "TV", 1, defaultUsageFor("tv"), { efficiency: { nameplateWatts: 120 } });
    expect(entriesToExtras([tv], m.days)[0].confidence).toBe("label");
  });
});

describe("efficiency check", () => {
  it("says fix-first for the old demo fridge", () => {
    const r = efficiencyCheck(DEMO_ENTRIES[0], m.marginalRate)!;
    expect(r.currentAnnualKwh.typ).toBeCloseTo(570, -1);
    expect(r.newness).toBe("much-less-efficient");
    expect(r.paybackYears!.typ).toBeGreaterThan(10);
    expect(r.verdict).toBe("fix-first");
  });
  it("gives an old fan a finite payback", () => {
    const fan = entry("ceiling-fan", "Fan", 1, uniformUsage({ evening: 4, lateNight: 4 }), { efficiency: { nameplateWatts: 75 } });
    const r = efficiencyCheck(fan, m.marginalRate)!;
    expect(r.annualSavingRupees.typ).toBeGreaterThan(0);
    expect(r.paybackYears!.typ).toBeGreaterThan(0);
  });
  it("returns null when there is no modern benchmark", () => {
    expect(efficiencyCheck(entry("iron", "Iron", 1), m.marginalRate)).toBeNull();
  });
});

describe("actions and weekly profile", () => {
  it("builds ranked actions keyed by entry", () => {
    const acts = buildEntryActions(DEMO_ENTRIES, m);
    expect(acts.length).toBeGreaterThan(0);
    expect(acts[0].id.startsWith("demo-")).toBe(true);
    for (let i = 1; i < acts.length; i++) expect(acts[i - 1].rupeesSaved).toBeGreaterThanOrEqual(acts[i].rupeesSaved);
  });
  it("makes weekends heavier than weekdays for TV", () => {
    const p = weeklyProfile([entry("tv", "TV", 1)]);
    expect(p.weekendKwh).toBeGreaterThan(p.weekdayKwh);
    expect(p.week).toHaveLength(7);
  });
});
