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
Return ONLY the JSON object, nothing else.`;

interface GroqResponse {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
}

export async function analyzeConflictWithAI(
  conflict: Partial<Conflict>
): Promise<AIAnalysisResult> {
  const apiKey = getApiKey();

  const payload = {
    model: GROQ_MODEL,
    temperature: 0.4,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_INSTRUCTION },
      {
        role: "user",
        content: `Analyze the following conflict record and return ONLY the JSON object described in your instructions:\n\n${JSON.stringify(
          conflict,
          null,
          2
        )}`,
      },
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
    return JSON.parse(text) as AIAnalysisResult;
  } catch {
    throw new Error("Groq did not return valid JSON. Raw response logged server-side.");
  }
}
