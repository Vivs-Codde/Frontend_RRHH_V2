export interface Categoria {
  id: number;
  tipo: string; // Tipo - Select
  nombreCategoria: string; // Nombre de la categoría
}

export interface CreateCategoriaRequest {
  tipo: string;
  nombreCategoria: string;
}

export interface UpdateCategoriaRequest {
  tipo: string;
  nombreCategoria: string;
}
