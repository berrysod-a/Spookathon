"use client";

import React from "react";
import { UPGRADES } from "@/data/upgrades";
import { upgradePayback, formatINR } from "@/lib/calc";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, CheckCircle2, Sparkles } from "lucide-react";

interface UpgradesListProps {
  marginalRate: number;
}

export function UpgradesList({ marginalRate }: UpgradesListProps) {
  // Default assumptions for demo: 1 unit of each upgrade, typical daily hours
  const calculatedUpgrades = UPGRADES.map((u) => {
    const hours = u.applianceId === "ceiling-fan" ? 8 : 4;
    const qty = 1;
    const payback = upgradePayback(u, qty, hours, marginalRate);
    return { ...u, payback, hours, qty };
  }).sort((a, b) => (a.payback.paybackYears ?? 999) - (b.payback.paybackYears ?? 999));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <span>Ranked appliance upgrades</span>
            <Badge variant="lime" className="text-[10px]">
              Fast Payback
            </Badge>
          </h4>
          <p className="text-xs text-zinc-400">
            Like-for-like swaps ordered by fastest payback at ₹{marginalRate.toFixed(2)}/unit.
          </p>
        </div>
        <Badge variant="outline" className="text-[10px] text-zinc-500 border-zinc-800">
          Illustrative values
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {calculatedUpgrades.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">
                  {item.label}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono bg-zinc-800 px-1.5 py-0.5 rounded">
                  {item.oldWatts}W → {item.newWatts}W
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">
                Estimated purchase: {formatINR(item.pricePerUnitItem)}
              </p>
            </div>

            <div className="pt-2 border-t border-zinc-800/60">
              <div className="flex items-baseline justify-between">
                <span className="text-[11px] text-zinc-400">Annual saving</span>
                <span className="text-xs font-mono font-bold text-lime-400">
                  ~{formatINR(item.payback.rupeesYear)} / year
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-[11px] text-zinc-400">Est. payback</span>
                <span className="text-xs font-mono font-bold text-white">
                  {item.payback.paybackYears ? `${item.payback.paybackYears.toFixed(1)} yrs` : "N/A"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

