// src/features/farmacia/pedidos/components/FarmaciaPedidosPageContent/FarmaciaPedidosPageContent.jsx
import PageHeader from "../../../../../shared/ui/PageHeader/PageHeader";

import FarmaciaPedidosList from "../../../shared/pedidos/components/FarmaciaPedidosList/FarmaciaPedidosList";

import { FARMACIA_PEDIDOS_PAGE } from "../../config/farmaciaPedidosPage.config";
import { useFarmaciaPedidos } from "../../hooks/useFarmaciaPedidos";

import styles from "./FarmaciaPedidosPageContent.module.css";

export default function FarmaciaPedidosPageContent() {
  const {
    pedidos,
    meta,
    query,
    pagination,

    isLoading,
    isRefreshing,
    isQuerying,

    error,

    refreshPedidos,
    searchPedidos,
    clearSearch,
    goToPreviousPage,
    goToNextPage,
  } = useFarmaciaPedidos();

  const { header, sections } = FARMACIA_PEDIDOS_PAGE;

  return (
    <section className={styles.page} aria-labelledby="farmacia-pedidos-title">
      <PageHeader
        titleId="farmacia-pedidos-title"
        eyebrow={header.eyebrow}
        title={header.title}
        description={header.description}
      />

      <FarmaciaPedidosList
        pedidos={pedidos}
        totalPedidos={meta.total}
        searchValue={query.search}
        pagination={pagination}
        sectionConfig={sections.list}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        isQuerying={isQuerying}
        error={error}
        onRefresh={refreshPedidos}
        onSearch={searchPedidos}
        onClearSearch={clearSearch}
        onPreviousPage={goToPreviousPage}
        onNextPage={goToNextPage}
      />
    </section>
  );
}
