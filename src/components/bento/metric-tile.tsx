"use client";

import React from "react";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { CountUp } from "@/components/ui/count-up";
import { LucideIcon } from "lucide-react";

interface MetricTileProps {
  label: string;
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  subtitle?: string;
  deltaChip?: string;
  deltaChipVariant?: "lime" | "amber" | "violet" | "orange" | "blue";
  icon?: LucideIcon;
  spotlightColor?: string;
}

export function MetricTile({
  label,
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  subtitle,
  deltaChip,
  deltaChipVariant = "lime",
  icon: Icon,
  spotlightColor = "rgba(163, 230, 53, 0.08)",
}: MetricTileProps) {
  const chipColors = {
    lime: "bg-lime-500/10 text-lime-400 border-lime-500/30",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    violet: "bg-violet-500/10 text-violet-400 border-violet-500/30",
    orange: "bg-orange-500/10 text-orange-400 border-orange-500/30",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  };

  return (
    <SpotlightCard
      spotlightColor={spotlightColor}
      className="flex flex-col justify-between h-full bg-[#18181b] border-zinc-800/80 rounded-2xl p-5"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-zinc-400 tracking-tight">
          {label}
        </span>
        {Icon && (
          <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="my-3">
        <div className="text-3xl lg:text-4xl font-mono font-bold tracking-tight text-white">
          <CountUp
            to={value}
            decimals={decimals}
            prefix={prefix}
            suffix={suffix}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-800/50">
        <span className="text-xs text-zinc-500 truncate">
          {subtitle || "Calculated from bill"}
        </span>
        {deltaChip && (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-medium font-mono shrink-0 ${chipColors[deltaChipVariant]}`}
          >
            {deltaChip}
          </span>
        )}
      </div>
    </SpotlightCard>
  );
}

