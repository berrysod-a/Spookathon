import { GoogleGenerativeAI } from "@google/generative-ai";
import { BillSchema, EXTRACTION_SYSTEM_PROMPT } from "@/lib/extraction";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json({ error: "No bill file uploaded." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        {
          error:
            "No GEMINI_API_KEY detected. Please enter your bill manually or use the sample bill.",
        },
        { status: 422 }
      );
    }

    // Convert to buffer & base64 (strictly in memory, no disk write)
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = file.type || "image/jpeg";

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error("Extraction timed out after 20 seconds")),
        20000
      )
    );

    const extractionPromise = model.generateContent([
      { text: EXTRACTION_SYSTEM_PROMPT },
      {
        inlineData: {
          data: base64Data,
          mimeType,
        },
      },
    ]);

    const result = await Promise.race([extractionPromise, timeoutPromise]);
    const responseText = result.response.text();

    let json: unknown;
    try {
      json = JSON.parse(responseText);
    } catch {
      return Response.json(
        {
          error: "Could not parse JSON response from the extraction model.",
        },
        { status: 422 }
      );
    }

    const parsed = BillSchema.safeParse(json);
    if (!parsed.success) {
      return Response.json(
        {
          error:
            "The image was read, but some fields need verification. Please review them in the form.",
          partial: json,
        },
        { status: 422 }
      );
    }

    return Response.json({ bill: parsed.data });
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Failed to extract bill details.";
    return Response.json({ error: msg }, { status: 422 });
  }
}

