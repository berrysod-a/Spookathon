"use client";

import React from "react";
import { Zap, ShieldAlert, Calendar, Activity, CheckCircle2 } from "lucide-react";
import { formatINR } from "@/lib/calc";

export function LivePreviewCard() {
  return (
    <div className="w-full h-full bg-[#18181b] p-4 sm:p-6 text-left flex flex-col justify-between overflow-hidden">
      {/* Top Header of Device Frame */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
          <span className="text-xs font-mono text-zinc-400 ml-2">
            Watt Plan • KSEB Bi-monthly Bill (Sample)
          </span>
        </div>
        <span className="text-[11px] font-mono text-lime-400 bg-lime-400/10 border border-lime-400/20 px-2 py-0.5 rounded-full">
          61 days • 281 units
        </span>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3">
          <div className="flex items-center justify-between text-zinc-400 text-[11px]">
            <span>Units used</span>
            <Zap className="w-3.5 h-3.5 text-lime-400" />
          </div>
          <p className="text-xl sm:text-2xl font-mono font-bold text-white mt-1">281</p>
          <p className="text-[10px] text-zinc-500 font-mono">₹1,473 total</p>
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3">
          <div className="flex items-center justify-between text-zinc-400 text-[11px]">
            <span>Daily avg</span>
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <p className="text-xl sm:text-2xl font-mono font-bold text-white mt-1">4.61</p>
          <p className="text-[10px] text-zinc-500 font-mono">units / day</p>
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3">
          <div className="flex items-center justify-between text-zinc-400 text-[11px]">
            <span>Avg power</span>
            <Activity className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-xl sm:text-2xl font-mono font-bold text-white mt-1">192 W</p>
          <p className="text-[10px] text-zinc-500 font-mono">Continuous draw</p>
        </div>

        <div className="rounded-xl border border-lime-500/40 bg-lime-950/20 p-3">
          <div className="flex items-center justify-between text-lime-400 text-[11px]">
            <span>True savings rate</span>
            <span className="h-1.5 w-1.5 rounded-full bg-lime-400 animate-pulse" />
          </div>
          <p className="text-xl sm:text-2xl font-mono font-extrabold text-lime-300 mt-1">₹4.61</p>
          <p className="text-[10px] text-lime-400/80 font-mono">Cost per extra unit</p>
        </div>
      </div>

      {/* Mini Visual Breakdown */}
      <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-300 font-medium">Estimated appliance shares</span>
          <span className="text-zinc-500 font-mono text-[11px]">Typical estimates</span>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Ceiling fans (2 units, 6 h/day)</span>
            <span className="font-mono text-zinc-300">~51 units (18%)</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: "18%" }} />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Frost-free refrigerator (15 yrs old)</span>
            <span className="font-mono text-zinc-300">~95 units (34%)</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
            <div className="h-full bg-violet-500 rounded-full" style={{ width: "34%" }} />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-amber-400 font-medium">Not covered by your list</span>
            <span className="font-mono text-amber-300">~90 units (32%)</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: "32%" }} />
          </div>
        </div>
      </div>

      {/* Footer Pill */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500 border-t border-zinc-800/60 pt-2">
        <span className="flex items-center gap-1.5 text-zinc-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-lime-400" />
          Honest range-based estimations
        </span>
        <span className="font-mono text-zinc-500">Fixed share: 12.1% (₹178.50)</span>
      </div>
    </div>
  );
}

