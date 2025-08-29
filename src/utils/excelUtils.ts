import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';


/**
 * Utilidades para exportación de Excel usando ExcelJS
 * Reemplazo para funciones que utilizaban XLSX
 */

/**
 * Crea y descarga un archivo Excel con los datos proporcionados
 * 
 * @param data Array de objetos que contienen los datos a exportar
 * @param sheetName Nombre de la hoja de Excel
 * @param fileName Nombre del archivo a descargar
 * @param title Título opcional para el encabezado del reporte
 * @param columnWidths Arreglo opcional con anchos de columna
 */
export async function exportToExcel(
  data: Record<string, any>[],
  sheetName: string,
  fileName: string,
  title?: string,
  columnWidths?: number[]
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  // Extraer encabezados (keys del primer objeto)
  const headers = Object.keys(data[0]);
  
  // Agregar título si se proporciona
  if (title) {
    worksheet.addRow([]);
    const titleRow = worksheet.addRow([title]);
    titleRow.font = { bold: true, size: 14 };
    worksheet.addRow([]);
  }

  // Agregar fila de encabezados
  const headerRow = worksheet.addRow(headers);
  headerRow.font = { bold: true };

  // Estilo para los encabezados
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' } // Gris claro
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  // Agregar datos
  data.forEach(item => {
    const values = headers.map(header => item[header]);
    worksheet.addRow(values);
  });

  // Ajustar ancho de columnas si se proporcionan
  if (columnWidths && columnWidths.length > 0) {
    headers.forEach((_, i) => {
      if (columnWidths[i]) {
        worksheet.getColumn(i + 1).width = columnWidths[i];
      }
    });
  } else {
    // Autoajustar columnas basado en el contenido
    worksheet.columns.forEach(column => {
      column.width = 15; // Ancho mínimo
    });
  }

  // Generar buffer
  const buffer = await workbook.xlsx.writeBuffer();
  
  // Crear blob y guardar archivo
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, fileName);
}

/**
 * Crea y descarga un archivo Excel con datos en formato de matriz (array of arrays)
 * 
 * @param data Matriz de datos (array de arrays)
 * @param sheetName Nombre de la hoja de Excel
 * @param fileName Nombre del archivo a descargar
 * @param columnWidths Arreglo opcional con anchos de columna
 */
export async function exportArraysToExcel(
  data: any[][],
  sheetName: string,
  fileName: string,
  columnWidths?: number[]
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  // Agregar filas desde la matriz de datos
  data.forEach(rowData => {
    worksheet.addRow(rowData);
  });

  // Dar formato a la fila de encabezado (asumiendo que la primera fila contiene encabezados)
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' } // Gris claro
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  // Ajustar ancho de columnas si se proporcionan
  if (columnWidths && columnWidths.length > 0) {
    columnWidths.forEach((width, i) => {
      if (width) {
        worksheet.getColumn(i + 1).width = width;
      }
    });
  }

  // Generar buffer
  const buffer = await workbook.xlsx.writeBuffer();
  
  // Crear blob y guardar archivo
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, fileName);
}
