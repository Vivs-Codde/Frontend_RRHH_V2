export interface LineaAerea {
  id: number;
  code: string;
  name: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LineaAereaFormData {
  code: string;
  name: string;
  status: string;
}
