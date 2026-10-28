export const MATCH_UNAVAILABLE_LABEL = "No disponible";

/** Hay un porcentaje válido recibido de la API (CA-10). */
export function hasMatch(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * Texto que se muestra al usuario. Respeta el valor recibido (CA-02, CA-05);
 * si no hay valor, muestra "No disponible" y no inventa nada (CA-10).
 */
export function formatMatch(value: number | null | undefined): string {
  return hasMatch(value) ? `${value}%` : MATCH_UNAVAILABLE_LABEL;
}

/** Solo para dibujar barras/donas: acota el ancho visual, no cambia el dato mostrado. */
export function clampForDisplay(value: number): number {
  return Math.min(100, Math.max(0, value));
}