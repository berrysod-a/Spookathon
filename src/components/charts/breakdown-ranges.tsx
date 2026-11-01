"use client";

import React from "react";
import type { Breakdown, BreakdownItem } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { formatINR, formatRangeINR, formatRangeUnits } from "@/lib/calc";
import { AlertTriangle, CheckCircle, HelpCircle } from "lucide-react";

interface BreakdownRangesProps {
  breakdown: Breakdown;
  billUnits: number;
}

export function BreakdownRanges({ breakdown, billUnits }: BreakdownRangesProps) {
  const maxUnits = Math.max(billUnits, breakdown.listed.high, 1);

  return (
    <div className="w-full space-y-5">
      {/* Items list with range whiskers */}
      <div className="space-y-3">
        {breakdown.items.map((item) => {
          const lowPct = Math.min(100, (item.units.low / maxUnits) * 100);
          const typPct = Math.min(100, (item.units.typ / maxUnits) * 100);
          const highPct = Math.min(100, (item.units.high / maxUnits) * 100);
          const sharePct = Math.round(item.shareOfBill * 100);

          return (
            <div
              key={item.id}
              className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 transition-colors hover:bg-zinc-900/70"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-white">
                    {item.name}
                  </span>
                  {item.qty > 1 && (
                    <span className="text-xs font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                      ×{item.qty}
                    </span>
                  )}
                  <Badge variant="outline" className="text-[10px] text-zinc-400 border-zinc-700">
                    Estimate
                  </Badge>
                  <span className="text-[10px] text-zinc-500 font-mono capitalize">
                    {item.confidence === "rough" ? "Rough estimate" : item.confidence === "label" ? "Label-based" : "Measured"}
                  </span>
                </div>

                <div className="text-right flex sm:flex-col items-baseline sm:items-end justify-between gap-1">
                  <div className="text-sm font-mono font-bold text-zinc-200">
                    {Math.round(item.units.typ)} units{" "}
                    <span className="text-xs font-normal text-zinc-400">
                      (~{formatINR(item.cost.typ)})
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-zinc-500">
                    Range: {Math.round(item.units.low)}–{Math.round(item.units.high)} units ({sharePct}%)
                  </div>
                </div>
              </div>

              {/* Range bar graphic */}
              <div className="relative h-3 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800/50">
                {/* Full potential range (low to high spread) */}
                <div
                  className="absolute top-0 bottom-0 bg-blue-500/20 rounded-full transition-all duration-300"
                  style={{
                    left: `${lowPct}%`,
                    width: `${Math.max(1, highPct - lowPct)}%`,
                  }}
                />
                {/* Typical point bar */}
                <div
                  className="absolute top-0 bottom-0 bg-blue-500 rounded-full transition-all duration-300"
                  style={{
                    width: `${typPct}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* "Not covered by your list" segment */}
      <div
        className={`rounded-2xl border p-5 transition-all duration-300 ${
          breakdown.status === "finding"
            ? "border-amber-500/40 bg-amber-950/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]"
            : breakdown.status === "over-listed"
            ? "border-red-500/40 bg-red-950/20"
            : "border-zinc-800 bg-zinc-900/40"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-bold ${
                breakdown.status === "finding"
                  ? "text-amber-400"
                  : breakdown.status === "over-listed"
                  ? "text-red-400"
                  : "text-zinc-300"
              }`}
            >
              Not covered by your list
            </span>
            <Badge
              variant={
                breakdown.status === "finding"
                  ? "amber"
                  : breakdown.status === "over-listed"
                  ? "destructive"
                  : "outline"
              }
              className="text-[10px]"
            >
              {breakdown.status === "finding"
                ? "Likely gap"
                : breakdown.status === "over-listed"
                ? "Over-estimated"
                : "Roughly explained"}
            </Badge>
          </div>

          <div className="text-right">
            <span className="text-sm font-mono font-bold text-white">
              Typical: {Math.round(breakdown.unaccounted.typ)} units
            </span>
            <span className="text-xs font-mono text-zinc-400 block">
              Up to {Math.round(breakdown.unaccounted.high)} units (~{formatRangeINR(breakdown.unaccountedCost)})
            </span>
          </div>
        </div>

        {/* Dynamic status copy based on breakdown.status */}
        {breakdown.status === "finding" && (
          <div className="text-xs text-amber-200/90 leading-relaxed flex items-start gap-2 pt-2 border-t border-amber-500/20">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-300">
                Noticeable gap found between your list and the bill.
              </p>
              <p className="text-amber-200/80 mt-0.5">
                Even at the lowest estimate, about {Math.round(breakdown.unaccounted.low)} units remain unaccounted for. Check the forgotten items below (like water pump or inverter).
              </p>
            </div>
          </div>
        )}

        {breakdown.status === "roughly-explained" && (
          <div className="text-xs text-zinc-400 leading-relaxed flex items-start gap-2 pt-2 border-t border-zinc-800">
            <CheckCircle className="w-4 h-4 text-lime-400 shrink-0 mt-0.5" />
            <p>
              Your appliance list roughly explains your billed consumption of {billUnits} units.
            </p>
          </div>
        )}

        {breakdown.status === "over-listed" && (
          <div className="text-xs text-red-300 leading-relaxed flex items-start gap-2 pt-2 border-t border-red-500/20">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-200">
                Your estimated usage exceeds your bill by about {Math.round(breakdown.overBy)} units.
              </p>
              <p className="text-red-300/80 mt-0.5">
                Consider checking the appliances with the widest usage ranges (usually AC runtime or water heater hours).
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

