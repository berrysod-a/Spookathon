"use client";

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { formatINR } from "@/lib/calc";
import { useT } from "@/i18n";

interface BillDonutProps {
  fixedCharge: number;
  energyCharge: number;
  surcharges: number; // fuelSurcharge + autoRecoverySurcharge
  duty: number;
  other: number;
  total: number;
}

const COLORS = [
  "#8b5cf6", // Fixed charge (violet)
  "#3b82f6", // Energy charge (blue)
  "#f59e0b", // Surcharges (amber)
  "#f97316", // Electricity Duty (orange)
  "#71717a", // Other
];

export function BillDonutChart({
  fixedCharge,
  energyCharge,
  surcharges,
  duty,
  other,
  total,
}: BillDonutProps) {
  const t = useT();

  const data = [
    { name: t("s2.fc.title"), value: fixedCharge, color: COLORS[0], desc: t("s2.fc.desc") },
    { name: t("s2.ec.title"), value: energyCharge, color: COLORS[1], desc: t("s2.ec.desc") },
    { name: t("s2.fs.title"), value: surcharges, color: COLORS[2], desc: t("s2.fs.desc") },
    { name: t("s2.ed.title"), value: duty, color: COLORS[3], desc: t("s2.ed.desc") },
    ...(other > 0 ? [{ name: t("s2.other.title"), value: other, color: COLORS[4], desc: t("s2.other.desc") }] : []),
  ].filter((d) => d.value > 0);

  const fixedPct = Math.round((fixedCharge / Math.max(1, total)) * 100);
  const variablePct = 100 - fixedPct;

  return (
    <div className="w-full flex flex-col md:flex-row items-center gap-6">
      {/* Donut chart */}
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="65%"
              outerRadius="88%"
              paddingAngle={3}
              dataKey="value"
              stroke="#18181b"
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  const pct = Math.round((item.value / total) * 100);
                  return (
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950/95 p-3 shadow-xl backdrop-blur-md">
                      <p className="text-xs font-semibold text-white">{item.name}</p>
                      <p className="text-sm font-mono font-bold text-lime-400">
                        {formatINR(item.value, 2)} ({pct}%)
                      </p>
                      <p className="text-[11px] text-zinc-400 mt-1">{item.desc}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
            {t("s2.ec.badge")}
          </span>
          <span className="text-2xl font-mono font-bold text-white">
            {variablePct}%
          </span>
          <span className="text-[10px] text-zinc-500">
            {fixedPct}% {t("s2.fc.badge")}
          </span>
        </div>
      </div>

      {/* Legend list */}
      <div className="flex-1 w-full space-y-2">
        {data.map((item) => {
          const pct = Math.round((item.value / total) * 100);
          return (
            <div
              key={item.name}
              className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/40 border border-zinc-800/40 text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <div>
                  <span className="text-zinc-200 font-medium">{item.name}</span>
                  <p className="text-[11px] text-zinc-500">{item.desc}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono font-semibold text-zinc-200">
                  {formatINR(item.value, 2)}
                </span>
                <span className="text-[11px] text-zinc-500 block font-mono">
                  {pct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
