"use client";

import React from "react";
import { useAppStore } from "@/lib/store";
import {
  billMetrics,
  buildActions,
  planProgress,
  targetToUnits,
  formatINR,
} from "@/lib/calc";
import { GoalRadialChart } from "@/components/charts/goal-radial-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Target,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
  RotateCcw,
  Zap,
  TrendingDown,
} from "lucide-react";

export function Step4Plan() {
  const {
    bill,
    selections,
    targetRupees,
    setTargetRupees,
    selectedActionIds,
    toggleAction,
    freeOnlyFilter,
    setFreeOnlyFilter,
    setStep,
    resetAll,
  } = useAppStore();

  const m = billMetrics(bill);
  const allActions = buildActions(selections, m);

  // If user selected no appliances yet, provide a friendly message or fallback actions
  const filteredActions = freeOnlyFilter
    ? allActions.filter((a) => a.free)
    : allActions;

  const progress = planProgress(allActions, selectedActionIds, targetRupees, m.marginalRate);
  const targetUnits = targetToUnits(targetRupees, m.marginalRate);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 py-6 px-4">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-5">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Your savings plan
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Pick changes for your household to hit your target next billing period. All savings use the true marginal rate of ₹{m.marginalRate.toFixed(2)}/unit.
          </p>
        </div>
      </div>

      {/* Target Setting & Radial Chart Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Target Slider & Units Conversion */}
        <Card className="md:col-span-2 border-zinc-800 bg-[#18181b]">
          <CardContent className="p-6 flex flex-col justify-between h-full space-y-6">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Bi-monthly savings target
                </span>
                <span className="text-xs font-mono text-lime-400 font-semibold bg-lime-400/10 border border-lime-400/20 px-2 py-0.5 rounded">
                  ~{targetUnits.toFixed(1)} units needed
                </span>
              </div>
              <div className="flex items-baseline gap-2 pt-2">
                <span className="text-4xl font-mono font-extrabold text-white">
                  {formatINR(targetRupees)}
                </span>
                <span className="text-xs text-zinc-500 font-mono">
                  per 60-day cycle
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Slider
                value={[targetRupees]}
                min={50}
                max={600}
                step={25}
                onValueChange={([val]) => setTargetRupees(val)}
              />
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span>₹50 (~11 units)</span>
                <span>₹200 (~43 units)</span>
                <span>₹400 (~87 units)</span>
                <span>₹600 (~130 units)</span>
              </div>
            </div>

            {/* Linear Progress Bar */}
            <div className="space-y-2 pt-2 border-t border-zinc-800/80">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-zinc-300">
                  {formatINR(progress.savedRupees)} committed
                </span>
                <span className="font-mono text-lime-400">
                  {Math.round(progress.pct * 100)}% of goal
                </span>
              </div>
              <Progress value={progress.pct * 100} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Radial Progress Gauge */}
        <Card className="border-zinc-800 bg-[#18181b] flex items-center justify-center">
          <CardContent className="p-6 w-full">
            <GoalRadialChart
              savedRupees={progress.savedRupees}
              targetRupees={targetRupees}
              pct={progress.pct}
            />
          </CardContent>
        </Card>
      </div>

      {/* Final Actionable Summary Banner */}
      <div
        className={`rounded-2xl border p-5 transition-all duration-300 ${progress.met
            ? "border-lime-500/50 bg-lime-950/20 shadow-[0_0_25px_rgba(163,230,53,0.15)]"
            : "border-zinc-800 bg-zinc-900/60"
          }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border shrink-0 ${progress.met
                  ? "border-lime-500/30 bg-lime-400 text-zinc-950"
                  : "border-zinc-800 bg-zinc-900 text-lime-400"
                }`}
            >
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-base font-bold text-white">
                {selectedActionIds.length > 0
                  ? `Do these ${selectedActionIds.length} thing${selectedActionIds.length > 1 ? "s" : ""} this cycle to save about ${formatINR(progress.savedRupees)}.`
                  : "Select actions below to start building your savings."}
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">
                {progress.met
                  ? "Congratulations! You have reached your savings target for this cycle."
                  : `Need about ${formatINR(progress.remainingRupees)} (~${(progress.remainingRupees / m.marginalRate).toFixed(1)} units) more to hit your goal.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <Badge
              variant={progress.met ? "lime" : "outline"}
              className="text-xs font-mono"
            >
              {progress.savedUnits.toFixed(1)} units cut
            </Badge>
          </div>
        </div>
      </div>

      {/* Action Selection List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-white">
              Ranked savings actions
            </h3>
            <p className="text-xs text-zinc-400">
              Ordered by highest rupee savings at the true marginal rate.
            </p>
          </div>

          {/* Free actions only filter */}
          <div className="flex items-center gap-2.5 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl self-start sm:self-auto">
            <Switch
              id="free-filter"
              checked={freeOnlyFilter}
              onCheckedChange={setFreeOnlyFilter}
            />
            <Label htmlFor="free-filter" className="text-xs text-zinc-300 cursor-pointer">
              Free actions only (Zero expense)
            </Label>
          </div>
        </div>

        {filteredActions.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8 text-center space-y-3">
            <p className="text-sm text-zinc-400">
              No actions available for the current appliance list.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setStep(3)}
              className="border-zinc-700 text-zinc-300"
            >
              Pick appliances in Step 3
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredActions.map((action) => {
              const isSelected = selectedActionIds.includes(action.id);

              return (
                <div
                  key={action.id}
                  onClick={() => toggleAction(action.id)}
                  className={`p-4 rounded-2xl border cursor-pointer select-none transition-all duration-200 flex items-start gap-3.5 ${isSelected
                      ? "border-lime-400/80 bg-lime-950/20 shadow-[0_0_15px_rgba(163,230,53,0.12)]"
                      : "border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/70"
                    }`}
                >
                  <div className="pt-0.5">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleAction(action.id)}
                    />
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold text-white">
                        {action.label}
                      </h4>
                      {action.free && (
                        <Badge variant="outline" className="text-[10px] text-lime-400 border-lime-400/30 bg-lime-400/10">
                          Free
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-mono font-bold text-lime-400">
                        Save ~{formatINR(action.rupeesSaved)}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-500">
                        ~{action.unitsSaved.toFixed(1)} units / cycle
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Navigation and Reset Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-zinc-800">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep(3)}
          className="border-zinc-800 text-zinc-300"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to breakdown
        </Button>

        <Button
          type="button"
          variant="secondary"
          onClick={resetAll}
          className="border-zinc-800 text-zinc-400 hover:text-white"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Start new bill
        </Button>
      </div>
    </div>
  );
}

