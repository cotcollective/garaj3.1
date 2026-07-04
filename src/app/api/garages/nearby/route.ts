/* ------------------------------------------------------------------ */
/*  GARAJ V3 — GET /api/garages/nearby                                */
/*  RPC get_nearby_garages avec filtre specialty                       */
/*  Query params: lat, lng, radius (km), specialty (optionnel)         */
/*  Mode démo: données mockées                                        */
/* ------------------------------------------------------------------ */

import { NextRequest, NextResponse } from "next/server";

export interface NearbyGarage {
  id: string;
  name: string;
  phone: string;
  postalCode: string;
  city: string;
  lat: number;
  lng: number;
  distanceKm: number;
  specialties: string[];
  rating: number;
  reviewCount: number;
  pricingMin: number | null;
  pricingMax: number | null;
  status: "active" | "pending" | "rejected";
  availableSlots: number;
}

const MOCK_GARAGES: NearbyGarage[] = [
  {
    id: "garage-001",
    name: "Garage Steph",
    phone: "514-555-0199",
    postalCode: "J4K 2R1",
    city: "Longueuil",
    lat: 45.54,
    lng: -73.47,
    distanceKm: 1.2,
    specialties: ["Moteur", "Freins", "Suspension", "Diagnostic", "Climatisation"],
    rating: 4.8,
    reviewCount: 247,
    pricingMin: 85,
    pricingMax: 120,
    status: "active",
    availableSlots: 5,
  },
  {
    id: "garage-002",
    name: "Mécano Pro Montréal",
    phone: "514-555-0234",
    postalCode: "H2K 1A2",
    city: "Montréal",
    lat: 45.53,
    lng: -73.55,
    distanceKm: 3.8,
    specialties: ["Moteur", "Transmission", "Électrique", "Diagnostic"],
    rating: 4.6,
    reviewCount: 189,
    pricingMin: 95,
    pricingMax: 135,
    status: "active",
    availableSlots: 3,
  },
  {
    id: "garage-003",
    name: "Auto Prestige Rive-Sud",
    phone: "450-555-0456",
    postalCode: "J4K 1N8",
    city: "Longueuil",
    lat: 45.52,
    lng: -73.45,
    distanceKm: 4.5,
    specialties: ["Freins", "Suspension", "Climatisation", "Échappement"],
    rating: 4.9,
    reviewCount: 312,
    pricingMin: 90,
    pricingMax: 140,
    status: "active",
    availableSlots: 2,
  },
  {
    id: "garage-004",
    name: "Garage du Coin Brossard",
    phone: "450-555-0789",
    postalCode: "J4W 1B2",
    city: "Brossard",
    lat: 45.46,
    lng: -73.47,
    distanceKm: 8.2,
    specialties: ["Moteur", "Freins", "Pneus", "Diagnostic"],
    rating: 4.5,
    reviewCount: 134,
    pricingMin: 75,
    pricingMax: 110,
    status: "active",
    availableSlots: 7,
  },
  {
    id: "garage-005",
    name: "Centre Auto Boucherville",
    phone: "450-555-0912",
    postalCode: "J4B 3C4",
    city: "Boucherville",
    lat: 45.59,
    lng: -73.43,
    distanceKm: 9.1,
    specialties: ["Transmission", "Électrique", "Climatisation", "Diagnostic"],
    rating: 4.7,
    reviewCount: 203,
    pricingMin: 100,
    pricingMax: 150,
    status: "active",
    availableSlots: 4,
  },
  {
    id: "garage-006",
    name: "Garage Vitesse Plus",
    phone: "514-555-0345",
    postalCode: "H1A 2B3",
    city: "Montréal-Est",
    lat: 45.58,
    lng: -73.52,
    distanceKm: 6.7,
    specialties: ["Moteur", "Performance", "Diagnostic", "Turbo"],
    rating: 4.4,
    reviewCount: 98,
    pricingMin: 110,
    pricingMax: 175,
    status: "active",
    availableSlots: 2,
  },
  {
    id: "garage-007",
    name: "Garage Familial Laval",
    phone: "450-555-0567",
    postalCode: "H7T 1C5",
    city: "Laval",
    lat: 45.56,
    lng: -73.74,
    distanceKm: 14.3,
    specialties: ["Moteur", "Freins", "Suspension", "Pneus", "Diagnostic"],
    rating: 4.3,
    reviewCount: 76,
    pricingMin: 70,
    pricingMax: 105,
    status: "active",
    availableSlots: 8,
  },
  {
    id: "garage-008",
    name: "Expert Climatisation QC",
    phone: "514-555-0678",
    postalCode: "J4K 3N2",
    city: "Longueuil",
    lat: 45.53,
    lng: -73.48,
    distanceKm: 2.9,
    specialties: ["Climatisation", "Électrique", "Diagnostic"],
    rating: 4.9,
    reviewCount: 156,
    pricingMin: 80,
    pricingMax: 130,
    status: "active",
    availableSlots: 6,
  },
];

/** Calcule la distance approximative en km (formule haversine simplifiée) */
function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") || "");
  const lng = parseFloat(searchParams.get("lng") || "");
  const radius = parseFloat(searchParams.get("radius") || "25");
  const specialty = searchParams.get("specialty")?.trim().toLowerCase() || null;

  // Si pas de coordonnées, retourner tous les garages actifs triés par rating
  if (isNaN(lat) || isNaN(lng)) {
    const sorted = [...MOCK_GARAGES]
      .filter((g) => g.status === "active")
      .filter((g) =>
        specialty
          ? g.specialties.some((s) => s.toLowerCase().includes(specialty))
          : true
      )
      .sort((a, b) => b.rating - a.rating);

    return NextResponse.json({
      garages: sorted,
      total: sorted.length,
      search: { lat: null, lng: null, radius: 25, specialty },
    });
  }

  // Calculer les distances réelles et filtrer
  const garagesWithDistance = MOCK_GARAGES
    .filter((g) => g.status === "active")
    .map((g) => {
      const dist = haversineKm(lat, lng, g.lat, g.lng);
      return { ...g, distanceKm: Math.round(dist * 10) / 10 };
    })
    .filter((g) => g.distanceKm <= radius)
    .filter((g) =>
      specialty
        ? g.specialties.some((s) => s.toLowerCase().includes(specialty))
        : true
    )
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return NextResponse.json({
    garages: garagesWithDistance,
    total: garagesWithDistance.length,
    search: { lat, lng, radius, specialty },
  });
}
