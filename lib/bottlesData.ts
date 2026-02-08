import { Category, Bottle } from "./types";

export const categories: Category[] = [
  { id: "cerveza", name: "Cerveza" },
  { id: "whisky", name: "Whisky / Whiskey" },
  { id: "ron", name: "Ron" },
  { id: "tequila", name: "Tequila" },
  { id: "mezcal", name: "Mezcal" },
  { id: "vodka", name: "Vodka" },
  { id: "ginebra", name: "Ginebra" },
  { id: "brandy", name: "Brandy / Coñac" },
  { id: "licores", name: "Licores / Cremas / Digestivos" },
  { id: "pisco", name: "Pisco" },
  { id: "sidra", name: "Sidra" },
];

const bottle = (id: string, name: string, category: string, sizeMl: number, currentMl?: number, sizeUnits?: number, currentUnits?: number): Bottle => ({
  id,
  name,
  category,
  size: sizeMl,
  currentOz: currentMl ?? Math.round(sizeMl * 0.7),
  sizeUnits,
  currentUnits,
});

// Aplicar unidades a todas las botellas (cerveza = por unidades, resto = 1 botella)
const withUnits = (list: Bottle[]): Bottle[] =>
  list.map((b, i) => {
    const isCerveza = b.category.toLowerCase() === "cerveza";
    const sizeU = b.sizeUnits ?? (isCerveza ? 24 : 1);
    const currentU = b.currentUnits ?? (isCerveza ? Math.max(0, sizeU - (i % 10)) : 1);
    return { ...b, sizeUnits: sizeU, currentUnits: currentU };
  });

