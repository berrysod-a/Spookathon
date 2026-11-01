import { create } from "zustand";
import { SAMPLE_BILL } from "@/data/sampleBill";
import { DEMO_ENTRIES } from "@/data/demoEntries";
import { validateBill } from "./calc";
import type { ApplianceEntry } from "./schedule";
import type { ApplianceSelection, Bill, FridgeInput, ValidationIssue } from "./types";

// ── lang persistence helpers (safe in SSR) ───────────────────────────────────
const LANG_KEY = "wattPlanLang";
function readLang(): "en" | "ml" {
  if (typeof window === "undefined") return "en";
  try {
    const v = localStorage.getItem(LANG_KEY);
    return v === "ml" ? "ml" : "en";
  } catch {
    return "en";
  }
}
function writeLang(lang: "en" | "ml") {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.lang = lang === "ml" ? "ml" : "en";
  } catch { /* ignore */ }
}

export interface AppStore {
  // Navigation
  step: 1 | 2 | 3 | 4;
  lang: "en" | "ml";

  // Bill
  bill: Bill;
  isCustomBill: boolean;
  validationIssues: ValidationIssue[];
  extractionLoading: boolean;
  extractionError: string | null;

  // v2: ApplianceEntry rows (replaces selections + fridge in Phase 2)
  entries: ApplianceEntry[];

  // v1 (kept while Step 3 migrates in Phase 2 — C8)
  selections: ApplianceSelection[];
  fridge: FridgeInput;

  // Savings Plan
  targetRupees: number;
  selectedActionIds: string[];
  freeOnlyFilter: boolean;

  // Actions
  setStep: (step: 1 | 2 | 3 | 4) => void;
  setLang: (lang: "en" | "ml") => void;
  loadSampleBill: () => void;
  /** Hidden-demo only: loads SAMPLE_BILL + DEMO_ENTRIES. Not exposed in any UI. */
  loadDemo: () => void;
  setBill: (bill: Bill) => void;
  setBillField: <K extends keyof Bill>(field: K, value: Bill[K]) => void;
  setExtractionLoading: (loading: boolean) => void;
  setExtractionError: (error: string | null) => void;

  // v2 entry management (used by C3 demo loader; fully wired in C8)
  setEntries: (entries: ApplianceEntry[]) => void;
  addEntry: (entry: ApplianceEntry) => void;
  removeEntry: (uid: string) => void;
  updateEntry: (uid: string, patch: Partial<ApplianceEntry>) => void;

  // v1 appliance helpers (kept for Step 3 until Phase 2)
  setApplianceSelection: (id: string, qty: number, hoursPerDay: number) => void;
  removeAppliance: (id: string) => void;
  updateFridge: (updates: Partial<FridgeInput>) => void;

  setTargetRupees: (target: number) => void;
  toggleAction: (actionId: string) => void;
  setFreeOnlyFilter: (freeOnly: boolean) => void;
  resetAll: () => void;
}

const DEFAULT_FRIDGE: FridgeInput = {
  litres: 200,
  type: "direct-cool",
  ageYears: 6,
  stars: 3,
};

export const useAppStore = create<AppStore>((set, get) => ({
  step: 1,
  lang: readLang(),

  bill: SAMPLE_BILL,
  isCustomBill: false,
  validationIssues: validateBill(SAMPLE_BILL),
  extractionLoading: false,
  extractionError: null,

  entries: [],
  selections: [],
  fridge: DEFAULT_FRIDGE,

  targetRupees: 200,
  selectedActionIds: [],
  freeOnlyFilter: false,

  setStep: (step) => set({ step }),

  setLang: (lang) => {
    writeLang(lang);
    set({ lang });
  },

  loadSampleBill: () => {
    set({
      bill: SAMPLE_BILL,
      isCustomBill: false,
      validationIssues: validateBill(SAMPLE_BILL),
      extractionError: null,
      extractionLoading: false,
    });
  },

  /** C3: hidden demo. Sets bill + entries. Not accessible via any UI. */
  loadDemo: () => {
    set({
      bill: SAMPLE_BILL,
      isCustomBill: true,
      validationIssues: validateBill(SAMPLE_BILL),
      extractionError: null,
      extractionLoading: false,
      entries: [...DEMO_ENTRIES],
      step: 1,
    });
  },

  setBill: (bill) => {
    set({
      bill,
      isCustomBill: true,
      validationIssues: validateBill(bill),
      extractionLoading: false,
      extractionError: null,
    });
  },

  setBillField: (field, value) => {
    const updated = { ...get().bill, [field]: value };
    set({
      bill: updated,
      isCustomBill: true,
      validationIssues: validateBill(updated),
    });
  },

  setExtractionLoading: (extractionLoading) => set({ extractionLoading }),
  setExtractionError: (extractionError) =>
    set({ extractionError, extractionLoading: false }),

  // ── v2 entry management ──────────────────────────────────────────────────
  setEntries: (entries) => set({ entries }),

  addEntry: (entry) => set({ entries: [...get().entries, entry] }),

  removeEntry: (uid) =>
    set({ entries: get().entries.filter((e) => e.uid !== uid) }),

  updateEntry: (uid, patch) =>
    set({
      entries: get().entries.map((e) =>
        e.uid === uid ? { ...e, ...patch } : e,
      ),
    }),

  // ── v1 helpers (Step 3 uses these until C8) ──────────────────────────────
  setApplianceSelection: (id, qty, hoursPerDay) => {
    const current = get().selections;
    const existingIndex = current.findIndex((s) => s.id === id);
    if (qty <= 0) {
      set({ selections: current.filter((s) => s.id !== id) });
      return;
    }
    if (existingIndex >= 0) {
      const next = [...current];
      next[existingIndex] = { id, qty, hoursPerDay };
      set({ selections: next });
    } else {
      set({ selections: [...current, { id, qty, hoursPerDay }] });
    }
  },

  removeAppliance: (id) => {
    set({ selections: get().selections.filter((s) => s.id !== id) });
  },

  updateFridge: (updates) => {
    set({ fridge: { ...get().fridge, ...updates } });
  },

  setTargetRupees: (targetRupees) =>
    set({ targetRupees: Math.max(0, targetRupees) }),

  toggleAction: (actionId) => {
    const current = get().selectedActionIds;
    if (current.includes(actionId)) {
      set({ selectedActionIds: current.filter((id) => id !== actionId) });
    } else {
      set({ selectedActionIds: [...current, actionId] });
    }
  },

  setFreeOnlyFilter: (freeOnlyFilter) => set({ freeOnlyFilter }),

  resetAll: () => {
    set({
      step: 1,
      bill: SAMPLE_BILL,
      isCustomBill: false,
      validationIssues: validateBill(SAMPLE_BILL),
      entries: [],
      selections: [],
      fridge: DEFAULT_FRIDGE,
      targetRupees: 200,
      selectedActionIds: [],
      freeOnlyFilter: false,
    });
  },
}));
