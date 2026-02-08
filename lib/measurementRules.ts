/**
 * Regla de medida: las botellas se miden en oz, excepto la cerveza que se mide en unidades.
 */

const BEER_CATEGORY = "cerveza";

export function isMeasuredInUnits(category: string): boolean {
  return category?.toLowerCase() === BEER_CATEGORY;
}

export function getUnitLabel(category: string): string {
  return isMeasuredInUnits(category) ? "unidades" : "oz";
}

export function getUnitShortLabel(category: string): string {
  return isMeasuredInUnits(category) ? "unid" : "oz";
}

/** Para movimientos: inferir si es cerveza por bottleId (ej. "cerveza-1") */
export function isBeerBottleId(bottleId: string): boolean {
  return bottleId?.toLowerCase().startsWith(`${BEER_CATEGORY}-`) ?? false;
}
