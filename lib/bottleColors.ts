/** Colores por categoría para botellas (usado en Selecciona Tu Inventario y Mi Barra) */
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    vodka: "#E8F4F8",
    tequila: "#F0E8D0",
    whiskey: "#8B4513",
    whisky: "#8B4513",
    ron: "#D4A574",
    gin: "#E0F2E8",
    ginebra: "#E0F2E8",
    cerveza: "#FFD700",
    mezcal: "#C4A35A",
    vino: "#8B0000",
    champagne: "#FFF8DC",
    brandy: "#8B4513",
    licores: "#9370DB",
    pisco: "#E8DCC8",
    sidra: "#DEB887",
  };
  return colors[category.toLowerCase()] || "#6366F1";
}

/** Categorías con líquido clarito: la botella (contorno) va en gris; el líquido conserva su color */
const LIGHT_LIQUID_CATEGORIES = ["vodka", "tequila", "gin", "ginebra", "champagne", "pisco", "sidra"];

/** Color del contorno de la botella: gris si el líquido es clarito, si no el color de la categoría */
export function getBottleOutlineColor(category: string): string {
  return LIGHT_LIQUID_CATEGORIES.includes(category.toLowerCase()) ? "#9ca3af" : getCategoryColor(category);
}
