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
import {
  Calendar,
  Zap,
  Activity,
  ArrowRight,
  ArrowLeft,
  ShieldAlert,
  Info,
  Languages,
} from "lucide-react";

export function Step2Decode() {
  const { bill, lang, setLang, setStep } = useAppStore();
  const m = billMetrics(bill);

  const energyRate = bill.energyCharge / Math.max(1, bill.units);

  // Copy definitions for charges in English & Malayalam
  const COPY = {
    en: {
      toggleLabel: "English",
      fcTitle: "Fixed charge (FC)",
      fcDesc: "You pay this even if you use zero units.",
      fcBadge: "Fixed",
      ecTitle: "Energy charge (EC)",
      ecDesc: "Grows with every unit you consume according to tariff slabs.",
      ecBadge: "Variable",
      fsTitle: "Fuel surcharge (FS)",
      fsDesc: "Additional cost per unit reflecting fuel price changes.",
      fsBadge: "Variable",
      fsmTitle: "Auto recovery surcharge (FSM)",
      fsmDesc: "Cost recovery for power purchases made by KSEB.",
      fsmBadge: "Variable",
      edTitle: "Electricity duty (ED)",
      edDesc: "Government tax (10% of energy charge). Grows with usage.",
      edBadge: "Variable",
      otherTitle: "Other charges & round off",
      otherDesc: "Meter rent, arrears, or decimal rounding adjustments.",
      otherBadge: "Adjust",
      nextAction: "Where did these units go?",
    },
    ml: {
      toggleLabel: "മലയാളം",
      fcTitle: "സ്ഥിര ചാർജ് (Fixed Charge)",
      fcDesc: "ഒരു യൂണിറ്റും ഉപയോഗിച്ചില്ലെങ്കിലും അടയ്ക്കണം.",
      fcBadge: "സ്ഥിരം",
      ecTitle: "ഊർജ്ജ ചാർജ് (Energy Charge)",
      ecDesc: "ഉപയോഗിച്ച ഓരോ യൂണിറ്റിനുമുള്ള നിരക്ക്.",
      ecBadge: "മാറുന്നത്",
      fsTitle: "ഇന്ധന സർചാർജ് (Fuel Surcharge)",
      fsDesc: "ഓരോ യൂണിറ്റിനും അധികമായി ചേർക്കുന്ന തുക.",
      fsBadge: "മാറുന്നത്",
      fsmTitle: "ഓട്ടോ റിക്കവറി (FSM Surcharge)",
      fsmDesc: "മുൻകാല വൈദ്യുതി വാങ്ങൽ ചെലവ് വീണ്ടെടുക്കൽ.",
      fsmBadge: "മാറുന്നത്",
      edTitle: "വൈദ്യുതി തീരുവ (Electricity Duty)",
      edDesc: "സർക്കാരിലേക്കുള്ള നികുതി (ഊർജ്ജ ചാർജിന്റെ 10%).",
      edBadge: "മാറുന്നത്",
      otherTitle: "മറ്റ് നിരക്കുകൾ & റൗണ്ട് ഓഫ്",
      otherDesc: "മീറ്റർ വാടക അല്ലെങ്കിൽ റൗണ്ടിംഗ് ക്രമീകരണം.",
      otherBadge: "ക്രമീകരണം",
      nextAction: "ഈ യൂണിറ്റുകൾ എവിടെ പോയി?",
    },
  }[lang];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 py-6 px-4">
      {/* Header with Title and Language Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Your bill, decoded
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Understanding what you pay for and what each extra unit actually costs.
          </p>
        </div>

        {/* Malayalam / English language toggle */}
        <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 px-3.5 py-2 rounded-xl self-start sm:self-auto">
          <Languages className="w-4 h-4 text-lime-400" />
          <Label htmlFor="lang-toggle" className="text-xs font-medium text-zinc-300">
            {lang === "en" ? "മലയാളം വിശദീകരണം" : "English explanation"}
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
          label="Billed consumption"
          value={bill.units}
          suffix=" units"
          subtitle={`${m.days} days billing cycle`}
          deltaChip={`${formatINR(bill.total)}`}
          deltaChipVariant="lime"
          icon={Zap}
          spotlightColor="rgba(163, 230, 53, 0.12)"
        />

        <MetricTile
          label="Daily average usage"
          value={m.unitsPerDay}
          decimals={2}
          suffix=" u/day"
          subtitle="Average burn rate"
          deltaChip="~4.6 units/day"
          deltaChipVariant="blue"
          icon={Calendar}
          spotlightColor="rgba(59, 130, 246, 0.12)"
        />

        <MetricTile
          label="Continuous draw"
          value={m.avgWatts}
          decimals={0}
          suffix=" W"
          subtitle="24h home power draw"
          deltaChip="Equivalent watts"
          deltaChipVariant="amber"
          icon={Activity}
          spotlightColor="rgba(245, 158, 11, 0.12)"
        />

        <MetricTile
          label="Fixed cost share"
          value={m.fixedShare * 100}
          decimals={1}
          suffix="%"
          subtitle="Unavoidable portion"
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
              Fixed vs variable charge split
            </h3>
            <p className="text-xs text-zinc-400">
              Only variable charges shrink when you reduce electricity usage.
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

      {/* Plain Language Decoder Cards (Grid) */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-white">
          Item-by-item breakdown in plain words
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Fixed Charge */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-200">
                {COPY.fcTitle}
              </span>
              <Badge variant="violet" className="text-[10px]">
                {COPY.fcBadge} • {formatINR(bill.fixedCharge, 2)}
              </Badge>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {COPY.fcDesc}
            </p>
          </div>

          {/* Energy Charge */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-200">
                {COPY.ecTitle}
              </span>
              <Badge variant="blue" className="text-[10px]">
                {COPY.ecBadge} • {formatINR(bill.energyCharge, 2)}
              </Badge>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {COPY.ecDesc}
            </p>
          </div>

          {/* Fuel Surcharge */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-200">
                {COPY.fsTitle}
              </span>
              <Badge variant="amber" className="text-[10px]">
                {COPY.fsBadge} • {formatINR(bill.fuelSurcharge, 2)}
              </Badge>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {COPY.fsDesc}
            </p>
          </div>

          {/* Auto Recovery */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-200">
                {COPY.fsmTitle}
              </span>
              <Badge variant="amber" className="text-[10px]">
                {COPY.fsmBadge} • {formatINR(bill.autoRecoverySurcharge, 2)}
              </Badge>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {COPY.fsmDesc}
            </p>
          </div>

          {/* Electricity Duty */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-200">
                {COPY.edTitle}
              </span>
              <Badge variant="amber" className="text-[10px]">
                {COPY.edBadge} • {formatINR(bill.electricityDuty, 2)}
              </Badge>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {COPY.edDesc}
            </p>
          </div>

          {/* Other / Round Off */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-200">
                {COPY.otherTitle}
              </span>
              <Badge variant="outline" className="text-[10px]">
                {COPY.otherBadge} • {formatINR(bill.otherCharges + bill.roundOff, 2)}
              </Badge>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {COPY.otherDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-zinc-800">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep(1)}
          className="border-zinc-800 text-zinc-300"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Edit bill figures
        </Button>

        <Button
          type="button"
          size="lg"
          variant="default"
          className="bg-lime-400 text-zinc-950 font-semibold hover:bg-lime-300"
          onClick={() => setStep(3)}
        >
          <span>{COPY.nextAction}</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

