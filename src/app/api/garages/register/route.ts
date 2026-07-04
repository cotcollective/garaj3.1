/* ------------------------------------------------------------------ */
/*  GARAJ V3 — POST /api/garages/register                             */
/*  Crée un garage avec statut "pending" (validation admin requise)   */
/*  Mode démo: accepte les données, retourne un mock                   */
/* ------------------------------------------------------------------ */

import { NextRequest, NextResponse } from "next/server";

export interface GarageRegisterPayload {
  name: string;
  phone: string;
  postalCode: string;
  city?: string;
  specialties: string[];
  pricingMin?: number;
  pricingMax?: number;
  smsEnabled?: boolean;
  lat?: number;
  lng?: number;
}

export interface GarageRegisterResponse {
  success: boolean;
  garage: {
    id: string;
    name: string;
    phone: string;
    postalCode: string;
    city: string;
    specialties: string[];
    pricingMin: number | null;
    pricingMax: number | null;
    smsEnabled: boolean;
    status: "pending";
    createdAt: string;
  };
  message: string;
}

export async function POST(request: NextRequest) {
  let body: GarageRegisterPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corps JSON invalide" },
      { status: 400 }
    );
  }

  // Validation basique
  const { name, phone, postalCode, specialties } = body;
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json(
      { error: "Nom du garage requis (min. 2 caractères)" },
      { status: 400 }
    );
  }
  if (!phone || typeof phone !== "string" || phone.trim().length < 10) {
    return NextResponse.json(
      { error: "Numéro de téléphone requis (min. 10 chiffres)" },
      { status: 400 }
    );
  }
  if (
    !postalCode ||
    typeof postalCode !== "string" ||
    postalCode.trim().length < 3
  ) {
    return NextResponse.json(
      { error: "Code postal requis" },
      { status: 400 }
    );
  }
  if (
    !specialties ||
    !Array.isArray(specialties) ||
    specialties.length === 0
  ) {
    return NextResponse.json(
      { error: "Au moins une spécialité requise" },
      { status: 400 }
    );
  }

  // Vérifier doublon téléphone (mock)
  if (phone === "514-555-0199") {
    return NextResponse.json(
      { error: "Un garage avec ce numéro de téléphone existe déjà" },
      { status: 409 }
    );
  }

  // Simuler la création
  const now = new Date().toISOString();
  const mockId = `garage-${Date.now().toString(36)}`;

  const response: GarageRegisterResponse = {
    success: true,
    garage: {
      id: mockId,
      name: name.trim(),
      phone: phone.trim(),
      postalCode: postalCode.trim(),
      city: body.city?.trim() || "",
      specialties: specialties.map((s) => s.trim()).filter(Boolean),
      pricingMin: body.pricingMin ?? null,
      pricingMax: body.pricingMax ?? null,
      smsEnabled: body.smsEnabled ?? true,
      status: "pending",
      createdAt: now,
    },
    message:
      "Garage enregistré avec succès! Un administrateur validera votre inscription sous 24h. Vous recevrez un SMS de confirmation.",
  };

  return NextResponse.json(response, { status: 201 });
}
