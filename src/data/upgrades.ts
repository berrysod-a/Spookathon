/** Simple like-for-like upgrades. ILLUSTRATIVE wattages and prices: verify before the demo. */
export interface Upgrade {
  id: string;
  label: string;
  applianceId: string; // must exist in APPLIANCES
  oldWatts: number;
  newWatts: number;
  pricePerUnitItem: number; // rupees per replacement item (user can edit)
}

export const UPGRADES: Upgrade[] = [
  { id: "bulb-to-led", label: "Filament bulb to LED", applianceId: "incandescent-bulb", oldWatts: 60, newWatts: 9, pricePerUnitItem: 100 },
  { id: "tube-to-led", label: "Tube light to LED batten", applianceId: "tube-light", oldWatts: 45, newWatts: 20, pricePerUnitItem: 400 },
  { id: "fan-to-bldc", label: "Old fan to BLDC fan", applianceId: "ceiling-fan", oldWatts: 75, newWatts: 32, pricePerUnitItem: 3500 },
];
