export interface Bottle {
  id: string;
  name: string;
  category: string;
  size: number; // en ml
  currentOz: number; // ml actuales (se convertirá a oz en el componente)
  /** Unidades disponibles (para cerveza y otros por unidad). Si no se define, se usa currentOz/size. */
  sizeUnits?: number;
  currentUnits?: number;
  image?: string;
  brand?: string;
  type?: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export interface Bar {
  id: string;
  userId: string;
  name: string;
  softRestaurantCode?: string;
  bottles: Bottle[];
  createdAt: Date;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}
