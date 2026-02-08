"use client";

import { useState, useEffect } from "react";
import { getLastInventoryUpdate } from "@/lib/inventoryUpdate";

export default function DashboardFooter() {
  const [lastUpdate, setLastUpdate] = useState("8/02/2026 11:45 am");

  useEffect(() => {
    const update = () => setLastUpdate(getLastInventoryUpdate());
    update();
    window.addEventListener("mibarra-inventory-update-changed", update);
    return () => window.removeEventListener("mibarra-inventory-update-changed", update);
  }, []);

  return (
    <div className="bg-apple-surface border-t border-apple-border px-2 py-1 sm:px-3 sm:py-1.5 flex-shrink-0">
      <div className="flex flex-row items-center justify-between gap-1 text-[8px] sm:text-[10px] text-apple-text2 min-h-[24px]">
        <div className="flex items-center gap-1 min-w-0 truncate">
          <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-apple-success rounded-full animate-pulse flex-shrink-0" />
          <span className="truncate">Última Venta Actualizada: {lastUpdate}</span>
        </div>
        <span className="text-apple-text2/80 flex-shrink-0">Tiempo real</span>
      </div>
    </div>
  );
}
