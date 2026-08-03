import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Conflict } from "@/types/conflict";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

/**
 * Every conflict is scoped to the Google account that created it — each
 * signed-in user only ever sees, updates, or deletes their own records.
 * (Data still lives in one shared Postgres database; the isolation is
 * enforced here, per request, by filtering on the account's email.)
 */

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await prisma.conflict.findMany({
    where: { createdBy: session.user.email },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(rows.map((r) => r.data), {
    headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const conflict = (await req.json()) as Conflict;
  if (!conflict?.id || !conflict?.name) {
    return NextResponse.json({ error: "Invalid conflict payload" }, { status: 400 });
  }

  const existing = await prisma.conflict.findUnique({ where: { id: conflict.id } });

  // Block editing a record that belongs to a different account.
  if (existing && existing.createdBy !== session.user.email) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existingData = existing?.data as unknown as Conflict | undefined;
  const enriched: Conflict = {
    ...conflict,
    createdByName: existingData?.createdByName ?? session.user.name ?? undefined,
    createdByEmail: existingData?.createdByEmail ?? session.user.email,
  };

  await prisma.conflict.upsert({
    where: { id: conflict.id },
    create: {
      id: conflict.id,
      name: conflict.name,
      governorate: conflict.location?.governorate ?? "",
      conflictType: conflict.conflictType,
      status: conflict.status,
      createdBy: session.user.email,
      createdByName: session.user.name ?? undefined,
      data: enriched as unknown as object,
    },
    update: {
      name: conflict.name,
      governorate: conflict.location?.governorate ?? "",
      conflictType: conflict.conflictType,
      status: conflict.status,
      data: enriched as unknown as object,
    },
  });

  return NextResponse.json({ ok: true });
}
