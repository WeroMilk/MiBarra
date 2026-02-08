"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/Auth/AuthGuard";
import { categories, defaultBottles } from "@/lib/bottlesData";
import { saveBarBottles } from "@/lib/barStorage";
import { movementsService } from "@/lib/movements";
import { demoAuth } from "@/lib/demoAuth";
import { Bottle } from "@/lib/types";
import { Check, ChevronRight, ChevronLeft } from "lucide-react";
import LogoutButton from "@/components/Auth/LogoutButton";
import BottleCard from "@/components/SelectBottles/BottleCard";
import { motion } from "framer-motion";

/** Móvil muy pequeño: 6 | Móvil: 8 | Tablet: 8 | Desktop: 10 */
function getItemsPerPage(width: number) {
  if (width < 400) return 6;
  if (width < 768) return 8;
  if (width < 1024) return 8; // tablet: 8 items para grid equilibrado (2 filas de 4)
  return 10;
}

export default function SelectBottlesPage() {
  const [selectedBottles, setSelectedBottles] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const router = useRouter();

  useEffect(() => {
    const update = () => setItemsPerPage(getItemsPerPage(typeof window !== "undefined" ? window.innerWidth : 1024));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const toggleBottle = (bottleId: string) => {
    const newSelected = new Set(selectedBottles);
    if (newSelected.has(bottleId)) {
      newSelected.delete(bottleId);
    } else {
      newSelected.add(bottleId);
    }
    setSelectedBottles(newSelected);
  };

  const toggleCategory = (categoryId: string) => {
    const categoryBottles = defaultBottles
      .filter((b) => b.category === categoryId)
      .map((b) => b.id);

    const newSelected = new Set(selectedBottles);
    const allSelected = categoryBottles.every((id) => newSelected.has(id));

    if (allSelected) {
      categoryBottles.forEach((id) => newSelected.delete(id));
    } else {
      categoryBottles.forEach((id) => newSelected.add(id));
    }
    setSelectedBottles(newSelected);
  };

  const handleContinue = () => {
    if (selectedBottles.size === 0) {
      alert("Por favor selecciona al menos una botella");
      return;
    }
    const barBottles = defaultBottles.filter((b) => selectedBottles.has(b.id));
    saveBarBottles(barBottles);
    movementsService.add({
      type: "inventory_list_updated",
      bottleId: "_",
      bottleName: "Inventario",
      newValue: barBottles.length,
      userName: demoAuth.getCurrentUser()?.name ?? "Usuario",
      description: `Selección de botellas actualizada: ${barBottles.length} botellas`,
    });
    router.push("/bar");
  };

  const filteredBottles = selectedCategory
    ? defaultBottles.filter((b) => b.category === selectedCategory)
    : defaultBottles;

  const totalPages = Math.max(1, Math.ceil(filteredBottles.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBottles = filteredBottles.slice(startIndex, startIndex + itemsPerPage);

  // Ajustar página actual si al cambiar itemsPerPage o categoría ya no es válida
  useEffect(() => {
    setCurrentPage((p) => Math.min(p, totalPages));
  }, [itemsPerPage, selectedCategory, totalPages]);

  const goToPrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goToNextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  return (
    <AuthGuard>
      {/* Contenedor flex: altura fija, sin scroll de página. Solo el área de boxes hace scroll. */}
      <div
        className="h-[100dvh] min-h-screen bg-apple-bg overflow-hidden flex flex-col"
        style={{
          paddingLeft: "env(safe-area-inset-left, 0px)",
          paddingRight: "env(safe-area-inset-right, 0px)",
        }}
      >
        {/* 1. Header fijo: no se mueve al hacer scroll */}
        <div
          className="bg-apple-surface border-b border-apple-border px-3 py-2.5 min-[380px]:px-4 min-[380px]:py-3 sm:px-5 sm:py-4 md:px-6 flex-shrink-0 z-10"
          style={{ paddingTop: "calc(0.625rem + env(safe-area-inset-top, 0px))" }}
        >
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 min-w-0">
            <div className="min-w-0 flex-1">
              <h1 className="text-base min-[380px]:text-xl sm:text-2xl md:text-3xl font-semibold text-apple-text truncate">
                Selecciona Tu Inventario
              </h1>
              <p className="text-[11px] min-[380px]:text-xs sm:text-sm text-apple-text2 mt-0.5 sm:mt-1 truncate">
                {selectedBottles.size} {selectedBottles.size === 1 ? "botella seleccionada" : "botellas seleccionadas"}
              </p>
            </div>
            <LogoutButton />
          </div>
        </div>

        {/* 2. Categorías fijas: no se mueven al hacer scroll */}
        <div className="bg-apple-bg flex-shrink-0 px-3 min-[380px]:px-4 sm:px-5 md:px-6 pt-3 min-[380px]:pt-4 sm:pt-5 pb-2">
          <div className="max-w-6xl mx-auto w-full min-w-0">
            <div className="flex items-center gap-1.5 min-[380px]:gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 min-w-0 overscroll-x-contain" style={{ WebkitOverflowScrolling: "touch" }}>
              <button
                onClick={() => handleCategoryChange(null)}
                className={`flex-shrink-0 px-3 py-1.5 min-[380px]:px-4 min-[380px]:py-2 rounded-full text-xs min-[380px]:text-sm font-medium transition-all ${
                  selectedCategory === null
                    ? "bg-apple-accent text-white"
                    : "bg-apple-surface border border-apple-border text-apple-text hover:bg-apple-bg"
                }`}
              >
                Todas
              </button>
              {categories.map((category) => {
                const categoryBottles = defaultBottles.filter(
                  (b) => b.category === category.id
                );
                const selectedCount = categoryBottles.filter((b) =>
                  selectedBottles.has(b.id)
                ).length;

                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`flex-shrink-0 px-3 py-1.5 min-[380px]:px-4 min-[380px]:py-2 rounded-full text-xs min-[380px]:text-sm font-medium transition-all relative whitespace-nowrap ${
                      selectedCategory === category.id
                        ? "bg-apple-accent text-white"
                        : "bg-apple-surface border border-apple-border text-apple-text hover:bg-apple-bg"
                    }`}
                  >
                    {category.name}
                    {selectedCount > 0 && (
                      <span className={`ml-1.5 min-[380px]:ml-2 px-1.5 py-0.5 rounded-full text-[10px] min-[380px]:text-xs ${
                        selectedCategory === category.id
                          ? "bg-white/20 text-white"
                          : "bg-apple-accent text-white"
                      }`}>
                        {selectedCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. Solo esta zona hace scroll: los boxes. Header y categorías arriba y línea gris abajo quedan fijos. */}
        {/* Móvil: solo los boxes hacen scroll. Desktop: sin scroll, solo se cambia con paginación. */}
        <div
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden w-full md:overflow-y-hidden md:overflow-hidden"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div
            className="max-w-6xl mx-auto px-3 min-[380px]:px-4 sm:px-5 md:px-6 w-full min-w-0 pb-[calc(260px+env(safe-area-inset-bottom,0px))] md:pb-[calc(300px+env(safe-area-inset-bottom,0px))] pt-1"
          >
            {filteredBottles.length === 0 ? (
              <div className="text-center py-8 min-[380px]:py-12 px-4">
                <p className="text-sm min-[380px]:text-base text-apple-text2">No hay botellas en esta categoría</p>
              </div>
            ) : (
              <div className="w-full min-w-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5 min-[380px]:gap-2 sm:gap-3 md:gap-3 lg:gap-4 w-full min-w-0 [grid-auto-rows:minmax(118px,1fr)] min-[380px]:[grid-auto-rows:minmax(124px,1fr)] sm:[grid-auto-rows:minmax(132px,1fr)] md:[grid-auto-rows:minmax(140px,1fr)]">
                  {paginatedBottles.map((bottle, index) => (
                    <motion.div
                      key={bottle.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="min-w-0 min-h-0 flex"
                    >
                      <BottleCard
                        bottle={bottle}
                        isSelected={selectedBottles.has(bottle.id)}
                        onClick={() => toggleBottle(bottle.id)}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer fijo: sin encimar, safe area, scroll en paginación si hay muchas páginas */}
        <footer
          className="fixed bottom-0 left-0 right-0 z-20 flex flex-col flex-shrink-0 bg-apple-bg border-t border-apple-border shadow-[0_-2px_10px_rgba(0,0,0,0.06)] pt-2 sm:pt-2 md:pt-3 lg:pt-4 pb-[max(1.25rem,calc(env(safe-area-inset-bottom,0px)+0.75rem))]"
          style={{
            paddingLeft: "env(safe-area-inset-left, 0px)",
            paddingRight: "env(safe-area-inset-right, 0px)",
          }}
        >
          {/* 1. Paginación + Seleccionar Todos */}
          {filteredBottles.length > 0 && (
            <div className="w-full py-2 px-3 min-[380px]:px-4 sm:px-5 md:px-6 flex-shrink-0">
              <div className="max-w-6xl mx-auto flex flex-col items-center justify-center gap-3 sm:gap-4 w-full min-w-0">
                {/* Móvil: estilo app (Anterior | 4 de 12 | Siguiente). Desktop: numeración completa */}
                <div className="flex items-center justify-center gap-2 w-full min-w-0 py-1">
                  <button
                    onClick={goToPrevPage}
                    disabled={currentPage <= 1}
                    className="w-10 h-10 rounded-xl border border-apple-border bg-apple-surface text-apple-text flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none hover:bg-apple-bg active:bg-apple-bg transition-colors flex-shrink-0 touch-manipulation md:w-8 md:h-8 lg:w-9 lg:h-9"
                    aria-label="Anterior"
                  >
                    <ChevronLeft className="w-5 h-5 md:w-4 md:h-4 shrink-0" />
                  </button>

                  {/* Móvil: texto "4 de 12". Desktop: botones de página */}
                  <div className="flex items-center min-w-0 flex-1 justify-center md:flex-initial md:flex-shrink-0">
                    <span className="text-sm font-medium text-apple-text md:hidden">
                      {currentPage} de {totalPages}
                    </span>
                    <div className="hidden md:flex items-center gap-1 flex-wrap justify-center">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`min-w-[1.75rem] h-8 text-xs px-2 rounded-lg font-medium transition-colors flex-shrink-0 touch-manipulation ${
                            page === currentPage
                              ? "bg-apple-accent text-white border border-apple-accent"
                              : "border border-apple-border bg-apple-surface text-apple-text hover:bg-apple-bg"
                          }`}
                          aria-label={`Página ${page}`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={goToNextPage}
                    disabled={currentPage >= totalPages}
                    className="w-10 h-10 rounded-xl border border-apple-border bg-apple-surface text-apple-text flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none hover:bg-apple-bg active:bg-apple-bg transition-colors flex-shrink-0 touch-manipulation md:w-8 md:h-8 lg:w-9 lg:h-9"
                    aria-label="Siguiente"
                  >
                    <ChevronRight className="w-5 h-5 md:w-4 md:h-4 shrink-0" />
                  </button>
                </div>
                <button
                  onClick={() => {
                    const categoryBottles = filteredBottles.map((b) => b.id);
                    const allSelected = categoryBottles.every((id) =>
                      selectedBottles.has(id)
                    );
                    const newSelected = new Set(selectedBottles);
                    if (allSelected) {
                      categoryBottles.forEach((id) => newSelected.delete(id));
                    } else {
                      categoryBottles.forEach((id) => newSelected.add(id));
                    }
                    setSelectedBottles(newSelected);
                  }}
                  className="px-3 py-2 min-[380px]:px-4 sm:px-3 sm:py-1.5 bg-apple-surface border border-apple-border rounded-lg text-xs min-[380px]:text-sm sm:text-xs text-apple-text hover:bg-apple-bg transition-colors touch-manipulation min-h-[44px] sm:min-h-0 flex items-center justify-center"
                >
                  {filteredBottles.every((b) => selectedBottles.has(b.id))
                    ? "Deseleccionar Todos"
                    : "Seleccionar Todos"}
                </button>
              </div>
            </div>
          )}

          <div className="flex-shrink-0 h-2 sm:h-2" aria-hidden />

          {/* Botón Continuar: siempre accesible, área táctil mínima 44px */}
          <div className="w-full pt-2 pb-0 px-3 min-[380px]:px-4 sm:px-6 md:px-8 flex-shrink-0">
            <div className="max-w-6xl mx-auto flex justify-center min-w-0">
              <button
                onClick={handleContinue}
                disabled={selectedBottles.size === 0}
                className="w-full max-w-[280px] sm:max-w-[300px] md:max-w-[320px] min-h-[48px] min-[380px]:min-h-[52px] sm:min-h-[54px] md:min-h-[56px] bg-apple-accent text-white font-semibold py-3 min-[380px]:py-3.5 sm:py-4 px-4 min-[380px]:px-5 text-sm min-[380px]:text-base sm:text-lg rounded-2xl active:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-manipulation select-none transition-opacity duration-150 shadow-sm"
              >
                <span className="flex items-center gap-2 flex-1 justify-center min-w-0 flex-wrap">
                  <span>Continuar con</span>
                  <span className="inline-flex items-center gap-2 whitespace-nowrap">
                    {selectedBottles.size} {selectedBottles.size === 1 ? "botella" : "botellas"}
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" strokeWidth={2.5} />
                  </span>
                </span>
              </button>
            </div>
          </div>
        </footer>
      </div>
    </AuthGuard>
  );
}
