import type { ApplianceEntry } from "@/lib/schedule";
import { defaultUsageFor, uniformUsage } from "@/lib/schedule";

/**
 * Preset loaded ONLY by the hidden demo link (see demo-readiness skill). No visible UI offers it.
 * Deliberately incomplete so "Not covered by your list" is a real finding; adding the water pump closes it.
 */
export const DEMO_ENTRIES: ApplianceEntry[] = [
  { uid: "demo-fridge", defId: "fridge", name: "Refrigerator", qty: 1, usage: defaultUsageFor("fridge"),
    efficiency: { ageYears: 15, stars: 0, capacityLitres: 250, fridgeType: "frost-free", replacementPrice: 25000 } },
  { uid: "demo-fan", defId: "ceiling-fan", name: "Ceiling fan", qty: 2, usage: uniformUsage({ earlyMorning: 1, evening: 2, lateNight: 3 }) },
  { uid: "demo-led", defId: "led-bulb", name: "LED bulb", qty: 5, usage: uniformUsage({ earlyMorning: 1, evening: 3 }) },
  { uid: "demo-router", defId: "wifi-router", name: "Wi-Fi router", qty: 1, usage: defaultUsageFor("wifi-router") },
  { uid: "demo-stb", defId: "set-top-box", name: "Set-top box", qty: 1, usage: defaultUsageFor("set-top-box") },
];
