"use client";

import React from "react";
import { useT } from "@/i18n";
import { Badge } from "@/components/ui/badge";

interface WeeklyChartProps {
  profile: {
    weekdayKwh: number;
    weekendKwh: number;
    week: number[];
  };
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function WeeklyChart({ profile }: WeeklyChartProps) {
  const t = useT();
  const maxDay = Math.max(1, ...profile.week);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-white">
            Weekly usage pattern
          </h4>
          <p className="text-xs text-zinc-400">
            {t("s3.chart.label")}
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="flex items-center gap-1 text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-lime-400 inline-block" />
            {t("s3.weekday")}
          </span>
          <span className="flex items-center gap-1 text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
            {t("s3.weekend")}
          </span>
        </div>
      </div>

      {/* 7-bar chart */}
      <div className="grid grid-cols-7 gap-2 items-end h-32 pt-4 pb-2 px-1 bg-zinc-900/60 rounded-xl border border-zinc-800/80">
        {profile.week.map((kwh, idx) => {
          const isWeekend = idx >= 5;
          const heightPct = Math.min(100, Math.max(10, (kwh / maxDay) * 100));

          return (
            <div key={DAY_LABELS[idx]} className="flex flex-col items-center h-full justify-end gap-1.5">
              <span className="text-[10px] font-mono text-zinc-400">
                {kwh.toFixed(1)}
              </span>
              <div className="w-full max-w-[28px] h-full flex items-end">
                <div
                  className={`w-full rounded-t-md transition-all duration-300 ${
                    isWeekend
                      ? "bg-gradient-to-t from-blue-600 to-blue-400"
                      : "bg-gradient-to-t from-lime-600 to-lime-400"
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
              </div>
              <span className={`text-[10px] font-mono ${isWeekend ? "text-blue-400 font-semibold" : "text-zinc-500"}`}>
                {DAY_LABELS[idx]}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-400">
        <span>Weekday avg: <strong className="text-white font-mono">{profile.weekdayKwh.toFixed(1)}</strong> kWh/day</span>
        <span>Weekend avg: <strong className="text-white font-mono">{profile.weekendKwh.toFixed(1)}</strong> kWh/day</span>
      </div>
    </div>
  );
}

