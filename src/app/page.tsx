"use client";

import React, { useRef, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { LandingHero } from "@/components/landing/landing-hero";
import { StepStepper } from "@/components/steps/step-stepper";
import { Step1Intake } from "@/components/steps/step1-intake";
import { Step2Decode } from "@/components/steps/step2-decode";
import { Step3Breakdown } from "@/components/steps/step3-breakdown";
import { Step4Plan } from "@/components/steps/step4-plan";
import { Zap, ShieldCheck } from "lucide-react";
import { useT } from "@/i18n";

export default function HomePage() {
  const { step, loadDemo } = useAppStore();
  const flowRef = useRef<HTMLDivElement>(null);
  const t = useT();

  // C3: Hidden demo link — /?demo=<token> loads SAMPLE_BILL + DEMO_ENTRIES.
  // No visible button, link or text mentions this; nothing is logged.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("demo");
    if (!token) return;
    const expected =
      process.env.NEXT_PUBLIC_DEMO_TOKEN ?? "ksb26";
    if (token === expected) {
      loadDemo();
      flowRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    // Always remove the param from the address bar regardless of match
    history.replaceState({}, "", "/");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollToFlow = () => {
    flowRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col justify-between selection:bg-lime-400 selection:text-zinc-950">
      {/* 1. Kinetic Hero with Scroll Reveal */}
      <LandingHero onStart={scrollToFlow} />

      {/* 2. Main App Workflow Section */}
      <section
        ref={flowRef}
        id="app-flow"
        className="relative z-20 min-h-screen border-t border-zinc-800/80 bg-[#09090b] pt-8 pb-20"
      >
        {/* Sticky App Header — C1: no "Sample bill" button */}
        <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-[#09090b]/90 backdrop-blur-md px-4 py-3">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-lime-400 flex items-center justify-center text-zinc-950 font-black shadow-[0_0_15px_rgba(163,230,53,0.3)]">
                <Zap className="w-5 h-5 fill-zinc-950" />
              </div>
              <div>
                <span className="font-bold tracking-tight text-white text-base">
                  {t("app.name")}
                </span>
                <span className="hidden sm:inline-block text-[11px] font-mono text-zinc-500 ml-2">
                  {t("app.tagline")}
                </span>
              </div>
            </div>
            {/* No sample-bill button (C1) — header is clean */}
          </div>
        </header>

        {/* Step Indicator Stepper */}
        <div className="py-6">
          <StepStepper />
        </div>

        {/* Active Step Content */}
        <div className="transition-opacity duration-300">
          {step === 1 && <Step1Intake />}
          {step === 2 && <Step2Decode />}
          {step === 3 && <Step3Breakdown />}
          {step === 4 && <Step4Plan />}
        </div>
      </section>

      {/* 3. Footer */}
      <footer className="border-t border-zinc-800 bg-[#09090b] text-zinc-500 text-xs py-10 px-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-zinc-400 font-semibold">
              <ShieldCheck className="w-4 h-4 text-lime-400" />
              <span>{t("footer.guarantee")}</span>
            </div>
            <p className="text-zinc-500 text-[11px]">{t("footer.meta")}</p>
          </div>
          <div className="text-[11px] leading-relaxed text-zinc-500 space-y-2 border-t border-zinc-800/60 pt-4">
            <p>
              <strong>Methodology note:</strong> {t("footer.method")}
            </p>
            <p>{t("footer.built")}</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
