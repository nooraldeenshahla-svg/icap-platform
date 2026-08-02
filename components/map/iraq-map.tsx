"use client";

import * as React from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { GOVERNORATE_COORDS } from "@/lib/constants/governorate-coords";
import { CONFLICT_TYPE_LABELS } from "@/lib/constants/conflict-type-labels";
import { useAppStore } from "@/lib/store";
import type { Conflict } from "@/types/conflict";

const TYPE_COLORS: Record<string, string> = {
  land_dispute: "#b96e34", water_resources: "#2f9c9c", tribal: "#8a5cb9",
  sectarian: "#b93b2f", political: "#3b6fb9", economic: "#cc8748",
  security: "#4a4a4a", administrative_boundary: "#7a7a2f", returnee_idp: "#22635c",
  resource_sharing: "#5c9c2f", governance: "#2f5cb9", other: "#8a8a8a",
};

export function IraqMap({ conflicts }: { conflicts: Conflict[] }) {
  const locale = useAppStore((s) => s.locale);
  const isAr = locale === "ar";

  const points = conflicts
    .map((c) => {
      const lat = c.location?.lat;
      const lng = c.location?.lng;
      const coords: [number, number] | undefined =
        lat && lng ? [lat, lng] : GOVERNORATE_COORDS[c.location?.governorate ?? ""];
      return coords ? { conflict: c, coords } : null;
    })
    .filter((p): p is { conflict: Conflict; coords: [number, number] } => p !== null);

  return (
    <div className="h-[560px] w-full overflow-hidden rounded-lg border border-border">
      <MapContainer center={[33.3, 43.7]} zoom={6} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.map(({ conflict, coords }) => (
          <CircleMarker
            key={conflict.id}
            center={coords}
            radius={9}
            pathOptions={{
              color: TYPE_COLORS[conflict.conflictType] ?? "#8a8a8a",
              fillColor: TYPE_COLORS[conflict.conflictType] ?? "#8a8a8a",
              fillOpacity: 0.75,
              weight: 2,
            }}
          >
            <Popup>
              <div style={{ fontFamily: "sans-serif", minWidth: 160 }}>
                <strong>{conflict.name}</strong>
                <div style={{ fontSize: 12, marginTop: 4 }}>
                  {conflict.location?.governorate}
                  <br />
                  {isAr ? CONFLICT_TYPE_LABELS[conflict.conflictType].ar : CONFLICT_TYPE_LABELS[conflict.conflictType].en}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
