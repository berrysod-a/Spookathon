"use client";

import React, { useRef, useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { useT } from "@/i18n";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Camera,
  ImagePlus,
  CheckCircle2,
  AlertTriangle,
  Pencil,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { formatINR } from "@/lib/calc";

type View = "upload" | "form";

export function Step1Intake() {
  const {
    bill,
    setBill,
    setBillField,
    setStep,
    isCustomBill,
    validationIssues,
    extractionLoading,
    extractionError,
    setExtractionLoading,
    setExtractionError,
  } = useAppStore();

  const t = useT();

  // C4: start on form if a bill has already been loaded (demo link sets isCustomBill = true)
  const [view, setView] = useState<View>(isCustomBill ? "form" : "upload");
  useEffect(() => {
    if (isCustomBill) setView("form");
  }, [isCustomBill]);

  // C2: separate refs for camera vs gallery
  const photoRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  // Per-field error / warning maps
  const errorMap: Record<string, string[]> = {};
  const warningMap: Record<string, string[]> = {};
  validationIssues.forEach((issue) => {
    if (issue.severity === "error") {
      errorMap[issue.field] = errorMap[issue.field] || [];
      errorMap[issue.field].push(issue.message);
    } else {
      warningMap[issue.field] = warningMap[issue.field] || [];
      warningMap[issue.field].push(issue.message);
    }
  });

  const hasErrors = validationIssues.some((i) => i.severity === "error");

  // ── File upload / extraction ─────────────────────────────────────────────
  const handleFile = async (file: File) => {
    setExtractionLoading(true);
    setExtractionError(null);
    setView("form");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/extract-bill", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.bill) {
        setBill(data.bill);
      } else {
        if (data.partial) setBill({ ...bill, ...data.partial });
        setExtractionError(data.error || t("s1.err.generic"));
      }
    } catch {
      setExtractionError(t("s1.err.connect"));
    } finally {
      setExtractionLoading(false);
    }
  };

  // ── Upload panel (C2) ────────────────────────────────────────────────────
  if (view === "upload") {
    return (
      <div className="w-full max-w-lg mx-auto py-16 px-4 flex flex-col items-center gap-8 text-center">
        {/* Hidden file inputs */}
        <input
          ref={photoRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <input
          ref={galleryRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {/* Icon */}
        <div className="w-20 h-20 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-lime-400 shadow-[0_0_30px_rgba(163,230,53,0.08)]">
          <Camera className="w-9 h-9" />
        </div>

        {/* Primary: Take photo (C2) */}
        <div className="w-full flex flex-col gap-3">
          <button
            type="button"
            onClick={() => photoRef.current?.click()}
            className="w-full rounded-2xl bg-lime-400 py-4 text-base font-semibold text-zinc-950 flex items-center justify-center gap-3 transition-all hover:bg-lime-300 hover:shadow-[0_0_25px_rgba(163,230,53,0.35)] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime-300 select-none"
            aria-label={t("s1.photo")}
          >
            <Camera className="w-5 h-5" />
            {t("s1.photo")}
          </button>

          {/* Secondary: Choose from gallery (C2) */}
          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/80 py-3.5 text-sm font-medium text-zinc-300 flex items-center justify-center gap-2.5 transition-colors hover:bg-zinc-800 hover:text-white hover:border-zinc-700 select-none"
            aria-label={t("s1.gallery")}
          >
            <ImagePlus className="w-4 h-4 text-zinc-400" />
            {t("s1.gallery")}
          </button>

          {/* Tertiary: Enter manually (C2) */}
          <button
            type="button"
            onClick={() => setView("form")}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors py-2 select-none"
          >
            {t("s1.manual")}
          </button>
        </div>

        <p className="text-[11px] text-zinc-600">{t("s1.formats")}</p>
      </div>
    );
  }

  // ── Loading state ────────────────────────────────────────────────────────
  if (extractionLoading) {
    return (
      <div className="w-full max-w-lg mx-auto py-20 px-4 flex flex-col items-center gap-5 text-center">
        <Loader2 className="w-12 h-12 text-lime-400 animate-spin" />
        <p className="text-base font-medium text-zinc-200">{t("s1.loading")}</p>
        <p className="text-xs text-zinc-500">{t("s1.loading.sub")}</p>
      </div>
    );
  }

  // ── Form view: C4 friendly confirm screen ────────────────────────────────
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 py-6 px-4">
      {/* C4: Title + subtitle — replaces the generic warning banner */}
      <div className="space-y-1">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
          {t("s1.title")}
        </h2>
        <p className="text-sm text-zinc-400">{t("s1.sub")}</p>
      </div>

      {/* Extraction error: specific, no generic "Verification needed" */}
      {extractionError && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
          <p className="text-xs text-amber-300/90">{extractionError}</p>
        </div>
      )}

      {/* Bill details card */}
      <Card className="border-zinc-800 bg-[#18181b]">
        <CardContent className="p-6 space-y-6">
          {/* Header row */}
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Pencil className="w-3.5 h-3.5 text-zinc-500" />
              <span>Tap any field to edit</span>
            </div>
            <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">
              {t("s1.badge")}
            </Badge>
          </div>

          {/* Charges sum mismatch: field-level, not a generic banner */}
          {errorMap["charges"] && (
            <FieldError message={errorMap["charges"][0]} />
          )}

          {/* ── Reading period ─────────────────────────────────────────── */}
          <SectionLabel>{t("s1.section.period")}</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <EditableField
              id="prevReadingDate"
              label={t("s1.field.prevDate")}
              type="date"
              value={bill.prevReadingDate}
              onChange={(v) => setBillField("prevReadingDate", v)}
              error={errorMap["prevReadingDate"]?.[0]}
            />
            <EditableField
              id="presentReadingDate"
              label={t("s1.field.presentDate")}
              type="date"
              value={bill.presentReadingDate}
              onChange={(v) => setBillField("presentReadingDate", v)}
              error={errorMap["presentReadingDate"]?.[0]}
              warning={warningMap["presentReadingDate"]?.[0]}
            />
          </div>

          {/* ── Meter readings & units ─────────────────────────────────── */}
          <SectionLabel>{t("s1.section.readings")}</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <EditableField
              id="prevReading"
              label={t("s1.field.prevReading")}
              type="number"
              value={bill.prevReading || ""}
              onChange={(v) => setBillField("prevReading", parseFloat(v) || 0)}
            />
            <EditableField
              id="presentReading"
              label={t("s1.field.presentReading")}
              type="number"
              value={bill.presentReading || ""}
              onChange={(v) => setBillField("presentReading", parseFloat(v) || 0)}
            />
            <EditableField
              id="units"
              label={t("s1.field.units")}
              type="number"
              value={bill.units || ""}
              onChange={(v) => setBillField("units", parseFloat(v) || 0)}
              error={errorMap["units"]?.[0]}
            />
          </div>

          {/* ── Itemised charges ───────────────────────────────────────── */}
          <SectionLabel>{t("s1.section.charges")}</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <EditableField
              id="fixedCharge"
              label={t("s1.field.fc")}
              type="number"
              step="0.01"
              value={bill.fixedCharge || ""}
              onChange={(v) => setBillField("fixedCharge", parseFloat(v) || 0)}
            />
            <EditableField
              id="energyCharge"
              label={t("s1.field.ec")}
              type="number"
              step="0.01"
              value={bill.energyCharge || ""}
              onChange={(v) => setBillField("energyCharge", parseFloat(v) || 0)}
            />
            <EditableField
              id="fuelSurcharge"
              label={t("s1.field.fs")}
              type="number"
              step="0.01"
              value={bill.fuelSurcharge || ""}
              onChange={(v) => setBillField("fuelSurcharge", parseFloat(v) || 0)}
            />
            <EditableField
              id="autoRecoverySurcharge"
              label={t("s1.field.fsm")}
              type="number"
              step="0.01"
              value={bill.autoRecoverySurcharge || ""}
              onChange={(v) => setBillField("autoRecoverySurcharge", parseFloat(v) || 0)}
            />
            <EditableField
              id="electricityDuty"
              label={t("s1.field.ed")}
              type="number"
              step="0.01"
              value={bill.electricityDuty || ""}
              onChange={(v) => setBillField("electricityDuty", parseFloat(v) || 0)}
            />
            <EditableField
              id="roundOff"
              label={t("s1.field.roundOff")}
              type="number"
              step="0.01"
              value={bill.roundOff || ""}
              onChange={(v) => setBillField("roundOff", parseFloat(v) || 0)}
            />
            <EditableField
              id="otherCharges"
              label={t("s1.field.other")}
              type="number"
              step="0.01"
              value={bill.otherCharges || ""}
              onChange={(v) => setBillField("otherCharges", parseFloat(v) || 0)}
            />
            <EditableField
              id="connectedLoadW"
              label={t("s1.field.load")}
              type="number"
              value={bill.connectedLoadW || ""}
              onChange={(v) => setBillField("connectedLoadW", parseFloat(v) || 0)}
            />
            {/* Total — highlighted */}
            <div className="space-y-1.5">
              <Label htmlFor="total" className="text-lime-400 font-semibold text-xs">
                {t("s1.field.total")}
              </Label>
              <div className="relative">
                <Pencil className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-lime-500/60 pointer-events-none" />
                <Input
                  id="total"
                  type="number"
                  step="0.01"
                  className="pl-8 border-lime-500/50 bg-lime-500/5 font-mono text-base font-bold text-lime-300"
                  value={bill.total || ""}
                  onChange={(e) => setBillField("total", parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          {/* ── Status + CTA ───────────────────────────────────────────── */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-800">
            {/* C4: green "Everything adds up" or specific red warning */}
            <div className="text-xs">
              {hasErrors ? (
                <span className="text-red-400 font-medium flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  {t("s1.hasErrors")}
                </span>
              ) : (
                <span className="text-lime-400 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  {t("s1.allGood")}
                </span>
              )}
            </div>

            {/* C4: "Confirm and continue" replaces "Looks right" */}
            <button
              type="button"
              disabled={hasErrors}
              onClick={() => setStep(2)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-lime-400 px-8 py-3 text-sm font-semibold text-zinc-950 transition-all hover:bg-lime-300 hover:shadow-[0_0_20px_rgba(163,230,53,0.3)] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime-300 select-none"
              aria-disabled={hasErrors}
            >
              {t("s1.confirm")}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Back to upload */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => setView("upload")}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Upload a different photo
        </button>
      </div>
    </div>
  );
}

// ── Small shared sub-components ──────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mt-1">
      {children}
    </h4>
  );
}

interface EditableFieldProps {
  id: string;
  label: string;
  type?: string;
  step?: string;
  value: string | number;
  onChange: (value: string) => void;
  error?: string;
  warning?: string;
}

function EditableField({
  id,
  label,
  type = "text",
  step,
  value,
  onChange,
  error,
  warning,
}: EditableFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-zinc-400">
        {label}
      </Label>
      <div className="relative">
        <Pencil className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-600 pointer-events-none" />
        <Input
          id={id}
          type={type}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`pl-8 ${error ? "border-red-500/60 bg-red-500/5 text-red-300 focus-visible:ring-red-500/40" : ""}`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : warning ? `${id}-warn` : undefined}
        />
      </div>
      {error && (
        <FieldError id={`${id}-error`} message={error} />
      )}
      {!error && warning && (
        <p id={`${id}-warn`} className="text-xs text-amber-400">{warning}</p>
      )}
    </div>
  );
}

function FieldError({ id, message }: { id?: string; message: string }) {
  return (
    <p id={id} className="text-xs text-red-400 flex items-start gap-1.5" role="alert">
      <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
      {message}
    </p>
  );
}
