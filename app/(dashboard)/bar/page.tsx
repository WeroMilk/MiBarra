"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import BottleDisplay from "@/components/Bar/BottleDisplay";
import BottleThumbnail from "@/components/Bar/BottleThumbnail";
import { categories } from "@/lib/bottlesData";
import { loadBarBottles } from "@/lib/barStorage";
import { Bottle } from "@/lib/types";
import { movementsService } from "@/lib/movements";
import { demoAuth } from "@/lib/demoAuth";
import { motion, AnimatePresence } from "framer-motion";

type SortOption = "name-asc" | "quantity-desc" | "quantity-asc" | "custom";

export default function BarPage() {
  const [bottles, setBottles] = useState<Bottle[]>(() =>
    typeof window !== "undefined" ? loadBarBottles() : []
  );
  useEffect(() => {
    setBottles(loadBarBottles());
  }, []);

  // Re-sincronizar con Mi Inventario al volver a esta pantalla (p. ej. tras editar inventario)
  useEffect(() => {
    const sync = () => setBottles(loadBarBottles());
    window.addEventListener("focus", sync);
    return () => window.removeEventListener("focus", sync);
  }, []);

  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");
  const [sortOption, setSortOption] = useState<SortOption>("name-asc");
  const [customOrder, setCustomOrder] = useState<string[] | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [displayBottles, setDisplayBottles] = useState<Bottle[]>([]);
  const thumbnailScrollRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const dragStartIndex = useRef<number | null>(null);

  useEffect(() => {
    const savedOrder = localStorage.getItem("bottles-custom-order");
    if (savedOrder) {
      try {
        setCustomOrder(JSON.parse(savedOrder));
        setSortOption("custom");
      } catch {
        // Ignorar orden corrupto en localStorage
      }
    }
  }, []);

  const getPercentage = useCallback((bottle: Bottle) => {
    const mlToOz = (ml: number) => ml * 0.033814;
    return (mlToOz(bottle.currentOz) / mlToOz(bottle.size)) * 100;
  }, []);

  const sortedBottles = useMemo(() => {
    const sorted = [...bottles];
    if (sortOption === "custom" && customOrder) {
      const orderMap = new Map(customOrder.map((id, index) => [id, index]));
      return sorted.sort((a, b) => (orderMap.get(a.id) ?? Infinity) - (orderMap.get(b.id) ?? Infinity));
    }
    switch (sortOption) {
      case "name-asc": return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "quantity-desc": return sorted.sort((a, b) => getPercentage(b) - getPercentage(a));
      case "quantity-asc": return sorted.sort((a, b) => getPercentage(a) - getPercentage(b));
      default: return sorted;
    }
  }, [bottles, sortOption, customOrder, getPercentage]);

  const filteredByCategory = useMemo(() => {
    if (selectedCategory === "todos") return sortedBottles;
    return sortedBottles.filter((b) => b.category.toLowerCase() === selectedCategory.toLowerCase());
  }, [sortedBottles, selectedCategory]);

  useEffect(() => {
    if (!isDragging) setDisplayBottles(filteredByCategory);
  }, [filteredByCategory, isDragging]);

  useEffect(() => {
    if (displayBottles.length > 0 && activeIndex >= displayBottles.length) setActiveIndex(displayBottles.length - 1);
  }, [displayBottles.length, activeIndex]);

  useEffect(() => {
    setActiveIndex(0);
  }, [selectedCategory]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBottles((prev) => prev.map((bottle) => {
        if (Math.random() > 0.95 && bottle.currentOz > 0) {
          return { ...bottle, currentOz: Math.max(0, bottle.currentOz - Math.random() * 20) };
        }
        return bottle;
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (thumbnailScrollRef.current) {
      const thumbnail = thumbnailScrollRef.current.children[activeIndex] as HTMLElement;
      thumbnail?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeIndex, displayBottles]);

  const scrollToIndex = useCallback((index: number) => setActiveIndex(index), []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => { touchStartX.current = e.touches[0]?.clientX ?? 0; }, []);
  const handleTouchMove = useCallback((e: React.TouchEvent) => { touchEndX.current = e.touches[0]?.clientX ?? 0; }, []);
  const handleTouchEnd = useCallback(() => {
    const distance = (touchStartX.current ?? 0) - (touchEndX.current ?? 0);
    if (distance > 50 && activeIndex < displayBottles.length - 1) scrollToIndex(activeIndex + 1);
    else if (distance < -50 && activeIndex > 0) scrollToIndex(activeIndex - 1);
  }, [activeIndex, displayBottles.length, scrollToIndex]);

  const getSortLabel = (opt: SortOption) => {
    switch (opt) {
      case "name-asc": return "Nombre A-Z";
      case "quantity-desc": return "Cantidad ↓";
      case "quantity-asc": return "Cantidad ↑";
      case "custom": return "Personalizado";
      default: return "Nombre A-Z";
    }
  };

  const handleSortClick = () => {
    const sortOrder: SortOption[] = ["name-asc", "quantity-desc", "quantity-asc"];
    const nextIndex = (sortOrder.indexOf(sortOption) + 1) % sortOrder.length;
    const newSort = sortOrder[nextIndex];
    setSortOption(newSort);
    setActiveIndex(0);
    movementsService.add({
      type: "sort_change",
      bottleId: "_",
      bottleName: "Mi Barra",
      newValue: 0,
      userName: demoAuth.getCurrentUser()?.name ?? "Usuario",
      description: `Orden de lista: ${getSortLabel(newSort)}`,
    });
  };

  const handleDragStart = (index: number) => {
    dragStartIndex.current = index;
    setDraggedIndex(index);
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragStartIndex.current == null || dragStartIndex.current === index) return;
    const newOrder = [...displayBottles];
    const [draggedItem] = newOrder.splice(dragStartIndex.current, 1);
    newOrder.splice(index, 0, draggedItem);
    setDisplayBottles(newOrder);
    dragStartIndex.current = index;
  };

  const handleDragEnd = () => {
    if (dragStartIndex.current != null) {
      const newCustomOrder = displayBottles.map((b) => b.id);
      setCustomOrder(newCustomOrder);
      setSortOption("custom");
      localStorage.setItem("bottles-custom-order", JSON.stringify(newCustomOrder));
      movementsService.add({
        type: "bottles_reorder",
        bottleId: "_",
        bottleName: "Mi Barra",
        newValue: 0,
        userName: demoAuth.getCurrentUser()?.name ?? "Usuario",
        description: "Orden de botellas actualizado",
      });
    }
    setIsDragging(false);
    setDraggedIndex(null);
    dragStartIndex.current = null;
  };

  const handleBottleUpdate = useCallback((updatedBottle: Bottle) => {
    setBottles((prev) => prev.map((b) => (b.id === updatedBottle.id ? updatedBottle : b)));
    setDisplayBottles((prev) => prev.map((b) => (b.id === updatedBottle.id ? updatedBottle : b)));
  }, []);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Selector de categoría (sin espacio respecto al header) */}
      <div className="flex-shrink-0 px-2 pt-1.5 pb-1.5 bg-apple-surface border-b border-apple-border">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
          <button
            type="button"
            onClick={() => setSelectedCategory("todos")}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedCategory === "todos"
                ? "bg-apple-accent text-white"
                : "bg-apple-bg text-apple-text2 hover:bg-apple-border"
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                selectedCategory === cat.id
                  ? "bg-apple-accent text-white"
                  : "bg-apple-bg text-apple-text2 hover:bg-apple-border"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div
        className="flex-1 overflow-hidden min-h-0"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          {displayBottles.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center px-6 text-center"
            >
              <p className="text-apple-text2 text-sm">
                {selectedCategory === "todos"
                  ? "No hay botellas en tu bar"
                  : `No hay botellas de ${categories.find((c) => c.id === selectedCategory)?.name ?? selectedCategory} en tu inventario`}
              </p>
              <p className="text-apple-text2 text-xs mt-1">
                Añade botellas desde &quot;Selecciona tu inventario&quot; en Configuración
              </p>
            </motion.div>
          ) : displayBottles[activeIndex] ? (
            <motion.div
              key={`${displayBottles[activeIndex].id}-${activeIndex}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <BottleDisplay bottle={displayBottles[activeIndex]} onBottleUpdate={handleBottleUpdate} />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {displayBottles.length > 0 && (
        <div className="bg-apple-surface border-t border-apple-border px-2 py-1 sm:px-3 sm:py-2 flex-shrink-0">
          <div className="flex items-center justify-between mb-1 sm:mb-2 px-0.5 gap-1 sm:gap-2">
            <span className="text-[9px] sm:text-[10px] text-apple-text2 truncate">{getSortLabel(sortOption)}</span>
            <button
              onClick={handleSortClick}
              className="flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 text-[9px] sm:text-[10px] text-apple-text2 bg-apple-bg border border-apple-border rounded-md hover:!bg-blue-600 hover:!text-white hover:!border-blue-600 transition-colors"
              title="Cambiar orden"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-2.5 sm:h-2.5">
                <path d="M3 6h18M7 12h10M11 18h2" />
              </svg>
              Orden
            </button>
          </div>
          <div
            ref={thumbnailScrollRef}
            className="flex gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            onDragOver={(e) => e.preventDefault()}
          >
            {displayBottles.map((bottle, index) => (
              <BottleThumbnail
                key={`bottle-${bottle.id}-${index}`}
                bottle={bottle}
                isActive={index === activeIndex}
                onClick={() => scrollToIndex(index)}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                isDragging={isDragging && draggedIndex === index}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
