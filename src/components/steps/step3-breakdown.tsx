"use client";

import React, { useState, useRef, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import { APPLIANCES, APPLIANCE_BY_ID } from "@/data/appliances";
import { APPLIANCE_META } from "@/data/applianceMeta";
import { computeBreakdown, billMetrics, formatINR } from "@/lib/calc";
import {
  entriesToExtras,
  estimateEntry,
  defaultUsageFor,
  uniformUsage,
  clampUsage,
  weeklyAvgHoursPerDay,
  dayHours,
  resolveDef,
  efficiencyCheck,
  usageByBlock,
  weeklyProfile,
  type ApplianceEntry,
  type WeeklyUsage,
  type EfficiencyInput,
} from "@/lib/schedule";
import { BLOCK_IDS, TIME_BLOCKS, type BlockId } from "@/data/timeBlocks";
import { BreakdownRanges } from "@/components/charts/breakdown-ranges";
import { UsageBlockChart } from "@/components/charts/usage-block-chart";
import { WeeklyChart } from "@/components/charts/weekly-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useT } from "@/i18n";
import {
  Fan, Lightbulb, Lamp, Tv, Router, WashingMachine, AirVent, Flame,
  Droplets, CookingPot, Shirt, Laptop, BatteryCharging, BatteryFull,
  Refrigerator, Zap, Plus, Minus, Trash2, ArrowRight,
  Search, Settings2, Plug, Sparkles, HelpCircle,
} from "lucide-react";

// ── Icon map ──────────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  Fan, Lightbulb, Lamp, Tv, Router, WashingMachine, AirVent, Flame,
  Droplets, CookingPot, Shirt, Laptop, BatteryCharging, BatteryFull,
  Refrigerator, Zap, Plug, Satellite: Router,
};

function AppIcon({ icon, className }: { icon: string; className?: string }) {
  const I = ICON_MAP[icon] || Zap;
  return <I className={className} />;
}

// ── UID generator ─────────────────────────────────────────────────────────────
let _uid = 0;
function nextUid() { return `entry-${Date.now()}-${_uid++}`; }

// ── Time-block usage editor ────────────────────────────────────────────────────

interface UsageEditorProps {
  usage: WeeklyUsage;
  alwaysOn?: boolean;
  onChange: (u: WeeklyUsage) => void;
}

