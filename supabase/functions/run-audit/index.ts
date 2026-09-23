import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { prompt, model, test_input, expected_output } = await req.json();

    const openrouterKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!openrouterKey) throw new Error("OPENROUTER_API_KEY not set");

    // Free models on OpenRouter
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

    // Default to a free model
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
      body: JSON.stringify({
        model: openrouterModel,
        messages,
        max_tokens: 1024,
      }),
    });

    const latency = Date.now() - start;

    if (!res.ok) {
      const err = await res.text();
      throw new Error("OpenRouter API error: " + err);
    }

    const data = await res.json();
    const output = data.choices?.[0]?.message?.content ?? "";
    const tokens = (data.usage?.prompt_tokens ?? 0) + (data.usage?.completion_tokens ?? 0);

    // Score based on expected output keyword matching
    let score = 75;
    if (expected_output && expected_output.trim()) {
      const words = expected_output.toLowerCase().split(/\s+/).filter(Boolean);
      const matches = words.filter((w: string) => output.toLowerCase().includes(w)).length;
      score = Math.min(100, Math.round((matches / Math.max(words.length, 1)) * 100));
    }

    return new Response(
      JSON.stringify({ output, score, latency_ms: latency, tokens_used: tokens }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
