"use client";

import * as React from "react";
import ReactFlow, {
  Background, Controls, type Node, type Edge, Position, MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { useAppStore } from "@/lib/store";
import { POSITION_COLOR, RELATIONSHIP_TYPE_LABELS } from "@/lib/constants/stakeholder-labels";
import type { Conflict } from "@/types/conflict";

const COPY = {
  ar: { center: "جوهر النزاع", empty: "أضف طرفَين على الأقل لعرض الشبكة." },
  en: { center: "Core Conflict", empty: "Add at least two stakeholders to view the network." },
};

export function StakeholderNetwork({ conflict }: { conflict: Conflict }) {
  const locale = useAppStore((s) => s.locale);
  const t = COPY[locale];
  const stakeholders = conflict.stakeholders;

  const { nodes, edges } = React.useMemo<{ nodes: Node[]; edges: Edge[] }>(() => {
    const cx = 400, cy = 320, r = 260;
    const n = stakeholders.length;

    const shNodes: Node[] = stakeholders.map((s, i) => {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / Math.max(n, 1);
      const size = 60 + (s.influence / 100) * 60;
      return {
        id: s.id,
        position: { x: cx + r * Math.cos(angle) - size / 2, y: cy + r * Math.sin(angle) - size / 2 },
        data: { label: s.name },
        style: {
          width: size, height: size, borderRadius: "9999px",
          display: "flex", alignItems: "center", justifyContent: "center",
          textAlign: "center", fontSize: 11, fontWeight: 600, padding: 6,
          background: "white", border: `3px solid ${POSITION_COLOR[s.position]}`,
          color: "#1a1a1a",
        },
        sourcePosition: Position.Top,
        targetPosition: Position.Bottom,
      };
    });

    const centerNode: Node = {
      id: "__center__",
      position: { x: cx - 70, y: cy - 40 },
      data: { label: t.center },
      style: {
        width: 140, height: 80, borderRadius: 12, display: "flex",
        alignItems: "center", justifyContent: "center", textAlign: "center",
        fontSize: 12, fontWeight: 700, background: "#173533", color: "#f4f1ea",
        padding: 8,
      },
    };

    const relEdges: Edge[] = stakeholders.flatMap((s) =>
      s.relationships
        .filter((rel) => stakeholders.some((x) => x.id === rel.targetStakeholderId))
        .map((rel) => ({
          id: `${s.id}-${rel.targetStakeholderId}`,
          source: s.id,
          target: rel.targetStakeholderId,
          label: locale === "ar" ? RELATIONSHIP_TYPE_LABELS[rel.type]?.ar : RELATIONSHIP_TYPE_LABELS[rel.type]?.en,
          style: { strokeWidth: 1 + (rel.strength / 100) * 4, stroke: rel.type === "rivalry" ? "#b93b2f" : "#22635c" },
          markerEnd: { type: MarkerType.ArrowClosed },
        }))
    );

    return { nodes: [centerNode, ...shNodes], edges: relEdges };
  }, [stakeholders, locale, t.center]);

  if (stakeholders.length < 2) {
    return <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">{t.empty}</p>;
  }

  return (
    <div className="h-[560px] w-full overflow-hidden rounded-lg border border-border bg-card">
      <ReactFlow nodes={nodes} edges={edges} fitView proOptions={{ hideAttribution: true }}>
        <Background gap={20} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
