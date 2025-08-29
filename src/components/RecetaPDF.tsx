import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font
} from "@react-pdf/renderer";

// Puedes personalizar la fuente si lo deseas
// Font.register({ family: 'Figtree', src: 'URL_DE_LA_FUENTE' });

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 12,
    fontFamily: "Helvetica",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#222",
  },
  section: {
    marginBottom: 10,
  },
  table: {
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#222",
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCell: {
    flex: 1,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#222",
    padding: 4,
  },
  bold: {
    fontWeight: "bold",
    color: "#222",
  },
  total: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#222",
    marginTop: 10,
  },
});

const RecetaPDF = ({ receta }) => {
  if (!receta) return null;
  const materiales = receta.materiales || [];
  const producto = receta.producto || {};
  const paquete = receta.paquete_material || {};
  const totalMateriales = materiales.reduce(
    (acc, mat) => acc + (parseFloat(mat.precio) * (parseFloat(mat.cantidad_material ?? mat.cantidad ?? 1) || 1)),
    0
  );
  const costoProducto = producto.precioTotal
    ? parseFloat(producto.precioTotal)
    : (producto.precio ? parseFloat(producto.precio) : 0);
  const totalReceta = receta.precio ? parseFloat(receta.precio) : (costoProducto + totalMateriales);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Protocolo Receta</Text>
        {/* Encabezado tipo factura */}
        <View style={styles.section}>
          <Text>ID: {receta.id || '-'}</Text>
          <Text>SKU: {receta.sku || '-'}</Text>
          <Text>Fecha: {receta.created_at ? new Date(receta.created_at).toLocaleDateString() : '-'}</Text>
        </View>
        {/* Producto y Paquete en filas separadas */}
        <View style={[styles.section]}> 
          <View style={{ border: '1px solid #222', borderRadius: 6, padding: 8, backgroundColor: '#f5f5f5', marginBottom: 8 }}>
            <Text style={[styles.bold, { marginBottom: 4 }]}>Parte vegetal</Text>
            <Text>SKU: {producto.sku || '-'}</Text>
            <Text>Descripción: {producto.descripcion || '-'}</Text>
            <Text>Categoría: {producto.categoria || '-'}</Text>
          </View>
          <View style={{ border: '1px solid #222', borderRadius: 6, padding: 8, backgroundColor: '#f5f5f5' }}>
            <Text style={[styles.bold, { marginBottom: 4 }]}>Paquete</Text>
            <Text>SKU: {paquete.sku || '-'}</Text>
            <Text>Nombre: {paquete.nombre || '-'}</Text>
          </View>
        </View>
        {/* Tabla de flores antes de materiales */}
        {producto && Array.isArray(producto.flores) && producto.flores.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.bold, { marginBottom: 4 }]}>Flores</Text>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.bold]}>Variedad</Text>
                <Text style={[styles.tableCell, styles.bold]}>Tipo</Text>
                <Text style={[styles.tableCell, styles.bold]}>Color</Text>
                <Text style={[styles.tableCell, styles.bold]}>Calibre</Text>
                <Text style={[styles.tableCell, styles.bold]}>Tallos</Text>
              </View>
              {producto.flores.map((flor, idx) => (
                <View style={styles.tableRow} key={idx}>
                  <Text style={styles.tableCell}>{flor.variedad || "-"}</Text>
                  <Text style={styles.tableCell}>{flor.tipo || "-"}</Text>
                  <Text style={styles.tableCell}>{flor.color || "-"}</Text>
                  <Text style={styles.tableCell}>{flor.calibre || "-"}</Text>
                  <Text style={styles.tableCell}>{flor.pivot && flor.pivot.tallos !== undefined ? flor.pivot.tallos : '-'}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        {/* Tabla de materiales tipo factura */}
        <View style={styles.section}>
          <Text style={[styles.bold, { marginBottom: 4 }]}>Materiales</Text>
          {Array.isArray(materiales) && materiales.length > 0 ? (
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.bold]}>SKU</Text>
                <Text style={[styles.tableCell, styles.bold]}>Descripción</Text>
                <Text style={[styles.tableCell, styles.bold]}>Tipo</Text>
                <Text style={[styles.tableCell, styles.bold]}>Marca</Text>
                <Text style={[styles.tableCell, styles.bold]}>Unidad</Text>
                <Text style={[styles.tableCell, styles.bold]}>Color</Text>
                <Text style={[styles.tableCell, styles.bold]}>Cantidad</Text>
              </View>
              {materiales.map((mat, idx) => {
                const cantidad = mat.cantidad_material !== undefined && mat.cantidad_material !== null && mat.cantidad_material !== ""
                  ? parseFloat(mat.cantidad_material)
                  : (mat.cantidad !== undefined && mat.cantidad !== null && mat.cantidad !== "" ? parseFloat(mat.cantidad) : 1);
                return (
                  <View style={styles.tableRow} key={idx}>
                    <Text style={styles.tableCell}>{mat.sku || "-"}</Text>
                    <Text style={styles.tableCell}>{mat.descripcion || "-"}</Text>
                    <Text style={styles.tableCell}>{mat.tipoMaterial || "-"}</Text>
                    <Text style={styles.tableCell}>{mat.marca || "-"}</Text>
                    <Text style={styles.tableCell}>{mat.unidadMedida || "-"}</Text>
                    <Text style={styles.tableCell}>{mat.color || "-"}</Text>
                    <Text style={styles.tableCell}>{cantidad.toString()}</Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={{ color: '#888', fontSize: 10 }}>No hay materiales registrados.</Text>
          )}
        </View>
        {/* Pie tipo factura con observaciones */}
        <View style={{ flex: 1, marginTop: 12 }}>
          <Text style={{ fontSize: 10 }}><Text style={styles.bold}>Observaciones:</Text> {receta.descripcion || '-'}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default RecetaPDF;
