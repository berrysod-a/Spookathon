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
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600;700&family=Geist:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#09090b] text-[#fafafa] font-sans antialiased selection:bg-lime-400 selection:text-zinc-950">
        {children}
      </body>
    </html>
  );
}
