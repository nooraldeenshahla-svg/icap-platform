"use client";

import dynamic from "next/dynamic";
import type { Conflict } from "@/types/conflict";

const IraqMapInner = dynamic(() => import("./iraq-map").then((m) => m.IraqMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-[560px] w-full items-center justify-center rounded-lg border border-border bg-muted/30 text-sm text-muted-foreground">
      …
    </div>
  ),
});

export function IraqMapClient({ conflicts }: { conflicts: Conflict[] }) {
  return <IraqMapInner conflicts={conflicts} />;
}
