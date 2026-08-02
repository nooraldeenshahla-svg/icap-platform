import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Conflict } from "@/types/conflict";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await prisma.conflict.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json(rows.map((r) => r.data));
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const conflict = (await req.json()) as Conflict;
  if (!conflict?.id || !conflict?.name) {
    return NextResponse.json({ error: "Invalid conflict payload" }, { status: 400 });
  }

  // Preserve the original creator on updates; stamp it in on first save.
  const existing = await prisma.conflict.findUnique({ where: { id: conflict.id } });
  const existingData = existing?.data as unknown as Conflict | undefined;
  const enriched: Conflict = {
    ...conflict,
    createdByName: existingData?.createdByName ?? session.user?.name ?? undefined,
    createdByEmail: existingData?.createdByEmail ?? session.user?.email ?? undefined,
  };

  await prisma.conflict.upsert({
    where: { id: conflict.id },
    create: {
      id: conflict.id,
      name: conflict.name,
      governorate: conflict.location?.governorate ?? "",
      conflictType: conflict.conflictType,
      status: conflict.status,
      createdBy: session.user?.email ?? undefined,
      createdByName: session.user?.name ?? undefined,
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
