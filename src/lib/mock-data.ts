/* ------------------------------------------------------------------ */
/*  GARAJ V3 — Données mockées pour le dashboard garage              */
/*  Les vrais appels API viendront plus tard (Supabase Realtime)      */
/* ------------------------------------------------------------------ */

export type LeadScore = "CHAUD" | "TIÈDE" | "FROID";

export interface LeadHypothesis {
  hypothesis: string;
  probability: number;   // 0-100
  confidence: number;    // 0-100 (confiance IA)
}

export interface MockLead {
  id: string;
  score: LeadScore;
  vehicle: string;
  year: number;
  kilometrage: number;
  symptom: string;
  iaSummary: string;
  iaHypotheses: LeadHypothesis[];
  postalCode: string;
  city: string;
  distanceKm: number;
  complexity: number;    // 1-10
  createdAt: string;     // ISO
  budget?: string;
  clientPhone: string;
  accepted?: boolean;
  bidPlaced?: boolean;
  bidAmount?: number;
  bidDelay?: string;
}

export const MOCK_LEADS: MockLead[] = [
  {
    id: "lead-001",
    score: "CHAUD",
    vehicle: "Honda Civic",
    year: 2020,
    kilometrage: 78000,
    symptom: "Bruit de grincement quand je freine, surtout à basse vitesse. Le volant vibre un peu aussi.",
    iaSummary:
      "Suspicion plaquettes de frein usées + disques voilés. Urgence MODÉRÉE — sécurité freinage dégradée. Intervention requise dans les 2 semaines.",
    iaHypotheses: [
      { hypothesis: "Plaquettes de frein avant usées", probability: 85, confidence: 92 },
      { hypothesis: "Disques de frein voilés", probability: 60, confidence: 78 },
      { hypothesis: "Étrier de frein grippé", probability: 15, confidence: 45 },
    ],
    postalCode: "J4K 2R1",
    city: "Longueuil",
    distanceKm: 5,
    complexity: 4,
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    budget: "200-500$",
    clientPhone: "514-555-0142",
  },
  {
    id: "lead-002",
    score: "CHAUD",
    vehicle: "Toyota Corolla",
    year: 2018,
    kilometrage: 112000,
    symptom:
      "Le moteur fait un bruit de cliquetis au démarrage à froid, disparaît après 2-3 minutes. Check engine allumé depuis hier.",
    iaSummary:
      "Suspicion tensionneur de chaîne de distribution ou alternateur. Code OBD2 P0012 (calage arbre à cames). Urgence ÉLEVÉE.",
    iaHypotheses: [
      { hypothesis: "Tensionneur de chaîne de distribution", probability: 70, confidence: 85 },
      { hypothesis: "Alternateur / courroie accessoire", probability: 20, confidence: 60 },
      { hypothesis: "Pompe à eau", probability: 10, confidence: 40 },
    ],
    postalCode: "J4K 1M8",
    city: "Longueuil",
    distanceKm: 3,
    complexity: 7,
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    budget: "500$+",
    clientPhone: "514-555-0187",
  },
  {
    id: "lead-003",
    score: "CHAUD",
    vehicle: "Ford F-150",
    year: 2021,
    kilometrage: 45000,
    symptom:
      "Le truck tire à droite en freinant, et ça sent le chaud après 10 minutes d'autoroute. Bruit de frottement métallique.",
    iaSummary:
      "Suspicion étrier de frein grippé côté droit + plaquettes métal-sur-métal. Urgence ÉLEVÉE — risque sécurité immédiat.",
    iaHypotheses: [
      { hypothesis: "Étrier de frein avant droit grippé", probability: 88, confidence: 94 },
      { hypothesis: "Plaquettes de frein usées jusqu'au métal", probability: 75, confidence: 90 },
      { hypothesis: "Durite de frein obstruée", probability: 25, confidence: 55 },
    ],
    postalCode: "J4K 2T5",
    city: "Longueuil",
    distanceKm: 7,
    complexity: 5,
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    budget: "300-600$",
    clientPhone: "450-555-0234",
  },
  {
    id: "lead-004",
    score: "TIÈDE",
    vehicle: "Mazda 3",
    year: 2019,
    kilometrage: 65000,
    symptom:
      "La climatisation souffle de l'air tiède depuis hier. Le compresseur s'enclenche mais pas de froid. Aucun bruit suspect.",
    iaSummary:
      "Suspicion fuite de réfrigérant ou condenseur défectueux. Urgence FAIBLE (confort). Intervention non urgente.",
    iaHypotheses: [
      { hypothesis: "Fuite de réfrigérant (R-1234yf)", probability: 65, confidence: 80 },
      { hypothesis: "Condenseur de clim obstrué", probability: 25, confidence: 60 },
      { hypothesis: "Compresseur défaillant", probability: 10, confidence: 35 },
    ],
    postalCode: "J4K 3N2",
    city: "Longueuil",
    distanceKm: 4,
    complexity: 3,
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    budget: "200-400$",
    clientPhone: "514-555-0319",
  },
  {
    id: "lead-005",
    score: "TIÈDE",
    vehicle: "Hyundai Elantra",
    year: 2017,
    kilometrage: 95000,
    symptom:
      "Bruit de 'clong' dans la direction quand je tourne le volant à basse vitesse. Surtout dans les stationnements. Pas de voyant.",
    iaSummary:
      "Suspicion coupler intermédiaire de colonne de direction. Problème connu sur Elantra 2017-2020. Urgence MODÉRÉE.",
    iaHypotheses: [
      { hypothesis: "Coupler de colonne de direction", probability: 90, confidence: 95 },
      { hypothesis: "Biellette de direction usée", probability: 8, confidence: 40 },
      { hypothesis: "Crémaillère de direction", probability: 2, confidence: 20 },
    ],
    postalCode: "J4K 1P4",
    city: "Longueuil",
    distanceKm: 6,
    complexity: 3,
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    budget: "100-300$",
    clientPhone: "450-555-0456",
  },
  {
    id: "lead-006",
    score: "TIÈDE",
    vehicle: "Volkswagen Golf",
    year: 2022,
    kilometrage: 28000,
    symptom:
      "Voyant moteur allumé depuis 3 jours. La voiture roule normalement, aucun symptôme. Je viens de faire le plein hier.",
    iaSummary:
      "Suspicion bouchon de réservoir mal serré ou sonde O2. Urgence FAIBLE — vérifier code OBD2 en priorité.",
    iaHypotheses: [
      { hypothesis: "Bouchon de réservoir desserré / EVAP", probability: 60, confidence: 70 },
      { hypothesis: "Sonde O2 défectueuse", probability: 30, confidence: 55 },
      { hypothesis: "Catalyseur début de défaillance", probability: 10, confidence: 25 },
    ],
    postalCode: "J4K 2W8",
    city: "Longueuil",
    distanceKm: 2,
    complexity: 2,
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    budget: "<100$",
    clientPhone: "514-555-0678",
  },
  {
    id: "lead-007",
    score: "FROID",
    vehicle: "Nissan Altima",
    year: 2015,
    kilometrage: 175000,
    symptom:
      "La transmission CVT donne des à-coups à basse vitesse. Le concessionnaire veut 4000$ pour la remplacer. Je cherche un 2e avis.",
    iaSummary:
      "Suspicion transmission CVT en fin de vie (problème connu sur Altima). Urgence MODÉRÉE si le véhicule roule encore.",
    iaHypotheses: [
      { hypothesis: "Transmission CVT usée (remplacement)", probability: 70, confidence: 80 },
      { hypothesis: "Liquide de transmission dégradé", probability: 20, confidence: 50 },
      { hypothesis: "Capteur de vitesse CVT", probability: 10, confidence: 30 },
    ],
    postalCode: "J4K 2R1",
    city: "Longueuil",
    distanceKm: 5,
    complexity: 9,
    createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    budget: "Compare les prix",
    clientPhone: "514-555-0891",
  },
  {
    id: "lead-008",
    score: "FROID",
    vehicle: "Chevrolet Cruze",
    year: 2013,
    kilometrage: 210000,
    symptom:
      "Bruit de plastique qui vibre dans la porte conducteur quand je roule sur l'autoroute. Rien de mécanique, juste tannant.",
    iaSummary:
      "Suspicion clip de panneau de porte desserré ou isolation phonique décollée. Urgence NULLE (confort). Aucun impact sécurité.",
    iaHypotheses: [
      { hypothesis: "Clip de fixation de panneau de porte", probability: 80, confidence: 85 },
      { hypothesis: "Haut-parleur de porte desserré", probability: 15, confidence: 50 },
      { hypothesis: "Isolation phonique décollée", probability: 5, confidence: 30 },
    ],
    postalCode: "J4K 3L9",
    city: "Longueuil",
    distanceKm: 8,
    complexity: 1,
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    clientPhone: "450-555-1011",
  },
];

export const MOCK_GARAGE_STATS = {
  leadsRecus: 12,
  leadsAcceptes: 8,
  bidsPlaces: 6,
  bidsGagnes: 4,
  revenusEstimes: 2650,
  tauxConversion: 67,
  tempsReponseMoyen: "18 min",
};

export const MOCK_GARAGE_PROFILE = {
  name: "Garage Steph",
  phone: "514-555-0199",
  postalCode: "J4K 2R1",
  city: "Longueuil",
  specialties: ["Moteur", "Freins", "Suspension", "Diagnostic", "Climatisation"],
  smsEnabled: true,
  maxLeadsPerDay: 5,
};
