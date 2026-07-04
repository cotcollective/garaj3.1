"use client";

/* ------------------------------------------------------------------ */
/*  GARAJ V3 — GaragesMap (Leaflet wrapper)                            */
/*  Carte interactive OpenStreetMap des garages nearby                 */
/*  Lazy-loaded (ssr: false) à cause de Leaflet = browser-only        */
/* ------------------------------------------------------------------ */

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* Fix pour les markers Leaflet par défaut (404 sur Vercel/Netlify) */
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export interface GarageMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  specialties?: string[];
  rating?: number;
  distanceKm?: number;
  phone?: string;
}

export interface GaragesMapProps {
  garages: GarageMarker[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  className?: string;
}

export default function GaragesMap({
  garages,
  center = [45.5017, -73.5673], // Montréal par défaut
  zoom = 11,
  height = "400px",
  className = "",
}: GaragesMapProps) {
  // Calculer le centre optimal si on a des garages
  const [mapCenter, setMapCenter] = useState<[number, number]>(center);

  useEffect(() => {
    if (garages.length === 0) return;
    if (garages.length === 1) {
      setMapCenter([garages[0].lat, garages[0].lng]);
      return;
    }
    // Centre = moyenne des coords
    const avgLat = garages.reduce((sum, g) => sum + g.lat, 0) / garages.length;
    const avgLng = garages.reduce((sum, g) => sum + g.lng, 0) / garages.length;
    setMapCenter([avgLat, avgLng]);
  }, [garages]);

  if (garages.length === 0) {
    return (
      <div
        className={`rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 ${className}`}
        style={{ height }}
      >
        <span className="text-3xl mb-2">🗺️</span>
        <p className="text-sm">Aucun garage à afficher sur la carte</p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl overflow-hidden border border-slate-200 shadow-sm ${className}`}
      style={{ height }}
    >
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <ZoomControl position="bottomright" />
        {garages.map((g) => (
          <Marker key={g.id} position={[g.lat, g.lng]}>
            <Popup>
              <div className="text-sm">
                <h3 className="font-bold text-navy mb-1">{g.name}</h3>
                {g.specialties && g.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {g.specialties.slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                {g.distanceKm !== undefined && (
                  <p className="text-xs text-slate-500 mb-1">
                    📍 {g.distanceKm} km
                  </p>
                )}
                {g.rating !== undefined && g.rating > 0 && (
                  <p className="text-xs text-slate-500 mb-1">
                    ⭐ {g.rating.toFixed(1)}/5
                  </p>
                )}
                {g.phone && (
                  <a
                    href={`tel:${g.phone.replace(/\D/g, "")}`}
                    className="text-xs text-orange font-semibold hover:underline"
                  >
                    📞 {g.phone}
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
