import React from "react";
import GenericTable from "../GenericTable";
import type { TableColumn } from "../GenericTable";
import { useTranslation } from "react-i18next";

interface ProductosTableProps {
  productos: any[];
  loading: boolean;
  error: string;
  search: string;
  setSearch: (s: string) => void;
  page: number;
  setPage: (p: number) => void;
  totalPages: number;
  perPage: number;
  setPerPage: (n: number) => void;
}

const ProductosTable: React.FC<ProductosTableProps> = ({
  productos,
  loading,
  error,
  search,
  setSearch,
  page,
  setPage,
  totalPages,
  perPage,
  setPerPage,
}) => {
  const { t } = useTranslation();
  const columns: TableColumn[] = [
    { key: "SKU", label: t("sku"), render: (v) => v || "" },
    { key: "nombreProducto", label: t("name"), render: (v) => v || "" },
    { key: "descripcion", label: t("descriptionp"), render: (v) => v || "" },
    { key: "categoria", label: t("category"), render: (v) => v || "" },
    {
      key: "estado",
      label: t("status"),
      render: (v) =>
        v === 1 ? (
          <span className="text-green-700 font-semibold">{t("active")}</span>
        ) : (
          <span className="text-gray-500">{t("inactive")}</span>
        ),
    },
  ];
  return (
    <GenericTable
      data={productos}
      columns={columns}
      loading={loading}
      error={error}
      showActions={false}
      search={search}
      setSearch={setSearch}
      hideSearch={false}
      page={page}
      setPage={setPage}
      totalPages={totalPages}
      perPage={perPage}
      setPerPage={setPerPage}
      showPagination={true}
      emptyMessage={t("common.noData")}
      actionColumnLabel={t("common.actions")}
    />
  );
};

export default ProductosTable;
