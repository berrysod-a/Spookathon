// Core types for the Electricity Bill Analyser & Planner.
// All money is in INR (rupees). All energy is in kWh ("units").

export type Confidence = "rough" | "label" | "measured";

/** A low / typical / high triple. Every appliance estimate is a Range, never a single number. */
export interface Range {
  low: number;
  typ: number;
  high: number;
}

export interface Bill {
  prevReadingDate: string; // ISO yyyy-mm-dd
  presentReadingDate: string; // ISO yyyy-mm-dd
  prevReading: number;
  presentReading: number;
  units: number; // units consumed as printed on the bill
  fixedCharge: number;
  energyCharge: number;
  fuelSurcharge: number;
  autoRecoverySurcharge: number;
  electricityDuty: number;
  otherCharges: number;
  roundOff: number; // can be negative
  total: number; // net amount for the period
  connectedLoadW?: number;
}

export interface BillMetrics {
  days: number;
  unitsPerDay: number;
  avgWatts: number;
  variableTotal: number; // energy + surcharges + duty: the part that moves with usage
  allInRate: number; // total / units (includes fixed charge, so NOT a savings rate)
  marginalRate: number; // variableTotal / units: use this for every savings figure
  fixedShare: number; // fixedCharge / total, 0..1
}

export type ValidationSeverity = "error" | "warning";

export interface ValidationIssue {
  field: keyof Bill | "charges";
  severity: ValidationSeverity;
  message: string;
}

export type ActionTemplate =
  | { id: string; label: string; kind: "hours"; hoursSaved: number; free: boolean }
  | { id: string; label: string; kind: "percent"; pct: number; free: boolean };

export interface ApplianceDef {
  id: string;
  name: string;
  icon: string; // lucide-react icon name
  watts: Range;
  duty: Range; // share of "on" time the device actually draws full power, 0..1
  defaultHours: number; // hours per day when selected
  hoursUncertainty: number; // +/- fraction applied to the user's hours, 0..1
  alwaysOn?: boolean;
  forgottenPrompt?: string; // shown in the "Did you forget...?" list
  actions?: ActionTemplate[];
}

export interface ApplianceSelection {
  id: string;
  qty: number;
  hoursPerDay: number;
}

export interface BreakdownItem {
  id: string;
  name: string;
  qty: number;
  units: Range; // units over the billing period
  cost: Range; // rupees at the marginal rate
  shareOfBill: number; // typical units / bill units, 0..1
  confidence: Confidence;
}

/** Anything not in the appliance table (the fridge, a measured load) enters the breakdown this way. */
export interface ExtraItem {
  id: string;
  name: string;
  qty: number;
  units: Range;
  confidence: Confidence;
}

export type GapStatus = "finding" | "roughly-explained" | "over-listed";

export interface Breakdown {
  items: BreakdownItem[];
  listed: Range;
  unaccounted: Range;
  unaccountedCost: Range;
  status: GapStatus;
  overBy: number; // units by which the LOW end of the list exceeds the bill (0 if not over)
}

export interface PlanAction {
  id: string;
  applianceId: string;
  label: string;
  unitsSaved: number; // per billing period
  rupeesSaved: number; // at the marginal rate
  free: boolean;
}

export interface PlanProgress {
  targetRupees: number;
  targetUnits: number;
  savedRupees: number;
  savedUnits: number;
  pct: number; // 0..1, capped at 1
  remainingRupees: number;
  met: boolean;
}

export type FridgeType = "direct-cool" | "frost-free";

export interface FridgeInput {
  litres: number;
  type: FridgeType;
  ageYears: number;
  stars: 0 | 1 | 2 | 3 | 4 | 5; // 0 = unrated / pre-label
  labelKwhPerYear?: number; // if the user types the BEE label figure
  newFridgePrice?: number; // rupees, user supplied
}

export interface FridgeResult {
  oldAnnualKwh: Range;
  newAnnualKwh: Range;
  annualSavingRupees: Range;
  paybackYears: Range | null; // null if no price entered or no saving
  verdict: "worth-it" | "borderline" | "fix-first" | "no-saving";
  confidence: Confidence;
}
