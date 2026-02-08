/**
 * Porción por servicio por categoría (oz o unidades).
 * Misma lógica que PortionSelector: localStorage "portion-{category}" o valor por defecto.
 */

const PORTION_KEY = (category: string) => `portion-${category}`;

const DEFAULT_PORTIONS: Record<string, number> = {
  vodka: 1,
  tequila: 1.5,
  whiskey: 2,
  whisky: 2,
  ron: 1.5,
  gin: 1,
  ginebra: 1,
  cerveza: 1,
  mezcal: 1.5,
  vino: 5,
  champagne: 5,
  brandy: 2,
  licores: 1,
  pisco: 1.5,
  sidra: 5,
};

export function getPortionForCategory(category: string): number {
  if (typeof window === "undefined") {
    return DEFAULT_PORTIONS[category?.toLowerCase()] ?? 1;
  }
  const saved = localStorage.getItem(PORTION_KEY(category));
  if (saved) {
    const n = parseFloat(saved);
    if (!Number.isNaN(n) && n > 0) return n;
  }
  return DEFAULT_PORTIONS[category?.toLowerCase()] ?? 1;
}
