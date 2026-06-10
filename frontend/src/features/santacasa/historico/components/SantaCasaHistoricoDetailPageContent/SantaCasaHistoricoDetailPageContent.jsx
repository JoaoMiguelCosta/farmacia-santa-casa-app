// src/features/santacasa/historico/components/SantaCasaHistoricoDetailPageContent/SantaCasaHistoricoDetailPageContent.jsx

import { Link, useLocation, useParams } from "react-router-dom";

import PageHeader from "../../../../../shared/ui/PageHeader/PageHeader";

import { SANTACASA_ROUTES } from "../../../shared/config/santaCasaRoutes.config";

import SantaCasaPedidoDetails from "../../../shared/pedidos/components/SantaCasaPedidoDetails/SantaCasaPedidoDetails";

import { SANTACASA_HISTORICO_PAGE } from "../../config/santaCasaHistoricoPage.config";

import { useSantaCasaHistoricoDetail } from "./useSantaCasaHistoricoDetail";

import { getSantaCasaHistoricoDetailViewModel } from "./santaCasaHistoricoDetail.utils";

import styles from "./SantaCasaHistoricoDetailPageContent.module.css";

function HistoricoDetailState({
  title,
  description,
  actionLabel,
  isActionLoading = false,
  onAction,
}) {
  return (
    <div className={styles.state} role="status">
      <strong className={styles.stateTitle}>{title}</strong>

      {description ? (
        <p className={styles.stateDescription}>{description}</p>
      ) : null}

      {actionLabel && onAction ? (
        <button
          type="button"
          className={styles.stateAction}
          disabled={isActionLoading}
          onClick={onAction}
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

export default function SantaCasaHistoricoDetailPageContent() {
  const { pedidoId } = useParams();

  const location = useLocation();

  const {
    pedido,
    error,

    isLoading,
    isRefreshing,

    refreshPedido,
  } = useSantaCasaHistoricoDetail(pedidoId);

  const detail = SANTACASA_HISTORICO_PAGE.detail;

  const viewModel = pedido
    ? getSantaCasaHistoricoDetailViewModel(pedido)
    : null;

  const backRoute = location.state?.from || SANTACASA_ROUTES.historico;

  const detailsId = pedido
    ? `santacasa-historico-${String(pedido.id || pedidoId).replace(
        /[^a-zA-Z0-9_-]/g,
        "-",
      )}-items`
    : "santacasa-historico-items";

  return (
    <section
      className={styles.page}
      aria-labelledby="santacasa-historico-detail-title"
    >
      <div className={styles.navigation}>
        <Link to={backRoute} className={styles.backLink}>
          ← {detail.backLabel}
        </Link>

        {!isLoading && pedido ? (
          <button
            type="button"
            className={styles.refreshButton}
            disabled={isRefreshing}
            onClick={refreshPedido}
          >
            {isRefreshing ? detail.refreshingLabel : detail.refreshLabel}
          </button>
        ) : null}
      </div>

      <PageHeader
        titleId="santacasa-historico-detail-title"
        eyebrow={detail.eyebrow}
        title={detail.title}
        description={detail.description}
      />

      {isLoading ? (
        <HistoricoDetailState
          title={detail.loadingTitle}
          description={detail.loadingDescription}
        />
      ) : null}

      {!isLoading && error ? (
        <HistoricoDetailState
          title={detail.errorTitle}
          description={error}
          actionLabel={
            isRefreshing ? detail.refreshingLabel : detail.retryLabel
          }
          isActionLoading={isRefreshing}
          onAction={refreshPedido}
        />
      ) : null}

      {!isLoading && !error && pedido && viewModel ? (
        <>
          <article className={styles.summaryCard} data-tone={viewModel.tone}>
            <header className={styles.summaryHeader}>
              <div>
                <span className={styles.eyebrow}>{detail.summaryTitle}</span>

                <h2>{viewModel.pedidoNumberLabel}</h2>

                <p>{detail.summaryDescription}</p>
              </div>

              <strong className={styles.status}>{viewModel.statusLabel}</strong>
            </header>

            {viewModel.message ? (
              <p className={styles.message}>{viewModel.message}</p>
            ) : null}

            <dl
              className={styles.summary}
              aria-label={detail.summary.ariaLabel}
            >
              {viewModel.summaryItems.map((item) => (
                <div key={item.key} className={styles.summaryItem}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          </article>

          <section
            className={styles.operationalSection}
            aria-labelledby="santacasa-historico-operational-title"
          >
            <header className={styles.sectionHeader}>
              <h2 id="santacasa-historico-operational-title">
                {detail.operational.title}
              </h2>
            </header>

            <dl
              className={styles.operationalMetrics}
              aria-label={detail.operational.ariaLabel}
            >
              {viewModel.operationalMetrics.map((metric) => (
                <div
                  key={metric.key}
                  className={styles.metric}
                  data-tone={metric.tone}
                >
                  <dt>{metric.label}</dt>
                  <dd>{metric.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {viewModel.showWarningNotice ? (
            <aside className={styles.notice} data-tone="warning" role="status">
              <strong>{viewModel.warningNoticeTitle}</strong>

              <p>{viewModel.warningNoticeMessage}</p>
            </aside>
          ) : null}

          {viewModel.showCancellationNotice ? (
            <aside className={styles.notice} data-tone="danger" role="status">
              <strong>{viewModel.cancellationNoticeTitle}</strong>

              <p>{viewModel.cancellationNoticeMessage}</p>
            </aside>
          ) : null}

          {viewModel.showReason ? (
            <section className={styles.reason}>
              <strong>{viewModel.reasonTitle}</strong>

              <p>{viewModel.reasonValue}</p>
            </section>
          ) : null}

          <section className={styles.itemsSection}>
            <SantaCasaPedidoDetails
              key={pedido.id || pedidoId}
              id={detailsId}
              pedido={pedido}
            />
          </section>
        </>
      ) : null}
    </section>
  );
}
