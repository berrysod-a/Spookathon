"use client";

import React from "react";
import { Waves } from "@/components/ui/wave-background";
import { ContainerScroll } from "@/components/ui/container-scroll";
import { LivePreviewCard } from "./live-preview-card";
import { ArrowDown } from "lucide-react";
import { useT } from "@/i18n";

interface LandingHeroProps {
  onStart: () => void;
}

export function LandingHero({ onStart }: LandingHeroProps) {
  const t = useT();

  return (
    <section className="relative bg-[#09090b] text-[#fafafa] overflow-hidden">
      {/* Kinetic canvas background */}
      <div className="absolute inset-0 h-[100svh] pointer-events-auto">
        <Waves strokeColor="#3b82f6" backgroundColor="#09090b" pointerSize={0.6} />
      </div>

      {/* Main hero typography — one lime CTA (C1: single action) */}
      <div className="relative z-10 mx-auto flex h-[100svh] max-w-4xl flex-col items-center justify-center px-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-1.5 text-xs text-zinc-300 backdrop-blur-md mb-6">
          <span className="h-2 w-2 rounded-full bg-lime-400" />
          <span>{t("hero.badge")}</span>
        </div>

        <h1 className="text-balance text-5xl font-extrabold tracking-tight md:text-7xl lg:text-8xl text-white">
          {t("hero.headline")}
        </h1>

        <p className="mt-6 max-w-xl text-pretty text-base md:text-lg text-zinc-400 leading-relaxed">
          {t("hero.sub")}
        </p>

        {/* Single primary CTA (C1: no secondary "Use sample bill") */}
        <div className="mt-8">
          <button
            type="button"
            onClick={onStart}
            className="rounded-full bg-lime-400 px-8 py-3.5 text-base font-semibold text-zinc-950 transition-all hover:bg-lime-300 hover:shadow-[0_0_25px_rgba(163,230,53,0.4)] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-300 select-none"
          >
            {t("hero.cta")}
          </button>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-500 text-xs">
          <span>{t("hero.scroll")}</span>
          <ArrowDown className="w-4 h-4 animate-bounce text-zinc-400" />
        </div>
      </div>

      {/* 3D Perspective Scroll Reveal Frame */}
      <ContainerScroll
        titleComponent={
          <div className="space-y-2 mb-6">
            <h2 className="text-3xl font-extrabold tracking-tight md:text-6xl text-white">
              {t("hero.preview.title")}
            </h2>
            <p className="text-sm md:text-base text-zinc-400 max-w-md mx-auto">
              {t("hero.preview.sub")}
            </p>
          </div>
        }
      >
        <LivePreviewCard />
      </ContainerScroll>
    </section>
  );
}
