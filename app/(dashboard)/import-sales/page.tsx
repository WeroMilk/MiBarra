"use client";

import { useState, useCallback } from "react";
import { FileSpreadsheet, Upload, CheckCircle, AlertCircle } from "lucide-react";
import {
  getBarBottles,
  saveBarBottles,
  applySalesToInventory,
  sheetToSalesRows,
  type SalesRow,
} from "@/lib/salesImport";
import { setLastInventoryUpdate } from "@/lib/inventoryUpdate";
import { movementsService } from "@/lib/movements";
import { demoAuth } from "@/lib/demoAuth";

export default function ImportSalesPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [appliedCount, setAppliedCount] = useState(0);
  const [unmatchedCount, setUnmatchedCount] = useState(0);
  const [detailRows, setDetailRows] = useState<string[]>([]);

  const processFile = useCallback(async (file: File) => {
    setStatus("loading");
    setMessage("");
    setDetailRows([]);

    try {
      const XLSX = await import("xlsx");
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        setStatus("error");
        setMessage("El archivo no tiene hojas.");
        return;
      }
      const sheet = workbook.Sheets[firstSheetName];
      const json: { [key: string]: unknown }[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      const sales: SalesRow[] = sheetToSalesRows(json);
      if (sales.length === 0) {
        setStatus("success");
        setMessage("Archivo leído. No se encontraron filas de ventas (revisa que haya columnas tipo 'producto/nombre' y 'cantidad').");
        return;
      }

      const bottles = getBarBottles();
      if (bottles.length === 0) {
        setStatus("error");
        setMessage("No hay inventario cargado. Primero configura las botellas en Mi Barra (Selecciona Tu Inventario).");
        return;
      }

      // Porción por defecto: 1 oz para licores, 1 unidad para cerveza (MVP)
      const result = applySalesToInventory({
        bottles,
        sales,
        portionOz: 1,
        portionUnits: 1,
      });

      saveBarBottles(result.updatedBottles);
      const now = new Date();
      const dateStr = now.toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      setLastInventoryUpdate(dateStr);

      movementsService.add({
        type: "sales_import",
        bottleId: "_",
        bottleName: "Importar ventas",
        newValue: result.applied.length,
        userName: demoAuth.getCurrentUser()?.name ?? "Usuario",
        description: `${result.applied.length} ventas aplicadas al inventario`,
      });

      setAppliedCount(result.applied.length);
      setUnmatchedCount(result.unmatched.length);
      setDetailRows(
        result.applied.slice(0, 15).map((a) => `${a.bottleName}: -${a.deducted.toFixed(1)} ${a.unit}`)
      );
      if (result.unmatched.length > 0) {
        setDetailRows((prev) => [...prev, `Sin match: ${result.unmatched.slice(0, 5).join(", ")}${result.unmatched.length > 5 ? "…" : ""}`]);
      }

      setStatus("success");
      setMessage(
        `Archivo leído. ${result.applied.length} ventas aplicadas al inventario. Base de datos actualizada.`
      );
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Error al leer el archivo. ¿Es un Excel o CSV válido?");
    }
  }, []);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
    e.target.value = "";
  };

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-apple-surface border border-apple-border">
            <FileSpreadsheet className="w-8 h-8 text-apple-accent" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-apple-text">Importar informe de ventas</h2>
            <p className="text-sm text-apple-text2">
              Sube el Excel o CSV de ventas para descontar las ventas del inventario.
            </p>
          </div>
        </div>

        <div className="bg-apple-surface rounded-xl border border-apple-border p-4 space-y-3">
          <p className="text-sm text-apple-text2">
            Flujo: tener inventario en Mi Barra → configurar porción (oz o unidades por cobro) → importar este archivo → revisar cada botella con ✓ o ✗.
          </p>
          <label className="flex flex-col items-center justify-center gap-2 py-6 px-4 border-2 border-dashed border-apple-border rounded-xl hover:bg-apple-bg transition-colors cursor-pointer">
            <Upload className="w-10 h-10 text-apple-text2" />
            <span className="text-sm font-medium text-apple-text">Elegir archivo Excel o CSV</span>
            <span className="text-xs text-apple-text2">.xlsx, .xls o .csv</span>
            <input
              id="import-sales-file"
              name="salesFile"
              type="file"
              accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
              onChange={onInputChange}
              className="hidden"
            />
          </label>
        </div>

        {status === "loading" && (
          <div className="flex items-center gap-2 text-apple-text2">
            <span className="inline-block w-4 h-4 border-2 border-apple-accent border-t-transparent rounded-full animate-spin" />
            Leyendo archivo…
          </div>
        )}

        {status === "success" && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">Listo</span>
            </div>
            <p className="text-sm text-green-700">{message}</p>
            {detailRows.length > 0 && (
              <ul className="text-xs text-green-700 list-disc list-inside space-y-0.5 max-h-40 overflow-y-auto">
                {detailRows.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {status === "error" && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{message}</p>
          </div>
        )}

        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <h3 className="font-semibold text-blue-800 text-sm mb-1">Formato del archivo</h3>
          <p className="text-xs text-blue-700">
            La página detecta columnas que parezcan &quot;producto&quot; o &quot;nombre&quot; y &quot;cantidad&quot; o &quot;vendido&quot;. Si tu archivo tiene otras columnas, puedes dejarlo con columnas estándar (producto, cantidad vendida) y subirlo aquí.
          </p>
        </div>
      </div>
    </div>
  );
}
