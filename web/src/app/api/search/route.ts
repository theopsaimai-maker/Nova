import { NextRequest } from "next/server";

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

// Uses DuckDuckGo Instant Answer API — free, no key needed
async function searchDDG(query: string): Promise<SearchResult[]> {
  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Nova-AI-Assistant/1.0" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`DDG API error: ${res.status}`);
  const data = await res.json();

  const results: SearchResult[] = [];

  // Abstract (main result)
  if (data.Abstract && data.AbstractURL) {
    results.push({
      title:   data.Heading || query,
      url:     data.AbstractURL,
      snippet: data.Abstract,
    });
  }

  // Related topics
  for (const topic of data.RelatedTopics ?? []) {
    if (results.length >= 5) break;
    if (topic.FirstURL && topic.Text) {
      results.push({
        title:   topic.Text.split(" - ")[0] ?? topic.Text.slice(0, 60),
        url:     topic.FirstURL,
        snippet: topic.Text,
      });
    }
    // Nested topics
    for (const sub of topic.Topics ?? []) {
      if (results.length >= 5) break;
      if (sub.FirstURL && sub.Text) {
        results.push({
          title:   sub.Text.split(" - ")[0] ?? sub.Text.slice(0, 60),
          url:     sub.FirstURL,
          snippet: sub.Text,
        });
      }
    }
  }

  return results.slice(0, 5);
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q")?.trim();

  if (!query) {
    return Response.json({ error: "Missing query param ?q=" }, { status: 400 });
  }

  // Basic input sanitization
  if (query.length > 300) {
    return Response.json({ error: "Query too long" }, { status: 400 });
  }

  try {
    const results = await searchDDG(query);
    return Response.json(
      { results },
      {
        headers: {
          "Cache-Control": "public, max-age=60",
          "X-Content-Type-Options": "nosniff",
        },
      }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Search failed";
    return Response.json({ error: msg }, { status: 500 });
  }
}
