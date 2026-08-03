import "server-only";
import type { Conflict, AIAnalysisResult } from "@/types/conflict";

/**
 * Server-only Groq client (OpenAI-compatible endpoint).
 * Groq's free developer tier requires no credit card and no billing setup —
 * see https://groq.com. GROQ_API_KEY must never be exposed to the client;
 * this file is only ever imported from app/api/** route handlers.
 */

const GROQ_MODEL = "llama-3.3-70b-versatile";
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

function getApiKey(): string {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    throw new Error(
      "GROQ_API_KEY is not set. Add it to your .env.local file (never commit it)."
    );
  }
  return key;
}

const SYSTEM_INSTRUCTION = `You are a senior conflict-analysis researcher specialized in the Iraqi context
(tribal customs, provincial governance, religious diversity, IDPs and returnees, minorities, women and youth
inclusion, and civil-society/peacebuilding programming). You analyze the conflict data provided and respond
with STRICT JSON ONLY — no prose, no markdown fences, no commentary before or after the JSON object.

The JSON object MUST match this exact shape:
{
  "summary": { "executiveSummary": "", "overview": "", "dynamics": "", "drivers": [""], "triggers": [""] },
  "stakeholders": [],
  "problemTree": { "nodes": [{ "id": "", "label": "", "type": "root_cause|core_problem|consequence", "parentIds": [] }] },
  "timeline": [],
  "abcTriangle": { "attitudes": [""], "behaviors": [""], "contradictions": [""] },
  "onionModels": [{ "stakeholderId": "", "position": "", "interest": "", "needs": "" }],
  "riskAssessment": {
    "conflictSeverity": { "value": 0, "explanation": "" },
    "violenceRisk": { "value": 0, "explanation": "" },
    "escalationRisk": { "value": 0, "explanation": "" },
    "peaceOpportunity": { "value": 0, "explanation": "" },
    "institutionalCapacity": { "value": 0, "explanation": "" },
    "communityReadiness": { "value": 0, "explanation": "" }
  },
  "peaceOpportunities": [{ "title": "", "description": "", "actors": [""], "feasibility": 0 }],
  "recommendations": [{ "title": "", "description": "", "priority": "low|medium|high|urgent", "targetActors": [""], "timeframe": "" }],
  "scenarios": [{ "type": "best_case|most_likely|worst_case", "title": "", "narrative": "", "probability": 0 }],
  "earlyWarningIndicators": [{ "indicator": "", "currentStatus": "stable|watch|alert", "description": "" }],
  "conflictScore": { "overall": 0, "trend": "escalating|stable|de-escalating" },
  "charts": {}
}

Respond in the same language the input data is written in (Arabic input → Arabic output).

IMPORTANT — depth requirements:
- "recommendations" MUST contain AT LEAST 7 distinct, concrete, actionable recommendations, each addressing a DIFFERENT dimension of the conflict: legal/property rights, social reconciliation and dialogue, economic/livelihoods, security, local governance and institutional capacity, tribal/customary mediation, and psychosocial support. Do not repeat the same idea twice. Each recommendation's "description" should be specific enough to act on (who does what, roughly how), not a generic slogan.
- "peaceOpportunities" MUST contain AT LEAST 4 distinct entries, each naming real categories of actors relevant to the Iraqi context (tribal elders, civil-society/reconciliation committees, local government, security services, religious leaders, women's and youth groups) and a concrete opening for engagement.
- "earlyWarningIndicators" MUST contain AT LEAST 5 distinct, observable indicators.
- "scenarios" MUST contain EXACTLY 3 entries — one "best_case", one "most_likely", one "worst_case". Each entry's "title" and "narrative" MUST be different from the other two entries AND different from each other within the same entry (never copy the conflict's name as the title, never repeat the narrative as the title). "probability" is an INTEGER from 0 to 100 (e.g. 60, never 0.6), and the three probabilities should sum to roughly 100.
- Ground every recommendation and opportunity in the specific facts of the conflict record provided — never generic boilerplate that could apply to any conflict.

Return ONLY the JSON object, nothing else.`;

