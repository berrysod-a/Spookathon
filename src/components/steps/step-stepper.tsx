"use client";

import { useAppStore } from "@/lib/store";
import { Check, Sparkles, BarChart3, PieChart, Target } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Confirm bill", icon: Sparkles },
  { id: 2, label: "Bill decoded", icon: BarChart3 },
  { id: 3, label: "Where it went", icon: PieChart },
  { id: 4, label: "Savings plan", icon: Target },
] as const;

export function StepStepper() {
  const { step, setStep, validationIssues } = useAppStore();
  const hasErrors = validationIssues.some((i) => i.severity === "error");

  return (
    <nav aria-label="Analysis steps" className="w-full max-w-4xl mx-auto px-4 py-4">
      <ol className="flex items-center justify-between relative">
        {/* Background track line */}
        <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-0.5 bg-zinc-800 -z-0" />
        {/* Active track line */}
        <div
          className="absolute top-1/2 left-6 -translate-y-1/2 h-0.5 bg-lime-400 transition-all duration-300 -z-0"
          style={{
            width: `${((step - 1) / (STEPS.length - 1)) * 100}%`,
          }}
        />

        {STEPS.map((s) => {
          const isDone = s.id < step;
          const isCurrent = s.id === step;
          const isClickable = s.id < step || (s.id === 2 && !hasErrors);
          const Icon = s.icon;

          return (
            <li key={s.id} className="relative z-10 flex flex-col items-center">
              <button
                type="button"
                onClick={() => isClickable && setStep(s.id as 1 | 2 | 3 | 4)}
                disabled={!isClickable && !isCurrent}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
                  isDone
                    ? "border-lime-400 bg-lime-400 text-zinc-950 cursor-pointer shadow-[0_0_15px_rgba(163,230,53,0.3)]"
                    : isCurrent
                    ? "border-lime-400 bg-zinc-950 text-lime-400 shadow-[0_0_20px_rgba(163,230,53,0.25)]"
                    : "border-zinc-800 bg-zinc-900 text-zinc-500 cursor-not-allowed"
                )}
              >
                {isDone ? (
                  <Check className="h-5 w-5 stroke-[3]" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </button>
              <span
                className={cn(
                  "mt-2 text-xs font-medium tracking-tight whitespace-nowrap",
                  isCurrent
                    ? "text-lime-400 font-semibold"
                    : isDone
                    ? "text-zinc-300"
                    : "text-zinc-500"
                )}
              >
                {s.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

