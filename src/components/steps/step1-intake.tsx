"use client";

import React, { useRef, useState } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Camera,
  RefreshCw,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { formatINR } from "@/lib/calc";

export function Step1Intake() {
  const {
    bill,
    setBill,
    setBillField,
    setStep,
    loadSampleBill,
    validationIssues,
    extractionLoading,
    extractionError,
    setExtractionLoading,
    setExtractionError,
  } = useAppStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [showManualForm, setShowManualForm] = useState(true);

  // Group validation issues by field for precise per-field inline feedback
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

  const handleFileUpload = async (file: File) => {
    setExtractionLoading(true);
    setExtractionError(null);
    setShowManualForm(true);

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
        // In case of error, prefill any partial fields if available, otherwise keep current bill
        if (data.partial) {
          setBill({ ...bill, ...data.partial });
        }
        setExtractionError(
          data.error || "Could not read all bill fields automatically. Please review the details below."
        );
      }
    } catch (err: unknown) {
      setExtractionError(
        "Could not connect to extraction service. Please verify or enter details below."
      );
    } finally {
      setExtractionLoading(false);
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 py-6 px-4">
      {/* Header title */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
          Upload or confirm your bill
        </h2>
        <p className="text-sm md:text-base text-zinc-400 max-w-xl mx-auto">
          We estimate your usage without saving your data or images. Upload a KSEB bill photo, enter the figures, or try our sample bill.
        </p>
      </div>

      {/* Top intake action bar: Dropzone, Camera, and Sample Bill */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`col-span-1 md:col-span-2 relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer select-none ${
            dragOver
              ? "border-lime-400 bg-lime-400/5 shadow-[0_0_20px_rgba(163,230,53,0.15)]"
              : "border-zinc-800 bg-[#18181b]/80 hover:border-zinc-700 hover:bg-[#18181b]"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />

          {extractionLoading ? (
            <div className="flex flex-col items-center space-y-3">
              <Loader2 className="w-10 h-10 text-lime-400 animate-spin" />
              <p className="text-sm font-medium text-zinc-200">
                Reading bill fields with Gemini Vision...
              </p>
              <p className="text-xs text-zinc-500">Usually takes 4-8 seconds</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-3 text-center">
              <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-lime-400">
                <Upload className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-zinc-200">
                  <span className="text-lime-400 underline font-semibold">Click to upload</span> or drag and drop bill photo / PDF
                </p>
                <p className="text-xs text-zinc-500">JPEG, PNG, or PDF up to 8MB</p>
              </div>
            </div>
          )}
        </div>

        {/* Quick options: Sample Bill or Camera */}
        <div className="flex flex-col gap-3 justify-center">
          <Button
            type="button"
            variant="default"
            className="w-full h-16 flex flex-col items-center justify-center gap-1 rounded-2xl bg-lime-400 text-zinc-950 font-semibold hover:bg-lime-300"
            onClick={loadSampleBill}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Use sample bill</span>
            </div>
            <span className="text-[11px] font-normal text-zinc-800">
              281 units • ₹1,473 (61 days)
            </span>
          </Button>

          <Button
            type="button"
            variant="secondary"
            className="w-full h-12 rounded-2xl border-zinc-800 text-zinc-300 hover:text-white"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="w-4 h-4 mr-2 text-zinc-400" />
            Take photo
          </Button>
        </div>
      </div>

      {/* Extraction notice / error message */}
      {extractionError && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
          <div className="space-y-1">
            <p className="font-medium text-amber-200">Verification needed</p>
            <p className="text-xs text-amber-300/90">{extractionError}</p>
          </div>
        </div>
      )}

      {/* Editable confirmation form */}
      {showManualForm && (
        <Card className="border-zinc-800 bg-[#18181b]">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Bill figures</h3>
                <p className="text-xs text-zinc-400">
                  Verify or edit amounts as printed on your KSEB bill.
                </p>
              </div>
              <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">
                Bi-monthly / Domestic
              </Badge>
            </div>

            {/* General charges error banner if sum mismatch */}
            {errorMap["charges"] && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3.5 text-xs text-red-300 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <span>{errorMap["charges"][0]}</span>
              </div>
            )}

            {/* Reading dates */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
                Reading period
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="prevReadingDate">Previous reading date</Label>
                  <Input
                    id="prevReadingDate"
                    type="date"
                    value={bill.prevReadingDate}
                    onChange={(e) => setBillField("prevReadingDate", e.target.value)}
                    error={Boolean(errorMap["prevReadingDate"])}
                  />
                  {errorMap["prevReadingDate"] && (
                    <p className="text-xs text-red-400">{errorMap["prevReadingDate"][0]}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="presentReadingDate">Present reading date</Label>
                  <Input
                    id="presentReadingDate"
                    type="date"
                    value={bill.presentReadingDate}
                    onChange={(e) => setBillField("presentReadingDate", e.target.value)}
                    error={Boolean(errorMap["presentReadingDate"])}
                  />
                  {errorMap["presentReadingDate"] && (
                    <p className="text-xs text-red-400">{errorMap["presentReadingDate"][0]}</p>
                  )}
                  {warningMap["presentReadingDate"] && (
                    <p className="text-xs text-amber-400">{warningMap["presentReadingDate"][0]}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Meter readings and units */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
                Meter readings & units
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="prevReading">Previous reading (kWh)</Label>
                  <Input
                    id="prevReading"
                    type="number"
                    value={bill.prevReading || ""}
                    onChange={(e) => setBillField("prevReading", parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="presentReading">Present reading (kWh)</Label>
                  <Input
                    id="presentReading"
                    type="number"
                    value={bill.presentReading || ""}
                    onChange={(e) => setBillField("presentReading", parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="units">Billed units (kWh)</Label>
                  <Input
                    id="units"
                    type="number"
                    value={bill.units || ""}
                    onChange={(e) => setBillField("units", parseFloat(e.target.value) || 0)}
                    error={Boolean(errorMap["units"])}
                  />
                  {errorMap["units"] && (
                    <p className="text-xs text-red-400">{errorMap["units"][0]}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Detailed charges breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
                Itemised charges (₹)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fixedCharge">Fixed charge (FC)</Label>
                  <Input
                    id="fixedCharge"
                    type="number"
                    step="0.01"
                    value={bill.fixedCharge || ""}
                    onChange={(e) => setBillField("fixedCharge", parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="energyCharge">Energy charge (EC)</Label>
                  <Input
                    id="energyCharge"
                    type="number"
                    step="0.01"
                    value={bill.energyCharge || ""}
                    onChange={(e) => setBillField("energyCharge", parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="fuelSurcharge">Fuel surcharge (FS)</Label>
                  <Input
                    id="fuelSurcharge"
                    type="number"
                    step="0.01"
                    value={bill.fuelSurcharge || ""}
                    onChange={(e) => setBillField("fuelSurcharge", parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="autoRecoverySurcharge">Auto recovery (FSM)</Label>
                  <Input
                    id="autoRecoverySurcharge"
                    type="number"
                    step="0.01"
                    value={bill.autoRecoverySurcharge || ""}
                    onChange={(e) => setBillField("autoRecoverySurcharge", parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="electricityDuty">Electricity duty (ED)</Label>
                  <Input
                    id="electricityDuty"
                    type="number"
                    step="0.01"
                    value={bill.electricityDuty || ""}
                    onChange={(e) => setBillField("electricityDuty", parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="roundOff">Round off (±)</Label>
                  <Input
                    id="roundOff"
                    type="number"
                    step="0.01"
                    value={bill.roundOff || ""}
                    onChange={(e) => setBillField("roundOff", parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="otherCharges">Other charges</Label>
                  <Input
                    id="otherCharges"
                    type="number"
                    step="0.01"
                    value={bill.otherCharges || ""}
                    onChange={(e) => setBillField("otherCharges", parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="connectedLoadW">Connected load (Watts, opt.)</Label>
                  <Input
                    id="connectedLoadW"
                    type="number"
                    value={bill.connectedLoadW || ""}
                    onChange={(e) => setBillField("connectedLoadW", parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-1">
                  <Label htmlFor="total" className="text-lime-400 font-semibold">
                    Net amount payable (Total ₹)
                  </Label>
                  <Input
                    id="total"
                    type="number"
                    step="0.01"
                    className="border-lime-500/50 bg-lime-500/5 font-mono text-base font-bold text-lime-300"
                    value={bill.total || ""}
                    onChange={(e) => setBillField("total", parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>

            {/* Looks right button */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-800">
              <div className="text-xs text-zinc-400">
                {hasErrors ? (
                  <span className="text-red-400 font-medium flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> Please resolve errors highlighted in red before proceeding.
                  </span>
                ) : (
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-lime-400" />
                    Readings and charges are mathematically consistent.
                  </span>
                )}
              </div>

              <Button
                type="button"
                size="lg"
                variant="default"
                disabled={hasErrors}
                className="w-full sm:w-auto px-8 bg-lime-400 text-zinc-950 font-semibold hover:bg-lime-300"
                onClick={() => setStep(2)}
              >
                <span>Looks right</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
