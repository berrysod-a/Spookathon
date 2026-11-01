import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Watt Plan | Electricity Bill Analyser & Planner",
  description:
    "Decode your KSEB electricity bill, see the real cost of one extra unit, estimate appliance usage, and plan your savings.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // lang is updated client-side by setLang(); the default here is "en".
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Geist (UI) + Noto Sans Malayalam (C5 i18n) */}
        <link
          href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600;700&family=Geist:wght@400;500;600;700&family=Noto+Sans+Malayalam:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Apply persisted lang before first paint — prevents Malayalam text flashing in English font */}
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var l=localStorage.getItem("wattPlanLang");if(l==="ml"){document.documentElement.lang="ml";}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-[#09090b] text-[#fafafa] font-sans antialiased selection:bg-lime-400 selection:text-zinc-950">
        {children}
      </body>
    </html>
  );
}
