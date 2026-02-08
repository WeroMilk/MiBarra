/**
 * Lectura del informe de ventas (Excel/CSV) y aplicación al inventario.
 */

import { Bottle } from "./types";
import { isMeasuredInUnits } from "./measurementRules";

const BAR_BOTTLES_KEY = "mibarra-bar-bottles";

export interface SalesRow {
  /** Nombre del producto (se hace match con bottle.name) */
  productName: string;
  /** Cantidad vendida (copas/unidades según corresponda) */
  quantitySold: number;
}

/**
 * Obtiene las botellas actuales del bar desde localStorage.
 */
export function getBarBottles(): Bottle[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(BAR_BOTTLES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Bottle[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Guarda las botellas actualizadas en localStorage.
 */
export function saveBarBottles(bottles: Bottle[]): void {
  localStorage.setItem(BAR_BOTTLES_KEY, JSON.stringify(bottles));
}

/**
 * Normaliza nombre para match (minúsculas, sin acentos, sin espacios extra).
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Encuentra la botella que mejor coincide con el nombre del producto.
 */
function findMatchingBottle(productName: string, bottles: Bottle[]): Bottle | null {
  const norm = normalizeName(productName);
  if (!norm) return null;
  // Match exacto normalizado
  const exact = bottles.find((b) => normalizeName(b.name) === norm);
  if (exact) return exact;
  // Contiene el nombre de la botella
  for (const b of bottles) {
    if (norm.includes(normalizeName(b.name)) || normalizeName(b.name).includes(norm)) return b;
  }
  return null;
}

const ML_TO_OZ = 0.033814;

/**
 * Aplica ventas al inventario: descuenta por cada fila de venta.
 * portionOz o portionUnits es lo que se descuenta por cada "venta" (1 cobro = 1 porción).
 */
export interface ApplySalesOptions {
  bottles: Bottle[];
  sales: SalesRow[];
  /** Oz a descontar por venta (licores). Si no se usa, se usa portionUnits para cerveza. */
  portionOz?: number;
  /** Unidades a descontar por venta (cerveza). */
  portionUnits?: number;
  /** Por botella: (bottle) => oz o unidades por venta. Si no se da, se usa portionOz/portionUnits global. */
  getPortion?: (bottle: Bottle) => number;
}

export interface ApplySalesResult {
  updatedBottles: Bottle[];
  applied: { bottleName: string; deducted: number; unit: "oz" | "units"; matched: boolean }[];
  unmatched: string[];
}

export function applySalesToInventory(options: ApplySalesOptions): ApplySalesResult {
  const { bottles, sales, portionOz = 1, portionUnits = 1, getPortion } = options;
  const updated = bottles.map((b) => ({ ...b }));
  const applied: ApplySalesResult["applied"] = [];
  const unmatched: string[] = [];

  for (const row of sales) {
    const bottle = findMatchingBottle(row.productName, updated);
    if (!bottle) {
      unmatched.push(row.productName);
      continue;
    }
    const portion = getPortion ? getPortion(bottle) : isMeasuredInUnits(bottle.category) ? portionUnits : portionOz;
    const toDeduct = row.quantitySold * portion;
    const index = updated.findIndex((b) => b.id === bottle.id);
    if (index === -1) continue;

    const b = updated[index];
    const useUnits = isMeasuredInUnits(b.category);

    if (useUnits) {
      const current = b.currentUnits ?? 0;
      const newUnits = Math.max(0, current - Math.round(toDeduct));
      const capacity = b.sizeUnits ?? 100;
      updated[index] = {
        ...b,
        currentUnits: newUnits,
        currentOz: capacity > 0 ? (newUnits / capacity) * b.size : 0,
      };
      applied.push({ bottleName: b.name, deducted: toDeduct, unit: "units", matched: true });
    } else {
      const currentOz = b.currentOz * ML_TO_OZ;
      const newOz = Math.max(0, currentOz - toDeduct);
      updated[index] = {
        ...b,
        currentOz: newOz / ML_TO_OZ,
      };
      applied.push({ bottleName: b.name, deducted: toDeduct, unit: "oz", matched: true });
    }
  }

  return { updatedBottles: updated, applied, unmatched };
}

/**
 * Convierte la primera hoja de un libro XLSX en filas de ventas.
 * Heurística: busca columnas que parezcan "producto/nombre" y "cantidad/vendido".
 * Cuando tengas el formato de Soft Restaurant, ajustamos nombres de columnas aquí.
 */
export function sheetToSalesRows(firstSheet: { [key: string]: unknown }[]): SalesRow[] {
  if (!firstSheet || firstSheet.length === 0) return [];
  const rows: SalesRow[] = [];
  const headers = Object.keys(firstSheet[0] || {}).map((h) => String(h).toLowerCase());

  const nameKey = headers.find((h) => /producto|nombre|item|articulo|descripcion|name|product/.test(h)) ?? headers[0];
  const qtyKey =
    headers.find((h) => /cantidad|vendido|venta|qty|quantity|unidades|sales/.test(h)) ?? headers[Math.min(1, headers.length - 1)];

  for (const row of firstSheet) {
    const rawName = row[nameKey] ?? row[Object.keys(row)[0]];
    const rawQty = row[qtyKey] ?? row[Object.keys(row)[1]];
    const name = typeof rawName === "string" ? rawName.trim() : String(rawName ?? "").trim();
    const qty = typeof rawQty === "number" ? rawQty : parseFloat(String(rawQty ?? "0").replace(",", "."));
    if (name && !Number.isNaN(qty) && qty > 0) {
      rows.push({ productName: name, quantitySold: qty });
    }
  }
  return rows;
}
