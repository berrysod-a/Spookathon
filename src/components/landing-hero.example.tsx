"use client";

import { Waves } from "@/components/ui/wave-background"; // from the supplied wave-background.tsx (needs simplex-noise)
import { ContainerScroll } from "@/components/ui/container-scroll";

/** Example wiring: kinetic background behind the hero, scroll-reveal dashboard preview below it. */
export function LandingHero({ onStart }: { onStart: () => void }) {
  return (
    <section className="relative bg-zinc-950 text-zinc-50">
      <div className="absolute inset-0 h-[100svh]">
        {/* Blue-tinted lines on near-black to echo the kinetic grid reference. */}
        <Waves strokeColor="#3b82f6" backgroundColor="#09090b" pointerSize={0.5} />
      </div>

      <div className="relative z-10 mx-auto flex h-[100svh] max-w-4xl flex-col items-center justify-center px-6 text-center">
        <h1 className="text-balance text-5xl font-semibold tracking-tight md:text-7xl">
          See what your bill is hiding.
        </h1>
        <p className="mt-5 max-w-xl text-pretty text-lg text-zinc-400">
          Upload your KSEB bill. Get the real cost of one extra unit, a likely breakdown by appliance, and a plan to cut your next bill.
        </p>
        <button
          onClick={onStart}
          className="mt-8 rounded-full bg-lime-400 px-6 py-3 font-medium text-zinc-950 transition hover:bg-lime-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-300"
        >
          Analyse my bill
        </button>
      </div>

      <ContainerScroll
        titleComponent={
          <h2 className="text-3xl font-semibold tracking-tight md:text-6xl">
            From one number to a plan
          </h2>
        }
      >
        {/* Replace with a static screenshot or a live <DashboardPreview /> of the sample bill. */}
        <div className="grid h-full place-items-center text-zinc-500">Dashboard preview</div>
      </ContainerScroll>
    </section>
  );
}
