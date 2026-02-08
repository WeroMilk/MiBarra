"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { EMPLOYEES } from "@/lib/employeeAuth";
import { getLastInventoryUpdate, setLastInventoryUpdate } from "@/lib/inventoryUpdate";
import { movementsService } from "@/lib/movements";
import { demoAuth } from "@/lib/demoAuth";
import { loadBarBottles } from "@/lib/barStorage";
import { buildOrderReport } from "@/lib/orderReport";
import { Lock, Calendar, Package, ShoppingCart, Download, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const WHATSAPP_RECIPIENTS = [
  { label: "6623501632 - Encargado de Compras", value: "6623501632 - Encargado de Compras" },
];

function extractPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits.startsWith("52") ? digits : "52" + digits;
}

export default function ConfigPage() {
  const [lastUpdate, setLastUpdate] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderReportText, setOrderReportText] = useState("");
  const [orderRecipient, setOrderRecipient] = useState(WHATSAPP_RECIPIENTS[0]?.value ?? "");

  useEffect(() => {
    setLastUpdate(getLastInventoryUpdate());
  }, []);

  const handleGenerateOrder = () => {
    const bottles = loadBarBottles();
    if (bottles.length === 0) {
      alert("No hay botellas en tu inventario. Añade botellas en Mi inventario primero.");
      return;
    }
    const { text } = buildOrderReport(bottles);
    setOrderReportText(text);
    setOrderRecipient(WHATSAPP_RECIPIENTS[0]?.value ?? "");
    setShowOrderModal(true);
  };

  const handleDownloadOrder = () => {
    const name = `pedido-mibarra-${new Date().toISOString().slice(0, 16).replace("T", "-").replace(":", "")}.txt`;
    const blob = new Blob([orderReportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSendWhatsApp = () => {
    const phone = extractPhone(orderRecipient);
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(orderReportText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setShowOrderModal(false);
  };

  const handleSaveLastUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (lastUpdate.trim()) {
      setLastInventoryUpdate(lastUpdate.trim());
      movementsService.add({
        type: "last_update_date",
        bottleId: "_",
        bottleName: "Configuración",
        newValue: 0,
        userName: demoAuth.getCurrentUser()?.name ?? "Usuario",
        description: `Fecha de última actualización del inventario: ${lastUpdate.trim()}`,
      });
      alert("Fecha de última actualización guardada.");
    }
  };

  return (
    <div className="h-full min-h-0 flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center px-4 py-2 sm:py-3">
        <div className="w-full max-w-lg flex flex-col gap-2 sm:gap-2.5 flex-shrink-0">
          <div className="flex-shrink-0">
            <h2 className="text-base sm:text-lg font-semibold text-apple-text">Configuraciones</h2>
            <p className="text-[11px] sm:text-xs text-apple-text2">Ajustes del bar y contraseñas de empleados.</p>
          </div>

          {/* Contraseña de empleado */}
          <section className="bg-apple-surface rounded-xl border border-apple-border p-2 sm:p-2.5 flex-shrink-0">
            <div className="flex items-center gap-1.5 mb-1">
              <Lock className="w-3.5 h-3.5 text-apple-accent flex-shrink-0" />
              <h3 className="font-semibold text-apple-text text-xs sm:text-sm">Contraseña de empleado</h3>
            </div>
            <p className="text-[11px] text-apple-text2 mb-1.5 leading-snug">
              Cada empleado tiene contraseña. En Mi Barra queda registrado en Movimientos.
            </p>
            <div className="space-y-1">
              {EMPLOYEES.map((emp) => (
                <div key={emp.id} className="flex items-center justify-between gap-2 px-2 py-1 bg-apple-bg rounded-lg border border-apple-border">
                  <span className="text-[11px] sm:text-xs font-medium text-apple-text">{emp.label}</span>
                  <code className="text-[11px] font-mono text-apple-text2">
                    {showPassword ? emp.password : "••••••••"}
                  </code>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="mt-1.5 w-full px-2 py-1 text-[11px] sm:text-xs bg-apple-accent text-white rounded-lg hover:opacity-90"
            >
              {showPassword ? "Ocultar contraseñas" : "Ver contraseñas"}
            </button>
          </section>

          {/* Última actualización del inventario */}
          <section className="bg-apple-surface rounded-xl border border-apple-border p-2 sm:p-2.5 flex-shrink-0">
            <div className="flex items-center gap-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5 text-apple-accent flex-shrink-0" />
              <h3 className="font-semibold text-apple-text text-xs sm:text-sm">Última actualización del inventario</h3>
            </div>
            <p className="text-[11px] text-apple-text2 mb-1.5">Fecha en el footer (ej. última carga Excel).</p>
            <form onSubmit={handleSaveLastUpdate} className="flex flex-col sm:flex-row gap-1.5">
              <input
                id="config-last-update"
                name="lastInventoryUpdate"
                type="text"
                value={lastUpdate}
                onChange={(e) => setLastUpdate(e.target.value)}
                placeholder="Ej: 8/02/2026 11:45 am"
                className="flex-1 min-w-0 px-2 py-1.5 bg-apple-bg border border-apple-border rounded-lg text-xs sm:text-sm text-apple-text placeholder-apple-text2 focus:outline-none focus:ring-2 focus:ring-apple-accent"
              />
              <button type="submit" className="px-3 py-1.5 bg-apple-accent text-white rounded-lg hover:opacity-90 text-[11px] sm:text-xs font-medium flex-shrink-0">
                Guardar
              </button>
            </form>
          </section>

          {/* Generar pedido */}
          <section className="bg-apple-surface rounded-xl border border-apple-border p-2 sm:p-2.5 flex-shrink-0">
            <div className="flex items-center gap-1.5 mb-1">
              <ShoppingCart className="w-3.5 h-3.5 text-apple-accent flex-shrink-0" />
              <h3 className="font-semibold text-apple-text text-xs sm:text-sm">Generar pedido</h3>
            </div>
            <p className="text-[11px] text-apple-text2 mb-1.5 leading-snug">
              Genera un texto con lo que falta por pedir (unidades) y las botellas por debajo del 25%. Envíalo por WhatsApp al encargado de compras para mantener la barra surtida.
            </p>
            <button
              type="button"
              onClick={handleGenerateOrder}
              className="inline-flex items-center justify-center gap-1.5 w-full sm:w-auto px-3 py-2 bg-apple-accent text-white text-xs sm:text-sm font-medium rounded-xl hover:opacity-90 transition-opacity"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Generar pedido
            </button>
          </section>

          {/* Mi inventario */}
          <section className="bg-apple-surface rounded-xl border border-apple-border p-2 sm:p-2.5 flex-shrink-0">
            <div className="flex items-center gap-1.5 mb-1">
              <Package className="w-3.5 h-3.5 text-apple-accent flex-shrink-0" />
              <h3 className="font-semibold text-apple-text text-xs sm:text-sm">Mi inventario</h3>
            </div>
            <p className="text-[11px] text-apple-text2 mb-1.5 leading-snug">
              Las bebidas que elijas aparecen en Mi Barra. Añade o quita botellas cuando quieras.
            </p>
            <Link
              href="/select-bottles"
              className="inline-flex items-center justify-center gap-1.5 w-full sm:w-auto px-3 py-2 bg-apple-accent text-white text-xs sm:text-sm font-medium rounded-xl hover:opacity-90 transition-opacity"
            >
              <Package className="w-3.5 h-3.5" />
              Selecciona tu inventario
            </Link>
          </section>
        </div>
      </div>

      {/* Modal Generar pedido */}
      <AnimatePresence>
        {showOrderModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowOrderModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-apple-surface rounded-2xl border border-apple-border shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col"
            >
              <div className="p-4 border-b border-apple-border flex-shrink-0">
                <h3 className="text-lg font-semibold text-apple-text">Generar pedido</h3>
                <p className="text-xs text-apple-text2 mt-0.5">Vista previa del texto. Descárgalo o envíalo por WhatsApp.</p>
              </div>
              <div className="p-4 flex-1 min-h-0 overflow-hidden flex flex-col gap-3">
                <label className="text-xs font-medium text-apple-text">
                  ¿A quién enviarlo?
                </label>
                <select
                  id="order-recipient"
                  name="orderRecipient"
                  value={orderRecipient}
                  onChange={(e) => setOrderRecipient(e.target.value)}
                  className="w-full px-3 py-2 bg-apple-bg border border-apple-border rounded-xl text-sm text-apple-text focus:outline-none focus:ring-2 focus:ring-apple-accent"
                >
                  {WHATSAPP_RECIPIENTS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <label className="text-xs font-medium text-apple-text">
                  Vista previa
                </label>
                <textarea
                  readOnly
                  value={orderReportText}
                  rows={12}
                  className="w-full px-3 py-2 bg-apple-bg border border-apple-border rounded-xl text-xs sm:text-sm text-apple-text font-mono resize-none"
                />
              </div>
              <div className="p-4 border-t border-apple-border flex flex-wrap gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2 rounded-xl border border-apple-border text-apple-text text-sm font-medium hover:bg-apple-bg transition-colors"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={handleDownloadOrder}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-apple-accent text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <Download className="w-4 h-4" />
                  Descargar .txt
                </button>
                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Enviar por WhatsApp
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
