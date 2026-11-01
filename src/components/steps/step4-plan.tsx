"use client";

import React from "react";
import { useAppStore } from "@/lib/store";
import {
  billMetrics,
  formatINR,
} from "@/lib/calc";
import {
  buildEntryActions,
  buildShiftActions,
  todApplies,
} from "@/lib/schedule";
import { GoalRadialChart } from "@/components/charts/goal-radial-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useT } from "@/i18n";
import {
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Zap,
} from "lucide-react";

export function Step4Plan() {
  const t = useT();
  const {
    bill,
    entries,
    targetRupees,
    setTargetRupees,
    selectedActionIds,
    toggleAction,
    freeOnlyFilter,
    setFreeOnlyFilter,
    resetAll,
    setStep,
  } = useAppStore();

  const m = billMetrics(bill);
  const entryActions = buildEntryActions(entries, m);
  const shiftActions = buildShiftActions(entries, bill, m);
  const allActions = [...entryActions, ...shiftActions];

  const filteredActions = freeOnlyFilter
    ? allActions.filter((a) => a.free)
    : allActions;

  // Compute progress
  const selectedActions = allActions.filter((a) =>
    selectedActionIds.includes(a.id),
  );
  const savedRupees = selectedActions.reduce((acc, a) => acc + a.rupeesSaved, 0);
  const savedUnits = selectedActions.reduce((acc, a) => acc + a.unitsSaved, 0);
  const targetUnits = targetRupees / m.marginalRate;
  const pct = Math.min(1, savedRupees / Math.max(1, targetRupees));
  const met = savedRupees >= targetRupees && targetRupees > 0;
  const remainingRupees = Math.max(0, targetRupees - savedRupees);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 py-6 px-4">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-5">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            {t("s4.title")}
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            {t("s4.sub")}
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
                  {t("s4.target.label")}
                </span>
                <span className="text-xs font-mono text-lime-400 font-semibold bg-lime-400/10 border border-lime-400/20 px-2 py-0.5 rounded">
                  ~{targetUnits.toFixed(1)} {t("s4.target.units")}
                </span>
              </div>
              <div className="flex items-baseline gap-2 pt-2">
                <span className="text-4xl font-mono font-extrabold text-white">
                  {formatINR(targetRupees)}
                </span>
                <span className="text-xs text-zinc-500 font-mono">
                  {t("common.per.cycle")}
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
                <span>₹50 (~11 u)</span>
                <span>₹200 (~43 u)</span>
                <span>₹400 (~87 u)</span>
                <span>₹600 (~130 u)</span>
              </div>
            </div>

            {/* Linear Progress Bar */}
            <div className="space-y-2 pt-2 border-t border-zinc-800/80">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-zinc-300">
                  {formatINR(savedRupees)} committed
                </span>
                <span className="font-mono text-lime-400">
                  {Math.round(pct * 100)}% of goal
                </span>
              </div>
              <Progress value={pct * 100} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Radial Progress Gauge */}
        <Card className="border-zinc-800 bg-[#18181b] flex items-center justify-center">
          <CardContent className="p-6 w-full">
            <GoalRadialChart
              savedRupees={savedRupees}
              targetRupees={targetRupees}
              pct={pct}
            />
          </CardContent>
        </Card>
      </div>

      {/* Actionable Summary Banner */}
      <div
        className={`rounded-2xl border p-5 transition-all duration-300 ${
          met
            ? "border-lime-500/50 bg-lime-950/20 shadow-[0_0_25px_rgba(163,230,53,0.15)]"
            : "border-zinc-800 bg-zinc-900/60"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border shrink-0 ${
                met
                  ? "border-lime-500/30 bg-lime-400 text-zinc-950"
                  : "border-zinc-800 bg-zinc-900 text-lime-400"
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-base font-bold text-white">
                {selectedActionIds.length > 0
                  ? `Do these ${selectedActionIds.length} thing${selectedActionIds.length > 1 ? "s" : ""} this cycle to save about ${formatINR(savedRupees)}.`
                  : t("s4.summary.zero")}
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">
                {met
                  ? "Target reached for this cycle! All estimates derived from your marginal rate."
                  : `Need about ${formatINR(remainingRupees)} (~${(remainingRupees / m.marginalRate).toFixed(1)} units) more to hit your goal.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <Badge
              variant={met ? "lime" : "outline"}
              className="text-xs font-mono"
            >
              {t("s4.badge.units", { n: savedUnits.toFixed(1) })}
            </Badge>
          </div>
        </div>
      </div>

      {/* Action Selection List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">
              {t("s4.actions.title")}
            </h3>
            <p className="text-xs text-zinc-400">
              {t("s4.actions.sub")}
            </p>
          </div>

          {/* Free actions only toggle */}
          <div className="flex items-center gap-2">
            <Switch
              id="free-filter"
              checked={freeOnlyFilter}
              onCheckedChange={setFreeOnlyFilter}
            />
            <Label htmlFor="free-filter" className="text-xs text-zinc-300 cursor-pointer">
              {t("s4.free.filter")}
            </Label>
          </div>
        </div>

        {filteredActions.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20">
            <Zap className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
            <p className="text-sm text-zinc-400">
              {entries.length === 0
                ? t("s4.no.actions")
                : "No matching actions found with the current filters."}
            </p>
            {entries.length === 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep(3)}
                className="mt-4 border-zinc-700 text-zinc-300"
              >
                {t("s4.go.step3")}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredActions.map((action) => {
              const isSelected = selectedActionIds.includes(action.id);
              const isShift = "helpsGrid" in action;

              return (
                <div
                  key={action.id}
                  onClick={() => toggleAction(action.id)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 cursor-pointer select-none ${
                    isSelected
                      ? "border-lime-500/50 bg-lime-950/20 text-white shadow-[0_0_15px_rgba(163,230,53,0.1)]"
                      : "border-zinc-800/80 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900/80"
                  }`}
                >
                  <div className="flex items-center h-5">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleAction(action.id)}
                      className="rounded-md border-zinc-700 data-[state=checked]:bg-lime-400 data-[state=checked]:text-zinc-950"
                    />
                  </div>

                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold text-white truncate">
                        {action.label}
                      </h4>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isShift && (
                          <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-400/30 bg-amber-400/10">
                            {t("s4.helpsGrid")}
                          </Badge>
                        )}
                        {action.free && (
                          <Badge variant="outline" className="text-[10px] text-lime-400 border-lime-400/30 bg-lime-400/10">
                            {t("common.free")}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px] font-mono">
                      <span className="font-bold text-lime-400">
                        {action.rupeesSaved > 0
                          ? t("s4.save", { amount: formatINR(action.rupeesSaved) })
                          : "Helps Kerala grid off-peak"}
                      </span>
                      <span className="text-zinc-500">
                        {action.unitsSaved > 0
                          ? t("s4.units.cycle", { n: action.unitsSaved.toFixed(1) })
                          : isShift && "unitsShifted" in action
                          ? `~${(action as { unitsShifted: number }).unitsShifted.toFixed(1)} u shifted`
                          : ""}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reset Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-zinc-800">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep(3)}
          className="border-zinc-800 text-zinc-300"
        >
          {t("s4.back")}
        </Button>

        <Button
          type="button"
          variant="secondary"
          onClick={resetAll}
          className="border-zinc-800 text-zinc-400 hover:text-white"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          {t("s4.reset")}
        </Button>
      </div>
    </div>
  );
}
