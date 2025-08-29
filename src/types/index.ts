/**
 * Archivo barril de exportación de tipos
 * Facilita la importación de tipos desde un solo lugar
 */

// Exportar todos los tipos comunes
export * from './common';

// Exportar tipos específicos de dominio
export * from './ventas';
// Exportación selectiva y renombrada para evitar conflictos
import type { Cliente as ClienteBase } from './cliente';
export type { ClienteBase };
// Importaciones selectivas para evitar conflictos
import * as ProductoTypes from './producto';
export { ProductoTypes };

// Re-exportar utilidades de tipado
export * from '../utils/typeUtils';
