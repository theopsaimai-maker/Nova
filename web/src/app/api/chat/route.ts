import { NextRequest } from "next/server";
import type { Message } from "@/lib/types";
import type { SearchResult } from "@/app/api/search/route";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const DEFAULT_SYSTEM =
  "You are Gemini, a helpful, accurate, and friendly AI assistant. " +
  "Provide clear, well-structured answers. Use markdown — headings, bullet " +
  "points, code blocks with language tags — when it improves readability.";

// ── Rate limit (simple in-memory, per IP) ─────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT = 30;   // requests
const RATE_WINDOW = 60_000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.reset) {
    rateLimitMap.set(ip, { count: 1, reset: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    return Response.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey?.trim()) {
      return Response.json(
        { error: "GROQ_API_KEY is not set in .env.local" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const {
      messages,
      model = "openai/gpt-oss-120b",
      customInstructions = "",
      webSearch = false,
      imageGenerate = false,
      attachments = [],
    } = body as {
      messages: Message[];
      model?: string;
      customInstructions?: string;
      webSearch?: boolean;
      imageGenerate?: boolean;
      attachments?: Array<{ type: "image" | "text"; name: string; content: string; mimeType: string }>;
    };

    if (!messages?.length) {
      return Response.json({ error: "No messages provided" }, { status: 400 });
    }

    // Sanitize string inputs
    const safeInstructions = (customInstructions ?? "").slice(0, 2000);
    const lastUserMsg = messages[messages.length - 1];

    // ── Image generation shortcut ────────────────────────────────────────────
    if (imageGenerate) {
      const prompt = lastUserMsg.content.replace(/^(generate|create|draw|make|imagine)\s+(an?\s+)?image\s+(of\s+)?/i, "").trim();
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const send = (type: string, data: string) =>
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type, data })}\n\n`));
          try {
            const seed = Math.floor(Math.random() * 1_000_000);
            const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=768&height=512&seed=${seed}&nologo=true&enhance=true`;
            send("token", `![${prompt}](${imageUrl})\n\n*Generated image for: "${prompt}"*`);
            send("done", "");
          } catch (e) {
            send("error", e instanceof Error ? e.message : "Image generation failed");
          } finally {
            controller.close();
          }
        },
      });
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    // ── Web search ───────────────────────────────────────────────────────────
    let searchContext = "";
    let searchResults: SearchResult[] = [];
    if (webSearch && lastUserMsg.content.trim()) {
      try {
        const searchUrl = new URL("/api/search", req.url);
        searchUrl.searchParams.set("q", lastUserMsg.content.slice(0, 300));
        const sr = await fetch(searchUrl.toString());
        if (sr.ok) {
          const data = await sr.json() as { results?: SearchResult[] };
          searchResults = data.results ?? [];
          if (searchResults.length > 0) {
            searchContext =
              "\n\n--- Web search results ---\n" +
              searchResults
                .map((r, i) => `[${i + 1}] **${r.title}**\n${r.snippet}\nSource: ${r.url}`)
                .join("\n\n") +
              "\n--- End of search results ---\n\nUse the above to answer. Cite sources with [1], [2] etc.";
          }
        }
      } catch { /* search failed silently — answer without it */ }
    }

    // ── Build system prompt ──────────────────────────────────────────────────
    const systemPrompt =
      DEFAULT_SYSTEM +
      (safeInstructions ? `\n\nUser instructions:\n${safeInstructions}` : "") +
      searchContext;

    // ── Build messages for Groq ──────────────────────────────────────────────
    const groqMessages: Array<{ role: string; content: string | Array<{ type: string; [k: string]: unknown }> }> = [
      { role: "system", content: systemPrompt },
    ];

    for (const msg of messages.filter(m => m.role === "user" || m.role === "assistant")) {
      if (msg.role === "user") {
        // Check for attachments on this message (only last user message)
        const isLast = msg.id === lastUserMsg.id;
        const msgAttachments = isLast ? attachments : [];

        if (msgAttachments.length > 0) {
          const parts: Array<{ type: string; [k: string]: unknown }> = [];

          // Add images as vision parts
          const images = msgAttachments.filter(a => a.type === "image");
          const texts  = msgAttachments.filter(a => a.type === "text");

          // Prepend file contents to text
          let fullText = msg.content;
          if (texts.length > 0) {
            const fileContent = texts
              .map(f => `\n\n--- File: ${f.name} ---\n${f.content}\n--- End of file ---`)
              .join("\n");
            fullText = fullText + fileContent;
          }

          if (images.length > 0) {
            // Use vision model for images
            parts.push({ type: "text", text: fullText || "Please analyze this image." });
            for (const img of images) {
              parts.push({
                type: "image_url",
                image_url: { url: img.content },
              });
            }
            groqMessages.push({ role: "user", content: parts });
          } else {
            groqMessages.push({ role: "user", content: fullText });
          }
        } else {
          groqMessages.push({ role: "user", content: msg.content });
        }
      } else {
        groqMessages.push({ role: "assistant", content: msg.content });
      }
    }

    // Use vision model if any images are attached
    const hasImages = attachments.some(a => a.type === "image");
    const finalModel = hasImages ? "meta-llama/llama-4-scout-17b-16e-instruct" : model;

    // ── Stream from Groq ─────────────────────────────────────────────────────
    const groqRes = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: finalModel,
        messages: groqMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!groqRes.ok) {
      const err = await groqRes.text();
      return Response.json(
        { error: `Groq API error: ${groqRes.status} — ${err}` },
        { status: groqRes.status }
      );
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const send = (type: string, data: string) =>
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type, data })}\n\n`));

        try {
          const reader = groqRes.body!.getReader();
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || trimmed === "data: [DONE]") continue;
              if (!trimmed.startsWith("data: ")) continue;
              try {
                const json = JSON.parse(trimmed.slice(6));
                const delta = json.choices?.[0]?.delta?.content;
                if (delta) send("token", delta);
              } catch { /* skip malformed */ }
            }
          }

          // Append citations if web search was used
          if (searchResults.length > 0) {
            const citationBlock =
              "\n\n---\n**Sources:**\n" +
              searchResults.map((r, i) => `[${i + 1}] [${r.title}](${r.url})`).join("\n");
            send("token", citationBlock);
          }

          send("done", "");
        } catch (err) {
          send("error", err instanceof Error ? err.message : "Stream error");
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
