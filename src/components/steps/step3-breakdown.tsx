"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import {
  APPLIANCES,
  APPLIANCE_BY_ID,
  FORGOTTEN_PROMPTS,
} from "@/data/appliances";
import {
  computeBreakdown,
  billMetrics,
  fridgeExtraItem,
  formatINR,
} from "@/lib/calc";
import { BreakdownRanges } from "@/components/charts/breakdown-ranges";
import { FridgeDrawer } from "@/components/drawer/fridge-drawer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Fan,
  Lightbulb,
  Lamp,
  Tv,
  Router,
  WashingMachine,
  AirVent,
  Flame,
  Droplets,
  CookingPot,
  Shirt,
  Laptop,
  BatteryCharging,
  BatteryFull,
  Refrigerator,
  Zap,
  Plus,
  Minus,
  Check,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// Icon mapping helper
const ICON_MAP: Record<string, React.ElementType> = {
  Fan,
  Lightbulb,
  Lamp,
  Tv,
  Router,
  WashingMachine,
  AirVent,
  Flame,
  Droplets,
  CookingPot,
  Shirt,
  Laptop,
  BatteryCharging,
  BatteryFull,
  Refrigerator,
};

export function Step3Breakdown() {
  const {
    bill,
    selections,
    fridge,
    setApplianceSelection,
    removeAppliance,
    setStep,
    setDrawerOpen,
  } = useAppStore();

  const m = billMetrics(bill);
  const fridgeItem = fridgeExtraItem(fridge, m.days);
  const breakdown = computeBreakdown(bill, m, selections, [fridgeItem]);

  const [expandedPicker, setExpandedPicker] = useState(false);

  // Helper to check if an appliance is currently selected
  const getSelection = (id: string) => selections.find((s) => s.id === id);

  const toggleOrAdd = (id: string) => {
    const existing = getSelection(id);
    const def = APPLIANCE_BY_ID[id];
    if (!def) return;
    if (existing) {
      removeAppliance(id);
    } else {
      setApplianceSelection(id, 1, def.defaultHours);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 py-6 px-4">
      {/* Header and Quick Preset actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Where the units likely went
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Pick your appliances to match against your {bill.units} billed units. Every estimate is shown as a range.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* "Try a sample household" removed (C7). Fridge drawer removed (C7). */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setDrawerOpen(true)}
            className="border-zinc-700 text-zinc-300 hover:text-white"
          >
            <Refrigerator className="w-4 h-4 mr-1.5 text-blue-400" />
            Fridge calculator
          </Button>
        </div>
      </div>

      {/* Main Breakdown Section: Ranges Graphic & Gap */}
      <Card className="border-zinc-800 bg-[#18181b]">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">
              Estimated usage breakdown
            </h3>
            <span className="text-xs font-mono text-zinc-400">
              Total bill: {bill.units} units ({formatINR(bill.total)})
            </span>
          </div>

          <BreakdownRanges breakdown={breakdown} billUnits={bill.units} />
        </CardContent>
      </Card>

      {/* Forgotten Appliances Strip (Water pump, second fridge, geyser, inverter) */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <span>Did you forget any of these?</span>
            <Badge variant="amber" className="text-[10px]">
              High Impact
            </Badge>
          </h4>
          <span className="text-xs text-zinc-500">
            Click to add and watch the gap shrink
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {FORGOTTEN_PROMPTS.map((item) => {
            const isSelected = Boolean(getSelection(item.id));
            const def = APPLIANCE_BY_ID[item.id];
            const Icon = (def && ICON_MAP[def.icon]) || Zap;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleOrAdd(item.id)}
                className={`p-3.5 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between space-y-2 select-none ${
                  isSelected
                    ? "border-lime-400/80 bg-lime-950/20 text-lime-300 shadow-[0_0_15px_rgba(163,230,53,0.15)]"
                    : "border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800/80"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-lime-400" />
                    <span className="text-xs font-semibold">{def?.name}</span>
                  </div>
                  <span
                    className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] ${
                      isSelected
                        ? "bg-lime-400 text-zinc-950 font-bold"
                        : "border border-zinc-700 text-zinc-500"
                    }`}
                  >
                    {isSelected ? <Check className="w-3 h-3 stroke-[3]" /> : <Plus className="w-3 h-3" />}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-tight">
                  {item.text}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Appliance Picker: Quantities and Daily Hours */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">
              Your household appliances
            </h3>
            <p className="text-xs text-zinc-400">
              Adjust quantity and daily operating hours for each item.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setExpandedPicker(!expandedPicker)}
            className="text-xs text-zinc-400 hover:text-white"
          >
            {expandedPicker ? (
              <>
                Show less <ChevronUp className="w-3.5 h-3.5 ml-1" />
              </>
            ) : (
              <>
                Show all {APPLIANCES.length} appliances <ChevronDown className="w-3.5 h-3.5 ml-1" />
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(expandedPicker ? APPLIANCES : APPLIANCES.slice(0, 8)).map((app) => {
            const sel = getSelection(app.id);
            const isSelected = Boolean(sel && sel.qty > 0);
            const qty = sel?.qty || 0;
            const hours = sel?.hoursPerDay ?? app.defaultHours;
            const Icon = ICON_MAP[app.icon] || Zap;

            return (
              <div
                key={app.id}
                className={`rounded-2xl border p-4 transition-all duration-200 ${
                  isSelected
                    ? "border-lime-500/40 bg-zinc-900/90"
                    : "border-zinc-800/80 bg-zinc-900/30 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2 rounded-xl border ${
                        isSelected
                          ? "border-lime-500/30 bg-lime-500/10 text-lime-400"
                          : "border-zinc-800 bg-zinc-900 text-zinc-500"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        {app.name}
                      </h4>
                      <p className="text-[11px] text-zinc-500 font-mono">
                        {app.watts.typ}W typical {app.alwaysOn ? "• 24h continuous" : ""}
                      </p>
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (qty > 1) {
                          setApplianceSelection(app.id, qty - 1, hours);
                        } else if (qty === 1) {
                          removeAppliance(app.id);
                        }
                      }}
                      disabled={qty === 0}
                      className="h-7 w-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-xs font-mono font-bold text-white">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setApplianceSelection(app.id, qty + 1, hours)}
                      className="h-7 w-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Operating hours slider (only if selected and not strictly 24h alwaysOn) */}
                {isSelected && !app.alwaysOn && (
                  <div className="pt-2 border-t border-zinc-800/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Daily usage</span>
                      <span className="font-mono font-semibold text-lime-400">
                        {hours} {hours === 1 ? "hour" : "hours"} / day
                      </span>
                    </div>
                    <Slider
                      value={[hours]}
                      min={0.25}
                      max={24}
                      step={0.25}
                      onValueChange={([val]) => setApplianceSelection(app.id, qty, val)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-zinc-800">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep(2)}
          className="border-zinc-800 text-zinc-300"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to decoded bill
        </Button>

        <Button
          type="button"
          size="lg"
          variant="default"
          className="bg-lime-400 text-zinc-950 font-semibold hover:bg-lime-300"
          onClick={() => setStep(4)}
        >
          <span>Create my savings plan</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Refrigerator & Upgrades Drawer Modal */}
      <FridgeDrawer />
    </div>
  );
}
