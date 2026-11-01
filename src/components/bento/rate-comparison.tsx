"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";
import { CountUp } from "@/components/ui/count-up";
import { useT } from "@/i18n";

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
  const t = useT();

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <span>{t("s2.rates.title")}</span>
            <Badge variant="lime" className="text-[10px] uppercase tracking-wider">
              {t("s2.rates.badge")}
            </Badge>
          </h3>
          <p className="text-xs text-zinc-400">
            {t("s2.rates.sub")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Rate 1: Tariff Energy Rate */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 flex flex-col justify-between space-y-3">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-zinc-400">{t("s2.rates.r1.title")}</span>
            <span className="text-[10px] text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
              {t("s2.rates.r1.tag")}
            </span>
          </div>

          <div>
            <div className="text-2xl font-mono font-bold text-zinc-300">
              <CountUp to={energyRate} decimals={2} prefix="₹" suffix=" / unit" />
            </div>
            <p className="mt-1 text-xs text-zinc-500 leading-relaxed">
              {t("s2.rates.r1.desc")}
            </p>
          </div>
        </div>

        {/* Rate 2: All-in Rate */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 flex flex-col justify-between space-y-3">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-zinc-400">{t("s2.rates.r2.title")}</span>
            <span className="text-[10px] text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
              {t("s2.rates.r2.tag")}
            </span>
          </div>

          <div>
            <div className="text-2xl font-mono font-bold text-amber-300">
              <CountUp to={allInRate} decimals={2} prefix="₹" suffix=" / unit" />
            </div>
            <p className="mt-1 text-xs text-zinc-500 leading-relaxed">
              {t("s2.rates.r2.desc")}
            </p>
          </div>
        </div>

        {/* Rate 3: True Marginal Rate (Highlighted) */}
        <div className="rounded-2xl border-2 border-lime-400/80 bg-lime-950/20 p-4 flex flex-col justify-between space-y-3 shadow-[0_0_25px_rgba(163,230,53,0.12)]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-lime-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 fill-lime-400 text-lime-400" />
              {t("s2.rates.r3.title")}
            </span>
            <span className="text-[10px] font-bold text-zinc-950 bg-lime-400 px-2 py-0.5 rounded-full font-mono">
              {t("s2.rates.r3.tag")}
            </span>
          </div>

          <div>
            <div className="text-3xl font-mono font-extrabold text-lime-300">
              <CountUp to={marginalRate} decimals={2} prefix="₹" suffix=" / unit" />
            </div>
            <p className="mt-1 text-xs text-lime-200/80 leading-relaxed font-medium">
              {t("s2.rates.r3.desc")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