export const defaultBottles: Bottle[] = withUnits([
  // Cerveza
  bottle("cerveza-1", "Corona Extra", "cerveza", 355),
  bottle("cerveza-2", "Corona Light", "cerveza", 355),
  bottle("cerveza-3", "Modelo Especial", "cerveza", 355),
  bottle("cerveza-4", "Modelo Negra", "cerveza", 355),
  bottle("cerveza-5", "Pacífico", "cerveza", 355),
  bottle("cerveza-6", "Victoria", "cerveza", 355),
  bottle("cerveza-7", "León", "cerveza", 355),
  bottle("cerveza-8", "Bud Light", "cerveza", 355),
  bottle("cerveza-9", "Heineken", "cerveza", 355),
  bottle("cerveza-10", "Tecate", "cerveza", 355),
  bottle("cerveza-11", "Tecate Light", "cerveza", 355),
  bottle("cerveza-12", "Sol", "cerveza", 355),
  bottle("cerveza-13", "Indio", "cerveza", 355),
  bottle("cerveza-14", "Bohemia", "cerveza", 355),
  bottle("cerveza-15", "Carta Blanca", "cerveza", 355),

  // Whisky / Whiskey
  bottle("whisky-1", "Buchanan's", "whisky", 750),
  bottle("whisky-2", "Johnnie Walker Red Label", "whisky", 750),
  bottle("whisky-3", "Johnnie Walker Black Label", "whisky", 750),
  bottle("whisky-4", "Johnnie Walker Blue Label", "whisky", 750),
  bottle("whisky-5", "Jack Daniel's", "whisky", 750),
  bottle("whisky-6", "Jim Beam", "whisky", 750),
  bottle("whisky-7", "Jameson", "whisky", 750),
  bottle("whisky-8", "Ballantine's", "whisky", 750),
  bottle("whisky-9", "Chivas Regal", "whisky", 750),
  bottle("whisky-10", "Old Parr", "whisky", 750),
  bottle("whisky-11", "Black & White", "whisky", 750),
  bottle("whisky-12", "Macallan", "whisky", 750),

  // Ron
  bottle("ron-1", "Bacardí Blanco", "ron", 750),
  bottle("ron-2", "Bacardí Dorado", "ron", 750),
  bottle("ron-3", "Bacardí Añejo", "ron", 750),
  bottle("ron-4", "Captain Morgan Original Spiced", "ron", 750),
  bottle("ron-5", "Captain Morgan Blanco", "ron", 750),
  bottle("ron-6", "Havana Club Blanco", "ron", 750),
  bottle("ron-7", "Havana Club Añejo", "ron", 750),
  bottle("ron-8", "Havana Club 7 Años", "ron", 750),
  bottle("ron-9", "Kraken", "ron", 750),
  bottle("ron-10", "Barceló Dorado", "ron", 750),
  bottle("ron-11", "Barceló Añejo", "ron", 750),
  bottle("ron-12", "Appleton Estate", "ron", 750),
  bottle("ron-13", "Malibu", "ron", 750),
  bottle("ron-14", "Santísima Trinidad", "ron", 750),

  // Tequila
  bottle("tequila-1", "José Cuervo Silver", "tequila", 750),
  bottle("tequila-2", "José Cuervo Reposado", "tequila", 750),
  bottle("tequila-3", "José Cuervo Añejo", "tequila", 750),
  bottle("tequila-4", "Don Julio Blanco", "tequila", 750),
  bottle("tequila-5", "Don Julio Reposado", "tequila", 750),
  bottle("tequila-6", "Don Julio Añejo", "tequila", 750),
  bottle("tequila-7", "Don Julio 70", "tequila", 750),
  bottle("tequila-8", "Patrón Silver", "tequila", 750),
  bottle("tequila-9", "Patrón Reposado", "tequila", 750),
  bottle("tequila-10", "Patrón Añejo", "tequila", 750),
  bottle("tequila-11", "Herradura Blanco", "tequila", 750),
  bottle("tequila-12", "Herradura Reposado", "tequila", 750),
  bottle("tequila-13", "Herradura Añejo", "tequila", 750),
  bottle("tequila-14", "1800 Silver", "tequila", 750),
  bottle("tequila-15", "1800 Reposado", "tequila", 750),
  bottle("tequila-16", "1800 Añejo", "tequila", 750),
  bottle("tequila-17", "Cenote Blanco", "tequila", 750),
  bottle("tequila-18", "Cenote Reposado", "tequila", 750),
  bottle("tequila-19", "Clase Azul Reposado", "tequila", 750),
  bottle("tequila-20", "Clase Azul Añejo", "tequila", 750),
  bottle("tequila-21", "Casamigos Blanco", "tequila", 750),
  bottle("tequila-22", "Casamigos Reposado", "tequila", 750),
  bottle("tequila-23", "Sauza Silver", "tequila", 750),
  bottle("tequila-24", "Sauza Reposado", "tequila", 750),
  bottle("tequila-25", "El Jimador Blanco", "tequila", 750),
  bottle("tequila-26", "El Jimador Reposado", "tequila", 750),

  // Mezcal
  bottle("mezcal-1", "Monte Albán", "mezcal", 750),
  bottle("mezcal-2", "Alipús", "mezcal", 750),
  bottle("mezcal-3", "Del Maguey Vida", "mezcal", 750),
  bottle("mezcal-4", "Del Maguey Chichicapa", "mezcal", 750),
  bottle("mezcal-5", "Los Amantes Joven", "mezcal", 750),
  bottle("mezcal-6", "Los Amantes Reposado", "mezcal", 750),
  bottle("mezcal-7", "Pierde Almas", "mezcal", 750),
  bottle("mezcal-8", "Ilegal Joven", "mezcal", 750),
  bottle("mezcal-9", "Ilegal Añejo", "mezcal", 750),
  bottle("mezcal-10", "Mezcal Union", "mezcal", 750),

  // Vodka
  bottle("vodka-1", "Smirnoff No. 21", "vodka", 750),
  bottle("vodka-2", "Absolut Original", "vodka", 750),
  bottle("vodka-3", "Grey Goose", "vodka", 750),
  bottle("vodka-4", "Ciroc", "vodka", 750),
  bottle("vodka-5", "Svedka", "vodka", 750),
  bottle("vodka-6", "Finlandia", "vodka", 750),
  bottle("vodka-7", "Stolichnaya", "vodka", 750),

  // Ginebra
  bottle("ginebra-1", "Beefeater", "ginebra", 750),
  bottle("ginebra-2", "Gordon's", "ginebra", 750),
  bottle("ginebra-3", "Tanqueray", "ginebra", 750),
  bottle("ginebra-4", "Bombay Sapphire", "ginebra", 750),
  bottle("ginebra-5", "Hendrick's", "ginebra", 750),

  // Brandy / Coñac
  bottle("brandy-1", "Presidente", "brandy", 750),
  bottle("brandy-2", "Don Pedro", "brandy", 750),
  bottle("brandy-3", "Azteca de Oro", "brandy", 750),
  bottle("brandy-4", "Fundador", "brandy", 750),
  bottle("brandy-5", "Torres", "brandy", 750),
  bottle("brandy-6", "Hennessy", "brandy", 750),
  bottle("brandy-7", "Courvoisier", "brandy", 750),

  // Licores / Cremas / Digestivos
  bottle("licores-1", "Kahlúa", "licores", 750),
  bottle("licores-2", "Baileys", "licores", 750),
  bottle("licores-3", "Amaretto Disaronno", "licores", 750),
  bottle("licores-4", "Jägermeister", "licores", 750),
  bottle("licores-5", "Licor 43", "licores", 750),
  bottle("licores-6", "Drambuie", "licores", 750),
  bottle("licores-7", "Grand Marnier", "licores", 750),
  bottle("licores-8", "Cointreau", "licores", 750),
  bottle("licores-9", "Peppermint Schnapps", "licores", 750),
  bottle("licores-10", "Campari", "licores", 750),
  bottle("licores-11", "Fernet Branca", "licores", 750),

  // Pisco
  bottle("pisco-1", "Alto del Carmen", "pisco", 750),
  bottle("pisco-2", "Capel", "pisco", 750),
  bottle("pisco-3", "Waqar", "pisco", 750),

  // Sidra
  bottle("sidra-1", "Sidra Cuauhtémoc", "sidra", 750),
  bottle("sidra-2", "Sidra Peñón", "sidra", 750),
  bottle("sidra-3", "Strongbow", "sidra", 750),
]);