function UsageEditor({ usage, alwaysOn, onChange }: UsageEditorProps) {
  const t = useT();
  const [sameEveryDay, setSameEveryDay] = useState(
    () => JSON.stringify(usage.weekday) === JSON.stringify(usage.weekend),
  );
  const [activeDay, setActiveDay] = useState<"weekday" | "weekend">("weekday");

  const handleBlockChange = (blockId: BlockId, val: number) => {
    const block = TIME_BLOCKS.find((b) => b.id === blockId)!;
    const clamped = Math.max(0, Math.min(block.hours, val));
    if (sameEveryDay) {
      const next = clampUsage({ weekday: { ...usage.weekday, [blockId]: clamped }, weekend: { ...usage.weekend, [blockId]: clamped } });
      onChange(next);
    } else {
      const dayMap = activeDay === "weekday" ? usage.weekday : usage.weekend;
      const next = clampUsage({ ...usage, [activeDay]: { ...dayMap, [blockId]: clamped } });
      onChange(next);
    }
  };

  const toggleSameEveryDay = () => {
    if (!sameEveryDay) {
      onChange(uniformUsage(usage.weekday));
    }
    setSameEveryDay(!sameEveryDay);
  };

  const dayMap = activeDay === "weekday" ? usage.weekday : usage.weekend;
  const totalHours = dayHours(sameEveryDay ? usage.weekday : dayMap);
  const overLimit = totalHours > 24;
  const avg = weeklyAvgHoursPerDay(usage);

  return (
    <div className="pt-3 mt-3 border-t border-zinc-800 space-y-3">
      {/* Day toggle + same-every-day */}
      {!alwaysOn && (
        <div className="flex items-center justify-between">
          <div className="flex rounded-lg overflow-hidden border border-zinc-800 text-xs">
            {(["weekday", "weekend"] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => { setSameEveryDay(false); setActiveDay(d); }}
                className={`px-3 py-1.5 transition-colors ${
                  (!sameEveryDay && activeDay === d) || sameEveryDay
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {t(d === "weekday" ? "s3.weekday" : "s3.weekend")}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-400">
            <input
              type="checkbox"
              checked={sameEveryDay}
              onChange={toggleSameEveryDay}
              className="rounded border-zinc-600 bg-zinc-800 text-lime-400 focus:ring-lime-400"
            />
            {t("s3.sameEveryDay")}
          </label>
        </div>
      )}

      {/* Block chips */}
      <div className="space-y-2">
        {TIME_BLOCKS.map((block) => {
          const val = (sameEveryDay ? usage.weekday[block.id] : dayMap[block.id]) ?? 0;
          const isPeak = block.zone === "peak";
          return (
            <div key={block.id} className="flex items-center gap-3">
              <span className={`text-[11px] w-28 shrink-0 ${isPeak ? "text-amber-400 font-semibold" : "text-zinc-400"}`}>
                {t(`block.${block.id}` as Parameters<typeof t>[0])}
                {isPeak && <span className="ml-1 text-[9px] bg-amber-900/40 text-amber-400 px-1 py-0.5 rounded">peak</span>}
              </span>
              <div className="flex items-center gap-2 flex-1">
                <button
                  type="button"
                  onClick={() => handleBlockChange(block.id, val - 0.5)}
                  disabled={val <= 0}
                  className="h-6 w-6 rounded-md flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 shrink-0"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="number"
                  min={0}
                  max={block.hours}
                  step={0.5}
                  value={val}
                  onChange={(e) => handleBlockChange(block.id, parseFloat(e.target.value) || 0)}
                  className="w-14 text-center text-xs font-mono bg-zinc-900 border border-zinc-700 rounded-md py-1 text-white focus:outline-none focus:border-lime-500"
                />
                <button
                  type="button"
                  onClick={() => handleBlockChange(block.id, val + 0.5)}
                  disabled={val >= block.hours}
                  className="h-6 w-6 rounded-md flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 shrink-0"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isPeak ? "bg-amber-400" : "bg-lime-500"}`}
                    style={{ width: `${Math.min(100, (val / block.hours) * 100)}%` }}
                  />
                </div>
                <span className="text-[11px] font-mono text-zinc-500 shrink-0 w-8 text-right">{val}h</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary row */}
      <div className={`flex items-center justify-between text-xs ${overLimit ? "text-red-400" : "text-zinc-400"}`}>
        {overLimit
          ? <span>{t("s3.hours.warn")}</span>
          : <span>Avg {avg.toFixed(1)} h/day over the week</span>
        }
      </div>
    </div>
  );
}

// ── C10: Efficiency Disclosure Editor ─────────────────────────────────────────

interface EfficiencyEditorProps {
  entry: ApplianceEntry;
  marginalRate: number;
  onChange: (patch: EfficiencyInput) => void;
}

function EfficiencyEditor({ entry, marginalRate, onChange }: EfficiencyEditorProps) {
  const t = useT();
  const eff = entry.efficiency ?? {};
  const meta = APPLIANCE_META[entry.defId];
  const isFridge = meta?.category === "fridge";
  const result = efficiencyCheck(entry, marginalRate);

  const update = (key: keyof EfficiencyInput, val: unknown) => {
    onChange({ ...eff, [key]: val });
  };

  return (
    <div className="pt-3 mt-3 border-t border-zinc-800 space-y-4 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-zinc-200">
          {t("s3.efficiency")} details
        </span>
        {result && (
          <Badge
            variant="outline"
            className={`text-[10px] ${
              result.confidence === "label"
                ? "border-lime-500/40 text-lime-400 bg-lime-950/20"
                : "border-zinc-700 text-zinc-400"
            }`}
          >
            {result.confidence === "label" ? t("eff.labelBased") : t("eff.roughEst")}
          </Badge>
        )}
      </div>

      {/* Inputs grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Age */}
        <div>
          <label className="text-zinc-400 block mb-1 flex items-center justify-between">
            <span>{t("eff.age")}</span>
            <span className="text-[10px] text-zinc-500">ASSUMPTION</span>
          </label>
          <input
            type="number"
            min={0}
            max={30}
            value={eff.ageYears ?? ""}
            placeholder="e.g. 5"
            onChange={(e) => update("ageYears", e.target.value === "" ? undefined : parseInt(e.target.value))}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-white font-mono outline-none focus:border-lime-500"
          />
        </div>

        {/* Stars (only if category has BEE stars) */}
        {meta?.hasStarLabel && (
          <div>
            <label className="text-zinc-400 block mb-1 flex items-center justify-between">
              <span>{t("eff.stars")}</span>
              <span className="text-[10px] text-zinc-500">ASSUMPTION</span>
            </label>
            <select
              value={eff.stars ?? ""}
              onChange={(e) => update("stars", e.target.value === "" ? undefined : parseInt(e.target.value))}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-lime-500"
            >
              <option value="">Unrated / Don&apos;t know</option>
              <option value="1">1 Star</option>
              <option value="2">2 Stars</option>
              <option value="3">3 Stars</option>
              <option value="4">4 Stars</option>
              <option value="5">5 Stars</option>
            </select>
          </div>
        )}

        {/* Fridge specific: Capacity & Type */}
        {isFridge && (
          <>
            <div>
              <label className="text-zinc-400 block mb-1">{t("eff.capacity")}</label>
              <input
                type="number"
                min={50}
                max={800}
                value={eff.capacityLitres ?? ""}
                placeholder="e.g. 250"
                onChange={(e) => update("capacityLitres", e.target.value === "" ? undefined : parseInt(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-white font-mono outline-none focus:border-lime-500"
              />
            </div>
            <div>
              <label className="text-zinc-400 block mb-1">{t("eff.type")}</label>
              <select
                value={eff.fridgeType ?? "frost-free"}
                onChange={(e) => update("fridgeType", e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-lime-500"
              >
                <option value="frost-free">{t("eff.type.ff")}</option>
                <option value="direct-cool">{t("eff.type.dc")}</option>
              </select>
            </div>
          </>
        )}

        {/* Nameplate Watts */}
        <div>
          <label className="text-zinc-400 block mb-1">{t("eff.nameplate")}</label>
          <input
            type="number"
            min={1}
            value={eff.nameplateWatts ?? ""}
            placeholder="From rear sticker"
            onChange={(e) => update("nameplateWatts", e.target.value === "" ? undefined : parseInt(e.target.value))}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-white font-mono outline-none focus:border-lime-500"
          />
        </div>

        {/* BEE Label kWh/year */}
        <div>
          <label className="text-zinc-400 block mb-1">{t("eff.labelKwh")}</label>
          <input
            type="number"
            min={10}
            value={eff.labelKwhPerYear ?? ""}
            placeholder="From star sticker"
            onChange={(e) => update("labelKwhPerYear", e.target.value === "" ? undefined : parseInt(e.target.value))}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-white font-mono outline-none focus:border-lime-500"
          />
        </div>

        {/* Replacement Price */}
        <div>
          <label className="text-zinc-400 block mb-1">{t("eff.price")}</label>
          <input
            type="number"
            min={0}
            step={500}
            value={eff.replacementPrice ?? meta?.defaultReplacementPrice ?? ""}
            placeholder="e.g. 25000"
            onChange={(e) => update("replacementPrice", e.target.value === "" ? undefined : parseInt(e.target.value))}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-white font-mono outline-none focus:border-lime-500"
          />
        </div>
      </div>

      {/* Fridge Fix-first ladder (C10) */}
      {isFridge && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3 space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-lime-400 text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t("eff.fridge.title")} (free actions before replacing)</span>
          </div>
          <ul className="space-y-1 text-[11px] text-zinc-300 list-disc list-inside">
            <li>{t("eff.fridge.seal")}</li>
            <li>{t("eff.fridge.defrost")}</li>
            <li>{t("eff.fridge.gap")}</li>
            <li>{t("eff.fridge.temp")}</li>
          </ul>
        </div>
      )}

      {/* Comparison results */}
      {result && (
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3 space-y-2 font-mono text-[11px]">
          <div className="flex items-center justify-between text-zinc-400">
            <span>{t("eff.current")}:</span>
            <span className="text-white font-bold">~{result.currentAnnualKwh.typ.toFixed(0)} kWh/yr</span>
          </div>
          <div className="flex items-center justify-between text-zinc-400">
            <span>{t("eff.modern")}:</span>
            <span className="text-lime-400 font-bold">~{result.modernAnnualKwh.typ.toFixed(0)} kWh/yr</span>
          </div>
          <div className="flex items-center justify-between text-zinc-400 pt-1 border-t border-zinc-800">
            <span>{t("eff.saving")}:</span>
            <span className="text-lime-400 font-bold">~{formatINR(result.annualSavingRupees.typ)} / yr</span>
          </div>
          {result.paybackYears && (
            <div className="flex items-center justify-between text-zinc-400">
              <span>{t("eff.payback")}:</span>
              <span className="text-white font-bold">~{result.paybackYears.typ.toFixed(1)} yrs</span>
            </div>
          )}
          <div className="flex items-center justify-between pt-1 border-t border-zinc-800 font-sans">
            <span className="text-zinc-400">Verdict:</span>
            <Badge
              variant={
                result.verdict === "worth-it"
                  ? "lime"
                  : result.verdict === "borderline"
                  ? "amber"
                  : "outline"
              }
              className="text-[10px]"
            >
              {result.verdict === "worth-it"
                ? t("eff.verdict.worthIt")
                : result.verdict === "borderline"
                ? t("eff.verdict.borderline")
                : result.verdict === "fix-first"
                ? t("eff.verdict.fixFirst")
                : t("eff.verdict.noSaving")}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Add appliance modal/panel ─────────────────────────────────────────────────

interface AddAppliancePanelProps {
  onAdd: (entry: ApplianceEntry) => void;
  onClose: () => void;
}

function AddAppliancePanel({ onAdd, onClose }: AddAppliancePanelProps) {
  const t = useT();
  const [query, setQuery] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customWatts, setCustomWatts] = useState(100);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = APPLIANCES.filter(
    (a) => !query || a.name.toLowerCase().includes(query.toLowerCase()),
  );

  const addDef = (defId: string, name: string) => {
    const def = APPLIANCE_BY_ID[defId];
    if (!def) return;
    onAdd({
      uid: nextUid(),
      defId,
      name,
      qty: 1,
      usage: defaultUsageFor(defId, def.defaultHours),
    });
    onClose();
  };

  const addCustom = () => {
    if (!customName.trim()) return;
    const w = Math.max(1, customWatts);
    onAdd({
      uid: nextUid(),
      defId: "custom",
      name: customName.trim(),
      qty: 1,
      usage: defaultUsageFor("custom"),
      custom: {
        watts: { low: w * 0.8, typ: w, high: w * 1.2 },
        duty: { low: 1, typ: 1, high: 1 },
        hoursUncertainty: 0.3,
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-5 space-y-4 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">{t("s3.add")}</h3>
          <button type="button" onClick={onClose} className="text-zinc-400 hover:text-white text-xl leading-none">&times;</button>
        </div>

        {!showCustom ? (
          <>
            {/* Search */}
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-zinc-500 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search appliances…"
                autoFocus
                className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 outline-none"
              />
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1 space-y-1 min-h-0">
              {filtered.map((app) => (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => addDef(app.id, app.name)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-800 transition-colors text-left"
                >
                  <div className="p-2 rounded-lg bg-zinc-800 border border-zinc-700">
                    <AppIcon icon={app.icon} className="w-4 h-4 text-lime-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{app.name}</p>
                    <p className="text-[11px] text-zinc-500 font-mono">{app.watts.typ}W typical</p>
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-sm text-zinc-400 text-center py-4">No match — try a custom appliance</p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowCustom(true)}
              className="w-full flex items-center gap-2 text-sm text-lime-400 hover:text-lime-300 justify-center py-2 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t("s3.add.custom")}
            </button>
          </>
        ) : (
          <>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Appliance name</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Aquaguard RO"
                  autoFocus
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-lime-500"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Typical running watts (nameplate or estimate)</label>
                <input
                  type="number"
                  min={1}
                  value={customWatts}
                  onChange={(e) => setCustomWatts(parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-lime-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowCustom(false)} className="flex-1 py-2 rounded-xl border border-zinc-700 text-sm text-zinc-300 hover:text-white">
                Back
              </button>
              <button
                type="button"
                onClick={addCustom}
                disabled={!customName.trim()}
                className="flex-1 py-2 rounded-xl bg-lime-400 text-zinc-950 text-sm font-semibold hover:bg-lime-300 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Appliance row ──────────────────────────────────────────────────────────────

interface ApplianceRowProps {
  entry: ApplianceEntry;
  days: number;
  marginalRate: number;
  onUpdate: (patch: Partial<ApplianceEntry>) => void;
  onRemove: () => void;
}

function ApplianceRow({ entry, days, marginalRate, onUpdate, onRemove }: ApplianceRowProps) {
  const t = useT();
  const [showUsage, setShowUsage] = useState(false);
  const [showEfficiency, setShowEfficiency] = useState(false);

  const def = resolveDef(entry);
  const Icon = ICON_MAP[def.icon] || Zap;
  const units = estimateEntry(entry, days);
  const avg = weeklyAvgHoursPerDay(entry.usage);

  const changeQty = (delta: number) => {
    const next = Math.max(0, entry.qty + delta);
    if (next === 0) { onRemove(); } else { onUpdate({ qty: next }); }
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-0 transition-all">
      {/* Row header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-zinc-800 border border-zinc-700 shrink-0">
          <Icon className="w-4 h-4 text-lime-400" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{entry.name}</p>
          <p className="text-[11px] text-zinc-500 font-mono">
            ~{def.watts.typ}W · {avg.toFixed(1)} h/day avg · <span className="text-lime-400">{units.typ.toFixed(0)} units</span>
            <Badge variant="outline" className="ml-1.5 text-[9px] px-1 py-0 border-zinc-700 text-zinc-500">Estimate</Badge>
          </p>
        </div>

        {/* Qty stepper */}
        <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 rounded-xl px-1 py-1 shrink-0">
          <button
            type="button"
            onClick={() => changeQty(-1)}
            className="h-7 w-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-6 text-center text-xs font-mono font-bold text-white">{entry.qty}</span>
          <button
            type="button"
            onClick={() => changeQty(+1)}
            className="h-7 w-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Usage toggle */}
        <button
          type="button"
          onClick={() => { setShowUsage(!showUsage); setShowEfficiency(false); }}
          title={t("s3.usage")}
          className={`h-8 px-2 rounded-lg flex items-center gap-1 text-xs transition-colors shrink-0 ${
            showUsage
              ? "bg-lime-400/20 text-lime-400 border border-lime-500/30"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800"
          }`}
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Hours</span>
        </button>

        {/* Efficiency toggle (C10) */}
        <button
          type="button"
          onClick={() => { setShowEfficiency(!showEfficiency); setShowUsage(false); }}
          title={t("s3.efficiency")}
          className={`h-8 px-2 rounded-lg flex items-center gap-1 text-xs transition-colors shrink-0 ${
            showEfficiency
              ? "bg-lime-400/20 text-lime-400 border border-lime-500/30"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Efficiency</span>
        </button>

        {/* Remove */}
        <button
          type="button"
          onClick={onRemove}
          title={t("s3.remove")}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-950/30 shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Usage editor (collapsible) */}
      {showUsage && (
        <UsageEditor
          usage={entry.usage}
          alwaysOn={def.alwaysOn}
          onChange={(u) => onUpdate({ usage: u })}
        />
      )}

      {/* Efficiency editor (C10) */}
      {showEfficiency && (
        <EfficiencyEditor
          entry={entry}
          marginalRate={marginalRate}
          onChange={(patch) => onUpdate({ efficiency: patch })}
        />
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function Step3Breakdown() {
  const t = useT();
  const { bill, entries, addEntry, removeEntry, updateEntry, setStep } = useAppStore();

  const m = billMetrics(bill);
  const breakdown = computeBreakdown(bill, m, [], entriesToExtras(entries, m.days));
  const blockData = usageByBlock(entries, bill, m);
  const profileData = weeklyProfile(entries);

  const [showAddPanel, setShowAddPanel] = useState(false);
  const [undoEntry, setUndoEntry] = useState<{ entry: ApplianceEntry; timer: ReturnType<typeof setTimeout> } | null>(null);

  const handleRemove = useCallback((entry: ApplianceEntry) => {
    removeEntry(entry.uid);
    if (undoEntry) {
      clearTimeout(undoEntry.timer);
    }
    const timer = setTimeout(() => setUndoEntry(null), 5000);
    setUndoEntry({ entry, timer });
  }, [removeEntry, undoEntry]);

  const handleUndo = () => {
    if (!undoEntry) return;
    clearTimeout(undoEntry.timer);
    addEntry(undoEntry.entry);
    setUndoEntry(null);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 py-6 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">{t("s3.title")}</h2>
          <p className="text-sm text-zinc-400 mt-1">{t("s3.sub")}</p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => setShowAddPanel(true)}
          className="bg-lime-400 text-zinc-950 font-semibold hover:bg-lime-300 shrink-0"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          {t("s3.add")}
        </Button>
      </div>

      {/* Breakdown chart */}
      <Card className="border-zinc-800 bg-[#18181b]">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">{t("s3.breakdown.title")}</h3>
            <span className="text-xs font-mono text-zinc-400">
              {bill.units} units · {formatINR(bill.total)}
            </span>
          </div>
          <BreakdownRanges breakdown={breakdown} billUnits={bill.units} />
        </CardContent>
      </Card>

      {/* Appliance list */}
      <div className="space-y-3">
        {entries.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-dashed border-zinc-800">
            <Zap className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
            <p className="text-sm text-zinc-400">{t("s3.empty")}</p>
            <button
              type="button"
              onClick={() => setShowAddPanel(true)}
              className="mt-4 text-sm text-lime-400 hover:text-lime-300 underline underline-offset-2"
            >
              {t("s3.add")}
            </button>
          </div>
        ) : (
          entries.map((entry) => (
            <ApplianceRow
              key={entry.uid}
              entry={entry}
              days={m.days}
              marginalRate={m.marginalRate}
              onUpdate={(patch) => updateEntry(entry.uid, patch)}
              onRemove={() => handleRemove(entry)}
            />
          ))
        )}
      </div>

      {/* C11: 24-hour block chart + Weekly profile chart */}
      {entries.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-zinc-800 bg-[#18181b]">
            <CardContent className="p-5">
              <UsageBlockChart data={blockData} />
            </CardContent>
          </Card>
          <Card className="border-zinc-800 bg-[#18181b]">
            <CardContent className="p-5">
              <WeeklyChart profile={profileData} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Undo toast */}
      {undoEntry && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3 shadow-2xl text-sm text-white">
          <span>{t("s3.removed").replace("{name}", undoEntry.entry.name)}</span>
          <button
            type="button"
            onClick={handleUndo}
            className="text-lime-400 font-semibold hover:text-lime-300"
          >
            {t("s3.undo")}
          </button>
        </div>
      )}

      {/* Add appliance modal */}
      {showAddPanel && (
        <AddAppliancePanel
          onAdd={addEntry}
          onClose={() => setShowAddPanel(false)}
        />
      )}

      {/* Navigation */}
      <div className="flex items-center justify-end pt-6 border-t border-zinc-800">
        <Button
          type="button"
          size="lg"
          className="bg-lime-400 text-zinc-950 font-semibold hover:bg-lime-300"
          onClick={() => setStep(4)}
        >
          {t("s3.next")}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
