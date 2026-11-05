import { NextRequest } from "next/server";

// Pollinations.ai — free, no API key needed
// Returns a direct image URL
export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json() as { prompt?: string };

    if (!prompt?.trim()) {
      return Response.json({ error: "Missing prompt" }, { status: 400 });
    }

    // Sanitize — strip potential injection characters
    const clean = prompt
      .trim()
      .slice(0, 500)
      .replace(/[<>"'`]/g, "");

    // Pollinations URL-based image generation
    const seed = Math.floor(Math.random() * 1000000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(clean)}?width=768&height=512&seed=${seed}&nologo=true&enhance=true`;

    // Verify the image is reachable (Pollinations generates on the fly)
    const check = await fetch(imageUrl, {
      method: "HEAD",
      signal: AbortSignal.timeout(15000),
    });

    if (!check.ok) {
      throw new Error("Image generation failed");
    }

    return Response.json(
      { imageUrl, prompt: clean },
      { headers: { "X-Content-Type-Options": "nosniff" } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Generation failed";
    return Response.json({ error: msg }, { status: 500 });
  }
}
