"use client";

import React from "react";
import { Check } from "lucide-react";
import { useT } from "@/i18n";
import { useAppStore } from "@/lib/store";

const STEPS = [
  { id: 1, name: "Bill", full: "Bill details" },
  { id: 2, name: "Decoded", full: "Decoded" },
  { id: 3, name: "Appliances", full: "Appliances" },
  { id: 4, name: "Plan", full: "Savings plan" },
] as const;

export function ProgressPill() {
  const { step, setStep } = useAppStore();

  return (
    <nav aria-label="Progress" className="flex items-center gap-1.5 p-1 bg-zinc-900/90 border border-zinc-800 rounded-full backdrop-blur-md shadow-md text-xs">
      {STEPS.map((s) => {
        const isDone = s.id < step;
        const isCurrent = s.id === step;
        const isClickable = s.id <= step;

        return (
          <button
            key={s.id}
            type="button"
            onClick={() => isClickable && setStep(s.id as 1 | 2 | 3 | 4)}
            disabled={!isClickable}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all duration-200 select-none ${
              isCurrent
                ? "bg-lime-400 text-zinc-950 font-bold shadow-[0_0_12px_rgba(163,230,53,0.3)]"
                : isDone
                ? "text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer"
                : "text-zinc-600 cursor-not-allowed"
            }`}
          >
            {isDone ? (
              <span className="h-4 w-4 rounded-full bg-lime-400/20 text-lime-400 flex items-center justify-center">
                <Check className="h-2.5 w-2.5 stroke-[3]" />
              </span>
            ) : (
              <span className="h-4 w-4 rounded-full border border-current flex items-center justify-center text-[10px] font-mono">
                {s.id}
              </span>
            )}
            <span className="hidden sm:inline text-xs">{s.name}</span>
          </button>
        );
      })}
    </nav>
  );
}

