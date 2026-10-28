import { Applicant } from "../types/applicant";

/* ============================================================
   CONFIGURACIÓN
   - Mientras no exista el endpoint: deja NEXT_PUBLIC_USE_MOCK sin definir (usa mock).
   - Cuando exista: en .env.local pon
       NEXT_PUBLIC_USE_MOCK=false
       NEXT_PUBLIC_API_URL=http://localhost:3001
   ============================================================ */
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

// Solo para probar los criterios con datos de prueba:
//   "ok"    -> lista normal
//   "empty" -> lista vacía (CA-07)
//   "error" -> falla del servicio (CA-08 / CA-09)
type MockScenario = "ok" | "empty" | "error";
const MOCK_SCENARIO: MockScenario = "ok";

export const MATCH_ENGINE_ERROR_MESSAGE = "Error de conexión con el motor de coincidencia";

export class MatchEngineError extends Error {
  constructor(message = MATCH_ENGINE_ERROR_MESSAGE) {
    super(message);
    this.name = "MatchEngineError";
  }
}

/* ============================================================
   ÚNICO PUNTO DE ADAPTACIÓN DE LA RESPUESTA
   Si la API usa otros nombres de campo, solo se cambia aquí.
   Nunca se calcula ni se inventa el porcentaje (CA-02, CA-10).
   ============================================================ */

// Forma que se espera de la API. Si usa otros nombres de campo, ajustarlos aquí.
interface RawApplicant {
  id: string | number;
  name: string;
  email: string;
  location: string;
  experienceLevel: Applicant["experienceLevel"];
  status: Applicant["status"];
  matchPercentage?: number | null;
  skills?: Applicant["skills"];
}

function normalizeApplicant(raw: RawApplicant): Applicant {
  return {
    id: String(raw.id),
    name: raw.name,
    email: raw.email,
    location: raw.location,
    experienceLevel: raw.experienceLevel,
    status: raw.status,
    // Ejemplo si la API usara otros nombres: raw.porcentaje_match
    matchPercentage:
      typeof raw.matchPercentage === "number" && Number.isFinite(raw.matchPercentage)
        ? raw.matchPercentage
        : null,
    skills: Array.isArray(raw.skills) ? raw.skills : null,
  };
}

/* ============================================================
   DATOS DE PRUEBA
   ============================================================ */
const MOCK_APPLICANTS: Applicant[] = [
  {
    id: "app-1",
    name: "Carlos Rojas",
    email: "carlos.rojas@email.com",
    location: "Cochabamba, Bolivia",
    experienceLevel: "Senior",
    status: "Postulado",
    matchPercentage: 92,
    skills: [
      { skill: "Node.js", percentage: 100 },
      { skill: "TypeScript", percentage: 90 },
      { skill: "REST API", percentage: 80 },
      { skill: "PostgreSQL", percentage: 80 },
      { skill: "Docker", percentage: 70 },
      { skill: "AWS", percentage: 60 },
    ],
  },
  {
    id: "app-2",
    name: "María López",
    email: "maria.lopez@email.com",
    location: "Cochabamba, Bolivia",
    experienceLevel: "Mid-Level",
    status: "En revisión",
    matchPercentage: 85,
    skills: [
      { skill: "Python", percentage: 95 },
      { skill: "FastAPI", percentage: 90 },
      { skill: "PostgreSQL", percentage: 80 },
      { skill: "Docker", percentage: 75 },
    ],
  },
  {
    id: "app-3",
    name: "Carlos Fernández",
    email: "carlos.fernandez@email.com",
    location: "Quillacollo, Cochabamba",
    experienceLevel: "Junior",
    status: "Postulado",
    matchPercentage: 68,
    skills: [
      { skill: "Python", percentage: 70 },
      { skill: "Django", percentage: 65 },
      { skill: "REST API", percentage: 70 },
      { skill: "PostgreSQL", percentage: 60 },
    ],
  },
  {
    id: "app-4",
    name: "Andrea Rojas",
    email: "andrea.rojas@email.com",
    location: "Cochabamba, Bolivia",
    experienceLevel: "Junior",
    status: "Descartado",
    matchPercentage: 45,
    skills: [
      { skill: "HTML/CSS", percentage: 80 },
      { skill: "JavaScript", percentage: 50 },
      { skill: "Python", percentage: 40 },
    ],
  },
  {
    // Caso CA-10: el motor no devolvió porcentaje
    id: "app-5",
    name: "Luis Mamani",
    email: "luis.mamani@email.com",
    location: "Sacaba, Cochabamba",
    experienceLevel: "Mid-Level",
    status: "Postulado",
    matchPercentage: null,
    skills: null,
  },
];

/* ============================================================
   SERVICIO PÚBLICO
   La interfaz solo usa esta función. Lanza MatchEngineError si falla.
   ============================================================ */
export async function getApplicantsByVacancy(vacancyId: string): Promise<Applicant[]> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    if (MOCK_SCENARIO === "error") throw new MatchEngineError();
    if (MOCK_SCENARIO === "empty") return [];
    return MOCK_APPLICANTS;
  }

  // ---------- API REAL ----------
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/v1/vacancies/${vacancyId}/applicants`, {
      // credentials: "include",                 // si usan cookies de sesión
      // headers: { Authorization: `Bearer ${token}` }, // si usan token
    });
  } catch {
    // Error de conexión (CA-08)
    throw new MatchEngineError();
  }

  // Error del servidor (CA-09)
  if (!res.ok) throw new MatchEngineError();

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new MatchEngineError();
  }

  // Si la API responde { data: [...] }, cambiar por: (data as { data: RawApplicant[] }).data
  if (!Array.isArray(data)) throw new MatchEngineError();

  return (data as RawApplicant[]).map(normalizeApplicant);
}