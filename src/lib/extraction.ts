import { z } from "zod";

/** Schema the vision model must return. Validate every response with it before showing the confirm screen. */
export const BillSchema = z.object({
  prevReadingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  presentReadingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  prevReading: z.number(),
  presentReading: z.number(),
  units: z.number(),
  fixedCharge: z.number(),
  energyCharge: z.number(),
  fuelSurcharge: z.number(),
  autoRecoverySurcharge: z.number(),
  electricityDuty: z.number(),
  otherCharges: z.number(),
  roundOff: z.number(),
  total: z.number(),
  connectedLoadW: z.number().optional(),
});

export const EXTRACTION_SYSTEM_PROMPT = `You read photos of Kerala State Electricity Board (KSEB) bills.
Return ONLY a JSON object, no prose and no code fences, with these numeric fields (rupees or units, no currency symbols):
prevReadingDate and presentReadingDate as ISO yyyy-mm-dd (bills print dd-mm-yyyy),
prevReading, presentReading (meter readings), units (consumed units),
fixedCharge (Fixed Charge FC), energyCharge (Energy Charge EC), fuelSurcharge (FS),
autoRecoverySurcharge (Auto Recovery FSM), electricityDuty (Electricity Duty ED),
otherCharges (sum of any other charges, else 0), roundOff (negative if shown with a minus sign),
total (the bill total "Total Amt" before payments and adjustments), connectedLoadW (connected load in watts, optional).
Copy numbers exactly as printed. If a field is unreadable, use 0 and do not guess.`;
