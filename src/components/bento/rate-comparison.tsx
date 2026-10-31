"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip";
import { HelpCircle, Zap, TrendingDown, Info } from "lucide-react";
import { formatINR } from "@/lib/calc";
import { CountUp } from "@/components/ui/count-up";

interface RateComparisonProps {
  energyRate: number; // energyCharge / units (~4.02)
  allInRate: number;   // total / units (~5.24)
  marginalRate: number; // variableTotal / units (~4.61)
}

export function RateComparison({
  energyRate,
  allInRate,
  marginalRate,
}: RateComparisonProps) {
  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <span>The three rates decoded</span>
            <Badge variant="lime" className="text-[10px] uppercase tracking-wider">
              Key Insight
            </Badge>
          </h3>
          <p className="text-xs text-zinc-400">
            Why you can't just divide total bill by units to calculate savings.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Rate 1: Tariff Energy Rate */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 flex flex-col justify-between space-y-3">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-zinc-400">Energy rate alone</span>
            <span className="text-[10px] text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
              Tariff slab only
            </span>
          </div>

          <div>
            <div className="text-2xl font-mono font-bold text-zinc-300">
              <CountUp to={energyRate} decimals={2} prefix="₹" suffix=" / unit" />
            </div>
            <p className="mt-1 text-xs text-zinc-500 leading-relaxed">
              Base tariff rate. Ignores fuel surcharge, auto recovery, and government electricity duty.
            </p>
          </div>
        </div>

        {/* Rate 2: All-in Rate */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 flex flex-col justify-between space-y-3">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-zinc-400">All-in rate</span>
            <span className="text-[10px] text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
              Total ÷ Units
            </span>
          </div>

          <div>
            <div className="text-2xl font-mono font-bold text-amber-300">
              <CountUp to={allInRate} decimals={2} prefix="₹" suffix=" / unit" />
            </div>
            <p className="mt-1 text-xs text-zinc-500 leading-relaxed">
              Includes fixed charges. Overstates savings because your fixed charge remains even at zero usage.
            </p>
          </div>
        </div>

        {/* Rate 3: True Marginal Rate (Highlighted) */}
        <div className="rounded-2xl border-2 border-lime-400/80 bg-lime-950/20 p-4 flex flex-col justify-between space-y-3 shadow-[0_0_25px_rgba(163,230,53,0.12)]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-lime-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 fill-lime-400 text-lime-400" />
              True cost of 1 extra unit
            </span>
            <span className="text-[10px] font-bold text-zinc-950 bg-lime-400 px-2 py-0.5 rounded-full font-mono">
              SAVINGS RATE
            </span>
          </div>

          <div>
            <div className="text-3xl font-mono font-extrabold text-lime-300">
              <CountUp to={marginalRate} decimals={2} prefix="₹" suffix=" / unit" />
            </div>
            <p className="mt-1 text-xs text-lime-200/80 leading-relaxed font-medium">
              Every unit you save cuts exactly this much. Combines energy, fuel surcharge, auto recovery & duty.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
