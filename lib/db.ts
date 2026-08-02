import type { Conflict } from "@/types/conflict";

/**
 * Shared data layer — talks to /api/conflicts, which is backed by a shared
 * Postgres database (Neon) via Prisma. Every signed-in user reads and
 * writes the same records, so a teammate can pick up where another left
 * off. Function names/signatures are kept identical to the earlier
 * IndexedDB-based version so no page importing them needed to change.
 */

export async function saveConflict(conflict: Conflict): Promise<void> {
  const res = await fetch("/api/conflicts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(conflict),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Failed to save conflict");
  }
}

export async function getAllConflicts(): Promise<Conflict[]> {
  const res = await fetch("/api/conflicts");
  if (!res.ok) return [];
  return res.json();
}

export async function getConflict(id: string): Promise<Conflict | undefined> {
  const all = await getAllConflicts();
  return all.find((c) => c.id === id);
}

export async function deleteConflict(id: string): Promise<void> {
  await fetch(`/api/conflicts/${id}`, { method: "DELETE" });
}

export async function clearAllConflicts(): Promise<void> {
  await fetch("/api/conflicts/clear", { method: "POST" });
}

export async function getConflictsByGovernorate(governorate: string): Promise<Conflict[]> {
  const all = await getAllConflicts();
  return all.filter((c) => c.location.governorate === governorate);
}
