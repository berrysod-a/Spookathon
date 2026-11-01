"use client";

import React, { useEffect, useRef } from "react";
import { Check, Pencil } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface FlowSectionProps {
  stepNumber: number;
  currentStep: number;
  title: string;
  summary: React.ReactNode;
  onEdit: () => void;
  children: React.ReactNode;
}

export function FlowSection({
  stepNumber,
  currentStep,
  title,
  summary,
  onEdit,
  children,
}: FlowSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const isCompleted = currentStep > stepNumber;
  const isActive = currentStep === stepNumber;
  const isPending = currentStep < stepNumber;

  // When this section becomes active, scroll to it smoothly
  useEffect(() => {
    if (isActive && stepNumber > 1) {
      // Small timeout to allow layout to settle
      const timer = setTimeout(() => {
        sectionRef.current?.scrollIntoView({
          behavior: shouldReduceMotion ? "auto" : "smooth",
          block: "start",
        });
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [isActive, stepNumber, shouldReduceMotion]);

  if (isPending) {
    return null; // Don't render upcoming steps until reached
  }

  return (
    <div ref={sectionRef} className="scroll-mt-20 w-full transition-all duration-300">
      {isCompleted ? (
        /* Collapsed Summary Strip */
        <div className="w-full max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/70 p-3.5 transition-all">
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-lime-400 text-zinc-950 shadow-[0_0_12px_rgba(163,230,53,0.3)]">
                <Check className="h-4 w-4 stroke-[3]" />
              </span>
              <div className="truncate text-xs sm:text-sm text-zinc-300">
                <span className="font-semibold text-white mr-2">{title}:</span>
                <span className="text-zinc-400 font-mono">{summary}</span>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="h-8 shrink-0 text-xs font-semibold text-lime-400 hover:text-lime-300 hover:bg-lime-400/10 gap-1.5"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit</span>
            </Button>
          </div>
        </div>
      ) : (
        /* Expanded Active Step Content */
        <div className="animate-in fade-in duration-300">
          {children}
        </div>
      )}
    </div>
  );
}
