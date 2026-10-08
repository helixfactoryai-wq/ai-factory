// Advanced scoring algorithms for audit results
export function calculateScore(actual: string, expected: string): {
  score: number;
  breakdown: { keyword: number; sentiment: number; coherence: number; length: number };
} {
  const keyword   = keywordScore(actual, expected);
  const sentiment = sentimentScore(actual);
  const coherence = coherenceScore(actual);
  const length    = lengthScore(actual, expected);

  const score = expected.trim()
    ? Math.round(keyword * 0.5 + sentiment * 0.2 + coherence * 0.2 + length * 0.1)
    : Math.round(sentiment * 0.4 + coherence * 0.4 + length * 0.2);

  return { score: Math.min(100, Math.max(0, score)), breakdown: { keyword, sentiment, coherence, length } };
}

function keywordScore(actual: string, expected: string): number {
  if (!expected.trim()) return 75;
  const words = expected.toLowerCase().split(/\s+/).filter(Boolean);
  const matches = words.filter((w) => actual.toLowerCase().includes(w)).length;
  return Math.min(100, Math.round((matches / words.length) * 100));
}

function sentimentScore(actual: string): number {
  const positive = ["good","great","excellent","wonderful","fantastic","happy","helpful","thank","welcome","please","sure","absolutely","yes","love","perfect","glad","appreciate","assist","support","certainly"];
  const negative = ["bad","terrible","horrible","awful","sorry","unfortunately","cannot","wrong","error","fail","unable","impossible","never","refuse","denied"];
  const text = actual.toLowerCase();
  const pos = positive.filter((w) => text.includes(w)).length;
  const neg = negative.filter((w) => text.includes(w)).length;
  const total = pos + neg;
  if (total === 0) return 70;
  return Math.min(100, Math.round((pos / total) * 100));
}

function coherenceScore(actual: string): number {
  if (!actual || actual.length < 10) return 0;
  const sentences = actual.split(/[.!?]+/).filter((s) => s.trim().length > 3);
  if (sentences.length >= 3) return 95;
  if (sentences.length === 2) return 85;
  if (actual.length > 100) return 80;
  if (actual.length > 50) return 70;
  return 60;
}

function lengthScore(actual: string, expected: string): number {
  if (!expected.trim()) return actual.length > 20 ? 80 : 60;
  const ratio = actual.length / Math.max(expected.length, 1);
  if (ratio >= 0.8 && ratio <= 4) return 100;
  if (ratio >= 0.4 && ratio <= 6) return 75;
  return 50;
}
