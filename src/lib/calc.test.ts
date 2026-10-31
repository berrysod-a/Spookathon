import { describe, expect, it } from "vitest";
import { SAMPLE_BILL } from "@/data/sampleBill";
import { DEMO_FRIDGE, DEMO_SELECTIONS } from "@/data/demoHousehold";
import { APPLIANCE_BY_ID } from "@/data/appliances";
import {
  alwaysOnYearly, billMetrics, buildActions, computeBreakdown, fridgeExtraItem,
  fridgeReplaceOrKeep, planProgress, validateBill,
} from "./calc";

const m = billMetrics(SAMPLE_BILL);

describe("bill metrics (sample bill)", () => {
  it("computes days, per-day usage and average draw", () => {
    expect(m.days).toBe(61);
    expect(m.unitsPerDay).toBeCloseTo(4.607, 2);
    expect(m.avgWatts).toBeCloseTo(191.9, 0);
  });
  it("separates the three rates", () => {
    expect(m.variableTotal).toBeCloseTo(1294.85, 2);
    expect(m.marginalRate).toBeCloseTo(4.608, 3);
    expect(m.allInRate).toBeCloseTo(5.242, 3);
    expect(m.marginalRate).toBeLessThan(m.allInRate);
    expect(m.fixedShare).toBeCloseTo(0.121, 3);
  });
  it("prices a 50 W always-on device at about 2,018 rupees a year", () => {
    const def = { ...APPLIANCE_BY_ID["wifi-router"], watts: { low: 50, typ: 50, high: 50 }, duty: { low: 1, typ: 1, high: 1 } };
    const r = alwaysOnYearly(def, 1, m.marginalRate);
    expect(r.kwh).toBeCloseTo(438, 0);
    expect(r.rupees).toBeCloseTo(2018, 0);
  });
});

describe("validation", () => {
  it("passes the sample bill", () => expect(validateBill(SAMPLE_BILL)).toEqual([]));
  it("flags misread units and a wrong total", () => {
    const issues = validateBill({ ...SAMPLE_BILL, units: 287, total: 1500 });
    expect(issues.map((i) => i.field).sort()).toEqual(["charges", "units"]);
  });
});

describe("breakdown and gap", () => {
  const fridge = fridgeExtraItem(DEMO_FRIDGE, m.days);
  it("flags a finding for the demo household", () => {
    const b = computeBreakdown(SAMPLE_BILL, m, DEMO_SELECTIONS, [fridge]);
    expect(b.status).toBe("finding");
    expect(b.unaccounted.low).toBeGreaterThan(0);
    expect(b.unaccounted.low).toBeLessThanOrEqual(b.unaccounted.typ);
    expect(b.unaccounted.typ).toBeLessThanOrEqual(b.unaccounted.high);
  });
  it("shrinks and stops being a finding once the water pump is added", () => {
    const before = computeBreakdown(SAMPLE_BILL, m, DEMO_SELECTIONS, [fridge]);
    const after = computeBreakdown(SAMPLE_BILL, m, [...DEMO_SELECTIONS, { id: "water-pump", qty: 1, hoursPerDay: 0.75 }], [fridge]);
    expect(after.unaccounted.typ).toBeLessThan(before.unaccounted.typ);
    expect(after.status).toBe("roughly-explained");
  });
  it("reports over-listing when the list is far above the bill", () => {
    const b = computeBreakdown(SAMPLE_BILL, m, [{ id: "ac-split", qty: 3, hoursPerDay: 12 }], []);
    expect(b.status).toBe("over-listed");
    expect(b.overBy).toBeGreaterThan(0);
  });
});

describe("plan and fridge", () => {
  it("fills progress from ticked actions at the marginal rate", () => {
    const acts = buildActions(DEMO_SELECTIONS, m);
    expect(acts[0].rupeesSaved).toBeGreaterThanOrEqual(acts[acts.length - 1].rupeesSaved);
    const p = planProgress(acts, acts.slice(0, 2).map((a) => a.id), 200, m.marginalRate);
    expect(p.targetUnits).toBeCloseTo(43.4, 1);
    expect(p.savedRupees).toBeCloseTo(acts[0].rupeesSaved + acts[1].rupeesSaved, 6);
    expect(p.pct).toBeGreaterThan(0);
    expect(p.pct).toBeLessThanOrEqual(1);
  });
  it("says fix-first for an old fridge with a long payback", () => {
    const r = fridgeReplaceOrKeep(DEMO_FRIDGE, m.marginalRate);
    expect(r.paybackYears?.typ).toBeGreaterThan(10);
    expect(r.verdict).toBe("fix-first");
  });
});
