import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Scoring algorithms
function keywordScore(actual: string, expected: string): number {
  const words = expected.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 75;
  const matches = words.filter((w) => actual.toLowerCase().includes(w)).length;
  return Math.min(100, Math.round((matches / words.length) * 100));
}

function sentimentScore(actual: string): number {
  const positive = ["good","great","excellent","wonderful","fantastic","happy","helpful","thank","welcome","please","sure","absolutely","yes","love","perfect"];
  const negative = ["bad","terrible","horrible","awful","sorry","unfortunately","cannot","no","wrong","error","fail","unable"];
  const text = actual.toLowerCase();
  const posCount = positive.filter((w) => text.includes(w)).length;
  const negCount = negative.filter((w) => text.includes(w)).length;
  const total = posCount + negCount;
  if (total === 0) return 70;
  return Math.min(100, Math.round((posCount / total) * 100));
}

function lengthScore(actual: string, expected: string): number {
  if (!expected) return 75;
  const ratio = actual.length / Math.max(expected.length, 1);
  if (ratio >= 0.5 && ratio <= 3) return 100;
  if (ratio >= 0.3 && ratio <= 5) return 75;
  return 50;
}

function coherenceScore(actual: string): number {
  const sentences = actual.split(/[.!?]+/).filter((s) => s.trim().length > 3);
  if (sentences.length === 0) return 0;
  if (sentences.length >= 2) return 90;
  if (actual.length > 50) return 80;
  return 65;
}

function calculateFinalScore(
  actual: string,
  expected: string,
  weights = { keyword: 0.4, sentiment: 0.2, length: 0.2, coherence: 0.2 }
): { score: number; breakdown: Record<string, number> } {
  const keyword   = expected ? keywordScore(actual, expected)   : 75;
  const sentiment = sentimentScore(actual);
  const length    = lengthScore(actual, expected);
  const coherence = coherenceScore(actual);

  const score = Math.round(
    keyword   * weights.keyword +
    sentiment * weights.sentiment +
    length    * weights.length +
    coherence * weights.coherence
  );

  return {
    score: Math.min(100, Math.max(0, score)),
    breakdown: { keyword, sentiment, length, coherence },
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { prompt, model, test_input, expected_output, scoring_mode } = await req.json();

    const openrouterKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!openrouterKey) throw new Error("OPENROUTER_API_KEY not set");

    const modelMap: Record<string, string> = {
      "claude-sonnet":  "anthropic/claude-3.5-sonnet",
      "claude-opus":    "anthropic/claude-3-opus",
      "claude-haiku":   "anthropic/claude-3-haiku",
      "gpt-4o":         "openai/gpt-4o",
      "gpt-4-turbo":    "openai/gpt-4-turbo",
      "gpt-3.5-turbo":  "openai/gpt-3.5-turbo",
      "gemini-pro":     "google/gemini-pro",
      "gemini-flash":   "google/gemini-flash-1.5",
      "deepseek-chat":  "deepseek/deepseek-chat",
    };

    const openrouterModel = modelMap[model] ?? "deepseek/deepseek-chat";

    const messages = [];
    if (prompt) {
      messages.push({ role: "user", content: prompt + "\n\n" + test_input });
    } else {
      messages.push({ role: "user", content: test_input });
    }

    const start = Date.now();
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + openrouterKey,
        "HTTP-Referer": "https://project-1pcv1.vercel.app",
        "X-Title": "AI Factory",
      },
      body: JSON.stringify({ model: openrouterModel, messages, max_tokens: 1024 }),
    });

    const latency = Date.now() - start;
    if (!res.ok) {
      const err = await res.text();
      throw new Error("OpenRouter error: " + err);
    }

    const data = await res.json();
    const output = data.choices?.[0]?.message?.content ?? "";
    const tokens = (data.usage?.prompt_tokens ?? 0) + (data.usage?.completion_tokens ?? 0);

    // Advanced scoring
    const { score, breakdown } = calculateFinalScore(output, expected_output ?? "");

    return new Response(
      JSON.stringify({
        output,
        score,
        score_breakdown: breakdown,
        latency_ms: latency,
        tokens_used: tokens,
        model_used: openrouterModel,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
