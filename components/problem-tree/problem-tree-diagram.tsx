"use client";

import * as React from "react";
import ReactFlow, { Background, Controls, type Node, type Edge, MarkerType, Position } from "reactflow";
import "reactflow/dist/style.css";
import { useAppStore } from "@/lib/store";
import { CAUSE_LAYER_COLOR } from "@/lib/constants/cause-effect-labels";
import type { Conflict } from "@/types/conflict";

const COPY = {
  ar: { empty: "أضف أسباباً وآثاراً أول حتى تظهر الشجرة.", core: "النزاع الرئيسي" },
  en: { empty: "Add causes and effects first to generate the tree.", core: "Core Conflict" },
};

export function ProblemTreeDiagram({ conflict }: { conflict: Conflict }) {
  const locale = useAppStore((s) => s.locale);
  const t = COPY[locale];
  // Show every cause regardless of layer (root/indirect/direct) — a cause
  // left uncategorized should still appear in the tree.
  const roots = conflict.causes;
  const effects = conflict.effects;

  const { nodes, edges } = React.useMemo<{ nodes: Node[]; edges: Edge[] }>(() => {
    const width = Math.max(roots.length, effects.length, 1) * 220;
    const cx = width / 2;

    const rootNodes: Node[] = roots.map((c, i) => ({
      id: `root-${c.id}`,
      position: { x: (i + 0.5) * (width / roots.length) - 90, y: 480 },
      data: { label: c.description },
      sourcePosition: Position.Top,
      style: nodeStyle(CAUSE_LAYER_COLOR[c.layer] ?? "#2f7d72"),
    }));

    const effectNodes: Node[] = effects.map((e, i) => ({
      id: `effect-${e.id}`,
      position: { x: (i + 0.5) * (width / effects.length) - 90, y: 0 },
      data: { label: e.description },
      targetPosition: Position.Bottom,
      style: nodeStyle("#b96e34"),
    }));

    const coreNode: Node = {
      id: "core",
      position: { x: cx - 110, y: 240 },
      data: { label: conflict.name || t.core },
      sourcePosition: Position.Top,
      targetPosition: Position.Bottom,
      style: { ...nodeStyle("#173533"), width: 220, background: "#173533", color: "#f4f1ea", fontWeight: 700 },
    };

    const rootEdges: Edge[] = roots.map((c) => ({
      id: `e-root-${c.id}`, source: `root-${c.id}`, target: "core",
      style: { stroke: "#2f7d72", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed },
    }));
    const effectEdges: Edge[] = effects.map((e) => ({
      id: `e-effect-${e.id}`, source: "core", target: `effect-${e.id}`,
      style: { stroke: "#b96e34", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed },
    }));

    return { nodes: [coreNode, ...rootNodes, ...effectNodes], edges: [...rootEdges, ...effectEdges] };
  }, [roots, effects, conflict.name, t.core]);

  if (roots.length === 0 && effects.length === 0) {
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

function nodeStyle(color: string) {
  return {
    width: 200, borderRadius: 10, border: `2px solid ${color}`, background: "white",
    padding: 10, fontSize: 12, textAlign: "center" as const, color: "#1a1a1a",
  };
}
