import { NextRequest, NextResponse } from "next/server";
import { analyzeConflictWithAI } from "@/lib/ai";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body?.name || !body?.conflictType) {
      return NextResponse.json(
        { error: "Missing required conflict fields (name, conflictType)." },
        { status: 400 }
      );
    }

    const result = await analyzeConflictWithAI(body);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("[/api/analyze]", err);
    const message = err instanceof Error ? err.message : "Unknown error during analysis.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
