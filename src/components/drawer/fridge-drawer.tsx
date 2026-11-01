"use client";

import React from "react";
import { useAppStore } from "@/lib/store";
import {
  fridgeReplaceOrKeep,
  billMetrics,
  formatINR,
  formatRangeINR,
  formatRangeUnits,
} from "@/lib/calc";
import { FRIDGE_FIX_FIRST_STEPS } from "@/data/fridgeTable";
import { UpgradesList } from "./upgrades-list";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  AlertCircle,
  X,
  Wrench,
  Sparkles,
  Info,
} from "lucide-react";

export function FridgeDrawer() {
  const { isDrawerOpen, setDrawerOpen, fridge, updateFridge, bill } = useAppStore();
  const m = billMetrics(bill);
  const result = fridgeReplaceOrKeep(fridge, m.marginalRate);

  const verdictStyles = {
    "fix-first": {
      title: "Fix first before replacing",
      desc: "Replacing a functioning fridge rarely pays back on electricity alone. Maintenance gives quick gains.",
      variant: "amber" as const,
    },
    "worth-it": {
      title: "Replacement pays back quickly",
      desc: "A modern 5-star unit saves substantial energy and will pay back within 5 years.",
      variant: "lime" as const,
    },
    borderline: {
      title: "Borderline investment",
      desc: "Payback is between 5 and 10 years. Only replace if your current unit needs costly repairs.",
      variant: "blue" as const,
    },
    "no-saving": {
      title: "No measurable energy saving",
      desc: "Your current fridge appears equally efficient or more efficient than a generic replacement.",
      variant: "outline" as const,
    },
  }[result.verdict];

  return (
    <Drawer open={isDrawerOpen} onOpenChange={setDrawerOpen}>
      <DrawerContent className="max-w-4xl mx-auto px-6 pb-12 pt-4">
        <DrawerHeader className="px-0 flex items-start justify-between border-b border-zinc-800 pb-4">
          <div>
            <DrawerTitle className="text-2xl font-bold text-white flex items-center gap-2.5">
              <span>Refrigerator replace or keep</span>
              <Badge variant="outline" className="text-[10px] text-zinc-400">
                Calculator
              </Badge>
            </DrawerTitle>
            <DrawerDescription className="text-zinc-400 mt-1">
              Honest electricity payback calculations based on BEE label baselines and age factors.
            </DrawerDescription>
          </div>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
              <X className="w-5 h-5" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="space-y-8 mt-6">
          {/* Step 1: The Fix-First Ladder (Always shown first) */}
          <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-bold text-amber-300">
                The fix-first ladder (Try these zero-cost steps before buying new)
              </h4>
            </div>
            <ol className="space-y-2 text-xs text-amber-100/90 pl-1">
              {FRIDGE_FIX_FIRST_STEPS.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-400/20 text-[10px] font-bold text-amber-300">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Fridge details inputs */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white">
              Your refrigerator details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="fridge-type">Type</Label>
                <select
                  id="fridge-type"
                  value={fridge.type}
                  onChange={(e) =>
                    updateFridge({ type: e.target.value as "direct-cool" | "frost-free" })
                  }
                  className="flex h-11 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400"
                >
                  <option value="direct-cool">Direct Cool (Single door)</option>
                  <option value="frost-free">Frost Free (Double door)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fridge-litres">Capacity (Litres)</Label>
                <Input
                  id="fridge-litres"
                  type="number"
                  value={fridge.litres}
                  onChange={(e) => updateFridge({ litres: Number(e.target.value) || 200 })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fridge-age">Age (Years)</Label>
                <Input
                  id="fridge-age"
                  type="number"
                  value={fridge.ageYears}
                  onChange={(e) => updateFridge({ ageYears: Number(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fridge-stars">BEE Star rating (0 = old / unrated)</Label>
                <select
                  id="fridge-stars"
                  value={fridge.stars}
                  onChange={(e) =>
                    updateFridge({
                      stars: Number(e.target.value) as 0 | 1 | 2 | 3 | 4 | 5,
                    })
                  }
                  className="flex h-11 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400"
                >
                  <option value={0}>0 Stars / Pre-label (&gt;10 yrs)</option>
                  <option value={1}>1 Star</option>
                  <option value={2}>2 Stars</option>
                  <option value={3}>3 Stars</option>
                  <option value={4}>4 Stars</option>
                  <option value={5}>5 Stars</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fridge-kwh">BEE label annual kWh (optional)</Label>
                <Input
                  id="fridge-kwh"
                  type="number"
                  placeholder="e.g. 260"
                  value={fridge.labelKwhPerYear || ""}
                  onChange={(e) =>
                    updateFridge({
                      labelKwhPerYear: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fridge-price">New fridge replacement price (₹)</Label>
                <Input
                  id="fridge-price"
                  type="number"
                  placeholder="e.g. 25000"
                  value={fridge.newFridgePrice || ""}
                  onChange={(e) =>
                    updateFridge({
                      newFridgePrice: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Calculations & Verdict */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Verdict: {verdictStyles.title}</span>
                  <Badge variant={verdictStyles.variant} className="text-[10px]">
                    {result.verdict.toUpperCase()}
                  </Badge>
                </h4>
                <p className="text-xs text-zinc-400 mt-1">{verdictStyles.desc}</p>
              </div>

              <div className="text-right">
                <span className="text-xs text-zinc-400 block">Est. annual saving</span>
                <span className="text-lg font-mono font-bold text-lime-400">
                  {formatRangeINR(result.annualSavingRupees)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-zinc-800">
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800/80">
                <span className="text-[11px] text-zinc-400 block">Current annual draw</span>
                <span className="text-sm font-mono font-semibold text-zinc-200">
                  {formatRangeUnits(result.oldAnnualKwh)} / yr
                </span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800/80">
                <span className="text-[11px] text-zinc-400 block">New 5-star annual draw</span>
                <span className="text-sm font-mono font-semibold text-zinc-200">
                  {formatRangeUnits(result.newAnnualKwh)} / yr
                </span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800/80">
                <span className="text-[11px] text-zinc-400 block">Payback period</span>
                <span className="text-sm font-mono font-bold text-white">
                  {result.paybackYears
                    ? `${result.paybackYears.typ.toFixed(1)} years`
                    : "Enter purchase price"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-zinc-500">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>
                Based on marginal rate of ₹{m.marginalRate.toFixed(2)}/unit. Star and wear age multipliers are labelled assumptions.
              </span>
            </div>
          </div>

          {/* Ranked Upgrades List */}
          <div className="pt-4 border-t border-zinc-800">
            <UpgradesList marginalRate={m.marginalRate} />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
