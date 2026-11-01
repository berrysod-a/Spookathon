"use client";

import React from "react";
import { useAppStore } from "@/lib/store";
import { billMetrics, formatINR } from "@/lib/calc";
import { MetricTile } from "@/components/bento/metric-tile";
import { RateComparison } from "@/components/bento/rate-comparison";
import { BillDonutChart } from "@/components/charts/bill-donut-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useT } from "@/i18n";
import {
  Calendar,
  Zap,
  Activity,
  ArrowRight,
  ShieldAlert,
  Languages,
} from "lucide-react";

export function Step2Decode() {
  const t = useT();
  const { bill, lang, setLang, setStep } = useAppStore();
  const m = billMetrics(bill);
  const energyRate = bill.energyCharge / Math.max(1, bill.units);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 py-6 px-4">
      {/* Header with Title and Language Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            {t("s2.title")}
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            {t("s2.sub")}
          </p>
        </div>

        {/* Malayalam / English language toggle */}
        <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 px-3.5 py-2 rounded-xl self-start sm:self-auto">
          <Languages className="w-4 h-4 text-lime-400" />
          <Label htmlFor="lang-toggle" className="text-xs font-medium text-zinc-300">
            {lang === "en" ? t("s2.lang.toggle") : t("s2.lang.toggle.ml")}
          </Label>
          <Switch
            id="lang-toggle"
            checked={lang === "ml"}
            onCheckedChange={(checked) => setLang(checked ? "ml" : "en")}
          />
        </div>
      </div>

      {/* Bento Grid: 4 Key Number Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricTile
          label={t("s2.metric.units.label")}
          value={bill.units}
          suffix={t("s2.metric.units.suffix")}
          subtitle={t("common.days.cycle", { n: m.days })}
          deltaChip={`${formatINR(bill.total)}`}
          deltaChipVariant="lime"
          icon={Zap}
          spotlightColor="rgba(163, 230, 53, 0.12)"
        />

        <MetricTile
          label={t("s2.metric.daily.label")}
          value={m.unitsPerDay}
          decimals={2}
          suffix={t("s2.metric.daily.suffix")}
          subtitle={t("common.avg.rate")}
          deltaChip={`~${m.unitsPerDay.toFixed(1)} u/day`}
          deltaChipVariant="blue"
          icon={Calendar}
          spotlightColor="rgba(59, 130, 246, 0.12)"
        />

        <MetricTile
          label={t("s2.metric.watts.label")}
          value={m.avgWatts}
          decimals={0}
          suffix={t("s2.metric.watts.suffix")}
          subtitle={t("common.equiv.watts")}
          deltaChip="Continuous"
          deltaChipVariant="amber"
          icon={Activity}
          spotlightColor="rgba(245, 158, 11, 0.12)"
        />

        <MetricTile
          label={t("s2.metric.fixed.label")}
          value={m.fixedShare * 100}
          decimals={1}
          suffix={t("s2.metric.fixed.suffix")}
          subtitle={t("common.unavoidable")}
          deltaChip={`${formatINR(bill.fixedCharge)}`}
          deltaChipVariant="violet"
          icon={ShieldAlert}
          spotlightColor="rgba(139, 92, 246, 0.12)"
        />
      </div>

      {/* The Three Rates Comparison Card */}
      <RateComparison
        energyRate={energyRate}
        allInRate={m.allInRate}
        marginalRate={m.marginalRate}
      />

      {/* Fixed vs Variable Donut Split */}
      <Card className="border-zinc-800 bg-[#18181b]">
        <CardContent className="p-6">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-white">
              {t("s2.chart.title")}
            </h3>
            <p className="text-xs text-zinc-400">
              {t("s2.chart.sub")}
            </p>
          </div>
          <BillDonutChart
            fixedCharge={bill.fixedCharge}
            energyCharge={bill.energyCharge}
            surcharges={bill.fuelSurcharge + bill.autoRecoverySurcharge}
            duty={bill.electricityDuty}
            other={bill.otherCharges + bill.roundOff}
            total={bill.total}
          />
        </CardContent>
      </Card>

      {/* Plain Language Decoder Cards */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-white">
          {t("s2.cards.title")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Fixed Charge */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-200">
                {t("s2.fc.title")}
              </span>
              <Badge variant="violet" className="text-[10px]">
                {t("s2.fc.badge")} • {formatINR(bill.fixedCharge, 2)}
              </Badge>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {t("s2.fc.desc")}
            </p>
          </div>

          {/* Energy Charge */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-200">
                {t("s2.ec.title")}
              </span>
              <Badge variant="blue" className="text-[10px]">
                {t("s2.ec.badge")} • {formatINR(bill.energyCharge, 2)}
              </Badge>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {t("s2.ec.desc")}
            </p>
          </div>

          {/* Fuel Surcharge */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-200">
                {t("s2.fs.title")}
              </span>
              <Badge variant="amber" className="text-[10px]">
                {t("s2.fs.badge")} • {formatINR(bill.fuelSurcharge, 2)}
              </Badge>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {t("s2.fs.desc")}
            </p>
          </div>

          {/* Auto Recovery */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-200">
                {t("s2.fsm.title")}
              </span>
              <Badge variant="amber" className="text-[10px]">
                {t("s2.fsm.badge")} • {formatINR(bill.autoRecoverySurcharge, 2)}
              </Badge>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {t("s2.fsm.desc")}
            </p>
          </div>

          {/* Electricity Duty */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-200">
                {t("s2.ed.title")}
              </span>
              <Badge variant="amber" className="text-[10px]">
                {t("s2.ed.badge")} • {formatINR(bill.electricityDuty, 2)}
              </Badge>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {t("s2.ed.desc")}
            </p>
          </div>

          {/* Other / Round Off */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-200">
                {t("s2.other.title")}
              </span>
              <Badge variant="outline" className="text-[10px]">
                {t("s2.other.badge")} • {formatINR(bill.otherCharges + bill.roundOff, 2)}
              </Badge>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {t("s2.other.desc")}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-end pt-6 border-t border-zinc-800">
        <Button
          type="button"
          size="lg"
          variant="default"
          className="bg-lime-400 text-zinc-950 font-semibold hover:bg-lime-300"
          onClick={() => setStep(3)}
        >
          <span>{t("s2.next")}</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
