"use client";

import React from "react";
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import { formatINR } from "@/lib/calc";

interface GoalRadialChartProps {
  savedRupees: number;
  targetRupees: number;
  pct: number; // 0..1
}

export function GoalRadialChart({
  savedRupees,
  targetRupees,
  pct,
}: GoalRadialChartProps) {
  const percentage = Math.round(pct * 100);
  const data = [
    {
      name: "Savings",
      value: Math.min(100, percentage),
      fill: percentage >= 100 ? "#a3e635" : "#3b82f6",
    },
  ];

  return (
    <div className="relative w-44 h-44 sm:w-52 sm:h-52 mx-auto flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="72%"
          outerRadius="100%"
          barSize={14}
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background={{ fill: "#27272a" }}
            dataKey="value"
            cornerRadius={10}
          />
        </RadialBarChart>
      </ResponsiveContainer>

      {/* Center percentage and rupee display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
        <span className="text-3xl sm:text-4xl font-mono font-extrabold text-white">
          {percentage}%
        </span>
        <span className="text-[11px] font-mono font-medium text-lime-400 mt-0.5">
          {formatINR(savedRupees)} / {formatINR(targetRupees)}
        </span>
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">
          {percentage >= 100 ? "Goal reached!" : "Of target"}
        </span>
      </div>
    </div>
  );
}

