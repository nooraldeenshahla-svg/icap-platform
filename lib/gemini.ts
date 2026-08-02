import "server-only";
import type { Conflict, AIAnalysisResult } from "@/types/conflict";

/**
 * Server-only Gemini client.
 * GEMINI_API_KEY must never be exposed to the client — this file is only
 * ever imported from app/api/** route handlers (Next.js server runtime).
 */

const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it to your .env.local file (never commit it)."
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

Respond in the same language the input data is written in (Arabic input → Arabic output).`;

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
  promptFeedback?: { blockReason?: string };
}

export async function analyzeConflictWithGemini(
  conflict: Partial<Conflict>
): Promise<AIAnalysisResult> {
  const apiKey = getApiKey();

  const payload = {
    system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Analyze the following conflict record and return ONLY the JSON object described in your instructions:\n\n${JSON.stringify(
              conflict,
              null,
              2
            )}`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.4,
      responseMimeType: "application/json",
    },
  };

  const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${errText}`);
  }

  const data = (await res.json()) as GeminiResponse;

  if (data.promptFeedback?.blockReason) {
    throw new Error(`Gemini blocked the request: ${data.promptFeedback.blockReason}`);
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  try {
    return JSON.parse(text) as AIAnalysisResult;
  } catch {
    throw new Error("Gemini did not return valid JSON. Raw response logged server-side.");
  }
}
