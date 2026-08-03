import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { suggestGoalPhrasing } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { text, locale } = await req.json();
  if (!text || typeof text !== "string" || text.trim().length < 3) {
    return NextResponse.json({ error: "Text is too short." }, { status: 400 });
  }

  try {
    const suggestion = await suggestGoalPhrasing(text, locale === "en" ? "en" : "ar");
    return NextResponse.json({ suggestion });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
