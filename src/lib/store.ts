import { create } from "zustand";
import { SAMPLE_BILL } from "@/data/sampleBill";
import { DEMO_FRIDGE, DEMO_SELECTIONS } from "@/data/demoHousehold";
import { validateBill } from "./calc";
import type { ApplianceSelection, Bill, FridgeInput, ValidationIssue } from "./types";

export interface AppStore {
  // Navigation
  step: 1 | 2 | 3 | 4;
  lang: "en" | "ml";
  isDrawerOpen: boolean;

  // Bill
  bill: Bill;
  isCustomBill: boolean;
  validationIssues: ValidationIssue[];
  extractionLoading: boolean;
  extractionError: string | null;

  // Appliances & Fridge
  selections: ApplianceSelection[];
  fridge: FridgeInput;

  // Savings Plan
  targetRupees: number;
  selectedActionIds: string[];
  freeOnlyFilter: boolean;

  // Actions
  setStep: (step: 1 | 2 | 3 | 4) => void;
  setLang: (lang: "en" | "ml") => void;
  setDrawerOpen: (open: boolean) => void;
  loadSampleBill: () => void;
  loadDemoHousehold: () => void;
  setBill: (bill: Bill) => void;
  setBillField: <K extends keyof Bill>(field: K, value: Bill[K]) => void;
  setExtractionLoading: (loading: boolean) => void;
  setExtractionError: (error: string | null) => void;

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
  lang: "en",
  isDrawerOpen: false,

  bill: SAMPLE_BILL,
  isCustomBill: false,
  validationIssues: validateBill(SAMPLE_BILL),
  extractionLoading: false,
  extractionError: null,

  selections: [],
  fridge: DEFAULT_FRIDGE,

  targetRupees: 200,
  selectedActionIds: [],
  freeOnlyFilter: false,

  setStep: (step) => set({ step }),
  setLang: (lang) => set({ lang }),
  setDrawerOpen: (isDrawerOpen) => set({ isDrawerOpen }),

  loadSampleBill: () => {
    set({
      bill: SAMPLE_BILL,
      isCustomBill: false,
      validationIssues: validateBill(SAMPLE_BILL),
      extractionError: null,
      extractionLoading: false,
    });
  },

  loadDemoHousehold: () => {
    set({
      selections: [...DEMO_SELECTIONS],
      fridge: { ...DEMO_FRIDGE },
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
  setExtractionError: (extractionError) => set({ extractionError, extractionLoading: false }),

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

  setTargetRupees: (targetRupees) => set({ targetRupees: Math.max(0, targetRupees) }),

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
      selections: [],
      fridge: DEFAULT_FRIDGE,
      targetRupees: 200,
      selectedActionIds: [],
      freeOnlyFilter: false,
      isDrawerOpen: false,
    });
  },
}));