function normalizeResult(raw: AIAnalysisResult): AIAnalysisResult {
  const scenarios = (raw.scenarios ?? []).map((s) => ({
    ...s,
    probability: s.probability <= 1 ? Math.round(s.probability * 100) : Math.round(s.probability),
  }));
  return { ...raw, scenarios };
}

function isSufficient(result: AIAnalysisResult): boolean {
  return (
    (result.recommendations?.length ?? 0) >= 5 &&
    (result.scenarios?.length ?? 0) >= 3 &&
    new Set(result.scenarios?.map((s) => s.narrative)).size >= 3
  );
}

interface GroqResponse {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
}

export async function suggestGoalPhrasing(text: string, locale: "ar" | "en" = "ar"): Promise<string> {
  const apiKey = getApiKey();

  const systemPrompt = locale === "ar"
    ? `أنت خبير بصياغة أهداف مشاريع بناء السلام وحل النزاعات بالسياق العراقي. مهمتك تحسين صياغة هدف مكتوب بشكل عادي وتحويله لصياغة احترافية بأسلوب "SMART" (محدد، قابل للقياس، قابل للتحقيق، مرتبط بالواقع، ومحدد بإطار زمني عام). أرجع فقط النص المُحسَّن، جملة أو جملتين كحد أقصى، بدون أي شرح أو مقدمة أو علامات تنصيص.`
    : `You are an expert in peacebuilding and conflict-resolution project design. Improve the wording of a plainly-written goal into a professional SMART-style objective (specific, measurable, achievable, relevant, time-bound framing). Return ONLY the improved text, one or two sentences maximum, no explanation, no quotation marks.`;

  const payload = {
    model: GROQ_MODEL,
    temperature: 0.5,
    max_tokens: 200,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: text },
    ],
  };

  const res = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(payload),
  });

  const data = (await res.json()) as GroqResponse;
  if (!res.ok) {
    throw new Error(`Groq API error (${res.status}): ${data.error?.message ?? "Unknown error"}`);
  }
  const suggestion = data.choices?.[0]?.message?.content?.trim();
  if (!suggestion) throw new Error("Groq returned an empty response.");
  return suggestion;
}
  conflict: Partial<Conflict>
): Promise<AIAnalysisResult> {
  const apiKey = getApiKey();

  async function callOnce(extraReminder?: string): Promise<AIAnalysisResult> {
    const userContent = `Analyze the following conflict record and return ONLY the JSON object described in your instructions:\n\n${JSON.stringify(
      conflict,
      null,
      2
    )}${extraReminder ? `\n\n${extraReminder}` : ""}`;

    const payload = {
      model: GROQ_MODEL,
      temperature: 0.5,
      max_tokens: 6000,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_INSTRUCTION },
        { role: "user", content: userContent },
      ],
    };

    const res = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data = (await res.json()) as GroqResponse;

    if (!res.ok) {
      throw new Error(`Groq API error (${res.status}): ${data.error?.message ?? "Unknown error"}`);
    }

    const text = data.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error("Groq returned an empty response.");
    }

    try {
      return normalizeResult(JSON.parse(text) as AIAnalysisResult);
    } catch {
      throw new Error("Groq did not return valid JSON. Raw response logged server-side.");
    }
  }

  const first = await callOnce();
  if (isSufficient(first)) return first;

  // The first pass was too thin (missing recommendations, or scenarios were
  // duplicated/generic) — ask once more with a pointed reminder.
  const second = await callOnce(
    "Your previous answer was too thin or repetitive. This time: write at least 7 genuinely different recommendations, " +
      "and make sure the three scenarios (best_case, most_likely, worst_case) each have a distinct, specific title and narrative — do not reuse text between them."
  );
  return isSufficient(second) ? second : first.recommendations?.length ? first : second;
}
