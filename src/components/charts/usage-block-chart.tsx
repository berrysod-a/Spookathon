"use client";

import React from "react";
import { TIME_BLOCKS, type BlockId } from "@/data/timeBlocks";
import type { Range } from "@/lib/types";
import { formatINR } from "@/lib/calc";
import { useT } from "@/i18n";
import { Badge } from "@/components/ui/badge";

interface UsageBlockChartProps {
  data: {
    units: Record<BlockId, Range>;
    rupees: Record<BlockId, Range>;
    rates: Record<BlockId, number>;
    peakShare: number;
    todApplies: boolean;
  };
}

export function UsageBlockChart({ data }: UsageBlockChartProps) {
  const t = useT();

  // Find max typical units for relative bar width
  const maxUnits = Math.max(
    1,
    ...TIME_BLOCKS.map((b) => data.units[b.id]?.typ ?? 0),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-white">
            24-hour usage distribution
          </h4>
          <p className="text-xs text-zinc-400">
            {t("s3.chart.label")}
          </p>
        </div>
        <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-400">
          5 time blocks
        </Badge>
      </div>

      <div className="space-y-2.5">
        {TIME_BLOCKS.map((block) => {
          const u = data.units[block.id] ?? { low: 0, typ: 0, high: 0 };
          const r = data.rupees[block.id] ?? { low: 0, typ: 0, high: 0 };
          const isPeak = block.zone === "peak";
          const pct = Math.min(100, (u.typ / maxUnits) * 100);

          return (
            <div key={block.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className={`flex items-center gap-1.5 ${isPeak ? "text-amber-400 font-semibold" : "text-zinc-300"}`}>
                  <span>{t(`block.${block.id}` as Parameters<typeof t>[0])}</span>
                  {isPeak && (
                    <span className="text-[9px] bg-amber-950/80 text-amber-400 border border-amber-800/60 px-1 rounded font-mono">
                      PEAK
                    </span>
                  )}
                </span>
                <span className="font-mono text-zinc-400 text-[11px]">
                  ~{u.typ.toFixed(1)} units · {formatINR(r.typ)}
                </span>
              </div>

              <div className="h-3 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/80">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isPeak
                      ? "bg-gradient-to-r from-amber-500 to-amber-400"
                      : "bg-gradient-to-r from-lime-600 to-lime-400"
                  }`}
                  style={{ width: `${Math.max(4, pct)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Notes */}
      <div className="pt-2 border-t border-zinc-800/80 space-y-1 text-xs">
        {data.todApplies ? (
          <p className="text-zinc-400">
            <span className="text-amber-400 font-medium">ToD tariff active (&gt;250 units/mo):</span> 25% extra during 6–10 pm peak; 10% discount in daytime.
          </p>
        ) : (
          <p className="text-zinc-500">
            {t("s3.tod.no")}
          </p>
        )}
        {data.peakShare > 0.35 && (
          <p className="text-amber-400/90 font-medium text-[11px]">
            ⚡ {t("s3.peak.note")} ({(data.peakShare * 100).toFixed(0)}% of total daily draw).
          </p>
        )}
      </div>
    </div>
  );
}

