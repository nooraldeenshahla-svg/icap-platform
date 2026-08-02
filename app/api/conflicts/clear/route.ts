import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Only clears the signed-in account's own conflicts — never other users' data.
  await prisma.conflict.deleteMany({ where: { createdBy: session.user.email } });
  return NextResponse.json({ ok: true });
}
