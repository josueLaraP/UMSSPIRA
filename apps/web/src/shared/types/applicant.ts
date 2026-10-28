export type ApplicantStatus = "Postulado" | "En revisión" | "Entrevistado" | "Descartado";
export type ExperienceLevel = "Junior" | "Mid-Level" | "Senior";

export interface SkillMatch {
  skill: string;
  percentage: number;
}

export interface Applicant {
  id: string;
  name: string;
  email: string;
  location: string;
  experienceLevel: ExperienceLevel;
  status: ApplicantStatus;
  /**
   * Porcentaje devuelto por el motor de coincidencia (Epic 3/5).
   * El frontend NUNCA lo calcula. Si no viene, es null (CA-10).
   */
  matchPercentage: number | null;
  /**
   * Desglose por habilidad devuelto por el motor de coincidencia.
   * null o vacío = no disponible.
   */
  skills: SkillMatch[] | null;
}