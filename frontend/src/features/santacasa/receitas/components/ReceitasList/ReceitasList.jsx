// src/features/santacasa/receitas/components/ReceitasList/ReceitasList.jsx
import { useState } from "react";

import BarcodeValue from "../../../../../shared/ui/BarcodeValue/BarcodeValue";
import Button from "../../../../../shared/ui/Button/Button";
import DataState from "../../../../../shared/ui/DataState/DataState";
import SurfaceCard from "../../../../../shared/ui/SurfaceCard/SurfaceCard";

import { RECEITAS_PAGE } from "../../config/receitasPage.config";

import styles from "./ReceitasList.module.css";

const CODE_TOGGLE_LABELS = Object.freeze({
  show: "Ver códigos",
  hide: "Ocultar códigos",
  title: "Códigos da receita",
});

function formatDateOnly(value) {
  if (!value) return RECEITAS_PAGE.list.emptyValue;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return RECEITAS_PAGE.list.emptyValue;

  return new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "short",
  }).format(date);
}

function normalizeMedicationName(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function getReceitaValidityTime(linha) {
  const time = new Date(linha?.validade).getTime();

  return Number.isNaN(time) ? Number.MAX_SAFE_INTEGER : time;
}

function getReceitaPedidoKey(linha) {
  return `COM_RECEITA:${linha.linhaId}`;
}

function getReceitaAvailableQuantity(linha, pedidoItemsQuantities = {}) {
  const pedidoKey = getReceitaPedidoKey(linha);
  const quantidadeRestante = Number(linha?.quantidadeRestante) || 0;
  const quantidadeEmPedido = Number(pedidoItemsQuantities[pedidoKey]) || 0;

  return Math.max(0, quantidadeRestante - quantidadeEmPedido);
}

function isSameMedication(a, b) {
  return (
    normalizeMedicationName(a?.medicamento) ===
    normalizeMedicationName(b?.medicamento)
  );
}

function hasEarlierAvailableReceita({
  linha,
  receitas = [],
  pedidoItemsQuantities = {},
}) {
  if (!linha?.linhaId || !linha?.medicamento) return false;

  const currentValidityTime = getReceitaValidityTime(linha);

  return receitas.some((candidate) => {
    if (!candidate?.linhaId) return false;
    if (candidate.linhaId === linha.linhaId) return false;
    if (!isSameMedication(candidate, linha)) return false;

    const candidateValidityTime = getReceitaValidityTime(candidate);

    if (candidateValidityTime >= currentValidityTime) return false;

    return getReceitaAvailableQuantity(candidate, pedidoItemsQuantities) > 0;
  });
}

function buildPedidoItem(linha) {
  return {
    key: getReceitaPedidoKey(linha),
    tipo: "COM_RECEITA",
    id: linha.linhaId,
    title: linha.medicamento,
    description: `${RECEITAS_PAGE.list.labels.receitaPrefix} ${linha.numero19}`,
    meta: `${RECEITAS_PAGE.list.labels.pinPrefix} ${linha.pinAcesso6} · ${RECEITAS_PAGE.list.labels.optionPrefix} ${linha.pinOpcao4}`,
    quantidadeRestante: Number(linha.quantidadeRestante) || 0,
    source: linha,
  };
}

function getInputQuantity(value, max) {
  if (max <= 0) return 0;

  const quantity = Math.floor(Number(value));

  if (!Number.isFinite(quantity) || quantity < 1) return 1;

  return Math.min(quantity, max);
}

function getPedidoButtonLabel({ quantidadeDisponivel, isBlockedByFefo }) {
  if (quantidadeDisponivel <= 0) {
    return RECEITAS_PAGE.list.pedidoActions.noStockLabel;
  }

  if (isBlockedByFefo) {
    return RECEITAS_PAGE.list.pedidoActions.usePreviousLabel;
  }

  return RECEITAS_PAGE.list.pedidoActions.addLabel;
}

function ReceitaCodeCell({ label, value, size = "compact" }) {
  return (
    <div className={styles.codeCell}>
      <BarcodeValue
        label={label}
        value={value}
        caption=""
        size={size}
        className={styles.codeBarcode}
      />
    </div>
  );
}

function ReceitaCodesPanel({ linha, panelId }) {
  return (
    <section
      id={panelId}
      className={styles.codesPanel}
      aria-label={CODE_TOGGLE_LABELS.title}
    >
      <div className={styles.codesHeader}>
        <h4>{CODE_TOGGLE_LABELS.title}</h4>
      </div>

      <div className={styles.codesGrid}>
        <ReceitaCodeCell
          label={RECEITAS_PAGE.fields.numero19.label}
          value={linha.numero19}
        />

        <ReceitaCodeCell
          label={RECEITAS_PAGE.fields.pinAcesso6.label}
          value={linha.pinAcesso6}
        />

        <ReceitaCodeCell
          label={RECEITAS_PAGE.fields.pinOpcao4.label}
          value={linha.pinOpcao4}
        />
      </div>
    </section>
  );
}

function ReceitaQuantitySummary({
  linha,
  quantidadeDisponivel,
  quantidadeEmPedido,
}) {
  return (
    <div className={styles.quantitySummary}>
      <div className={styles.quantityAvailable}>
        <span>{RECEITAS_PAGE.list.columns.quantidade}</span>
        <strong>{quantidadeDisponivel}</strong>
      </div>

      <div className={styles.quantityDetails}>
        <span>
          {RECEITAS_PAGE.list.labels.total} <strong>{linha.quantidade}</strong>
        </span>

        <span>
          {RECEITAS_PAGE.list.labels.dispensada}{" "}
          <strong>{linha.quantidadeDispensada}</strong>
        </span>

        <span>
          {RECEITAS_PAGE.list.labels.emPedido}{" "}
          <strong>{quantidadeEmPedido}</strong>
        </span>
      </div>
    </div>
  );
}

function ReceitaActionsCell({
  linha,
  pedidoItem,
  quantity,
  quantidadeDisponivel,
  quantidadeEmPedido,
  isBlockedByFefo,
  isPedidoDisabled,
  isDeleting,
  deletingLinhaId,
  isCodesExpanded,
  codesPanelId,
  hasPedidoActions,
  hasDeleteActions,
  onToggleCodes,
  onPedidoQuantityChange,
  onAddToPedido,
  onBlockedDelete,
  onDelete,
}) {
  return (
    <div className={styles.actionsCell}>
      {hasPedidoActions ? (
        <div className={styles.pedidoAction}>
          <label htmlFor={`receita-pedido-${linha.linhaId}`}>
            {RECEITAS_PAGE.list.labels.quantidadeShort}
          </label>

          <input
            id={`receita-pedido-${linha.linhaId}`}
            type="number"
            min="1"
            max={quantidadeDisponivel}
            value={quantity}
            disabled={isPedidoDisabled}
            aria-describedby={
              isBlockedByFefo ? `fefo-notice-${linha.linhaId}` : undefined
            }
            onChange={(event) =>
              onPedidoQuantityChange?.(
                pedidoItem.key,
                event.target.value,
                quantidadeDisponivel,
              )
            }
          />

          <div className={styles.addButtonSlot}>
            <Button
              type="button"
              size="sm"
              disabled={isPedidoDisabled}
              aria-describedby={
                isBlockedByFefo ? `fefo-notice-${linha.linhaId}` : undefined
              }
              onClick={() =>
                onAddToPedido({
                  ...pedidoItem,
                  quantidade: quantity,
                })
              }
            >
              {getPedidoButtonLabel({
                quantidadeDisponivel,
                isBlockedByFefo,
              })}
            </Button>
          </div>
        </div>
      ) : null}

      <div className={styles.codesButtonSlot}>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          aria-expanded={isCodesExpanded}
          aria-controls={codesPanelId}
          onClick={() => onToggleCodes(linha.linhaId)}
        >
          {isCodesExpanded ? CODE_TOGGLE_LABELS.hide : CODE_TOGGLE_LABELS.show}
        </Button>
      </div>

      {hasDeleteActions ? (
        <div className={styles.deleteButtonSlot}>
          <Button
            variant="danger"
            size="sm"
            isLoading={isDeleting}
            disabled={Boolean(deletingLinhaId)}
            onClick={() => {
              if (quantidadeEmPedido > 0) {
                onBlockedDelete?.(linha, quantidadeEmPedido);
                return;
              }

              onDelete(linha);
            }}
          >
            {isDeleting
              ? RECEITAS_PAGE.list.deletingLabel
              : RECEITAS_PAGE.list.deleteLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function ReceitaRow({
  linha,
  receitas,
  deletingLinhaId,
  pedidoQuantities,
  pedidoItemsQuantities,
  expandedLinhaId,
  hasPedidoActions,
  hasDeleteActions,
  onToggleCodes,
  onPedidoQuantityChange,
  onAddToPedido,
  onBlockedDelete,
  onDelete,
}) {
  const pedidoItem = buildPedidoItem(linha);
  const quantidadeEmPedido = Number(pedidoItemsQuantities[pedidoItem.key]) || 0;

  const quantidadeDisponivel = Math.max(
    0,
    pedidoItem.quantidadeRestante - quantidadeEmPedido,
  );

  const quantity = getInputQuantity(
    pedidoQuantities[pedidoItem.key],
    quantidadeDisponivel,
  );

  const isDeleting = deletingLinhaId === linha.linhaId;

  const isBlockedByFefo = hasEarlierAvailableReceita({
    linha,
    receitas,
    pedidoItemsQuantities,
  });

  const isPedidoDisabled = quantidadeDisponivel <= 0 || isBlockedByFefo;
  const isCodesExpanded = expandedLinhaId === linha.linhaId;

  const titleId = `receita-title-${linha.linhaId}`;
  const codesPanelId = `receita-codes-${linha.linhaId}`;

  return (
    <article
      className={
        isBlockedByFefo ? `${styles.row} ${styles.fefoBlockedRow}` : styles.row
      }
      role="listitem"
      aria-labelledby={titleId}
    >
      <div className={styles.compactContent}>
        <div className={styles.medicationCell}>
          <span>{RECEITAS_PAGE.list.columns.medicamento}</span>
          <strong id={titleId}>{linha.medicamento}</strong>

          {isBlockedByFefo ? (
            <p
              id={`fefo-notice-${linha.linhaId}`}
              className={styles.fefoNotice}
            >
              {RECEITAS_PAGE.list.fefo.blockedMessage}
            </p>
          ) : null}
        </div>

        <ReceitaQuantitySummary
          linha={linha}
          quantidadeDisponivel={quantidadeDisponivel}
          quantidadeEmPedido={quantidadeEmPedido}
        />

        <div className={styles.metaCell}>
          <div className={styles.validityBox}>
            <span>{RECEITAS_PAGE.list.columns.validade}</span>
            <strong>{formatDateOnly(linha.validade)}</strong>
          </div>

          <div className={styles.statusBox}>
            <span>{RECEITAS_PAGE.list.columns.estado}</span>
            <strong className={styles.status}>{linha.status}</strong>
          </div>
        </div>

        <ReceitaActionsCell
          linha={linha}
          pedidoItem={pedidoItem}
          quantity={quantity}
          quantidadeDisponivel={quantidadeDisponivel}
          quantidadeEmPedido={quantidadeEmPedido}
          isBlockedByFefo={isBlockedByFefo}
          isPedidoDisabled={isPedidoDisabled}
          isDeleting={isDeleting}
          deletingLinhaId={deletingLinhaId}
          isCodesExpanded={isCodesExpanded}
          codesPanelId={codesPanelId}
          hasPedidoActions={hasPedidoActions}
          hasDeleteActions={hasDeleteActions}
          onToggleCodes={onToggleCodes}
          onPedidoQuantityChange={onPedidoQuantityChange}
          onAddToPedido={onAddToPedido}
          onBlockedDelete={onBlockedDelete}
          onDelete={onDelete}
        />
      </div>

      {isCodesExpanded ? (
        <ReceitaCodesPanel linha={linha} panelId={codesPanelId} />
      ) : null}
    </article>
  );
}

export default function ReceitasList({
  receitas = [],
  selectedUtenteId = "",
  isLoading = false,
  error = null,
  deletingLinhaId = null,
  pedidoQuantities = {},
  pedidoItemsQuantities = {},
  onPedidoQuantityChange,
  onAddToPedido,
  onRetry,
  onBlockedDelete,
  onDelete,
}) {
  const [expandedLinhaId, setExpandedLinhaId] = useState(null);

  const hasPedidoActions = typeof onAddToPedido === "function";
  const hasDeleteActions = typeof onDelete === "function";

  function handleToggleCodes(linhaId) {
    setExpandedLinhaId((currentLinhaId) =>
      currentLinhaId === linhaId ? null : linhaId,
    );
  }

  if (!selectedUtenteId) {
    return (
      <DataState
        type="empty"
        title={RECEITAS_PAGE.list.noUtenteTitle}
        description={RECEITAS_PAGE.list.noUtenteDescription}
      />
    );
  }

  if (isLoading) {
    return (
      <DataState
        type="loading"
        title={RECEITAS_PAGE.list.loadingTitle}
        description={RECEITAS_PAGE.list.loadingDescription}
      />
    );
  }

  if (error) {
    return (
      <DataState
        type="error"
        title={RECEITAS_PAGE.list.errorTitle}
        description={error}
        actionLabel={RECEITAS_PAGE.list.retryLabel}
        onAction={onRetry}
      />
    );
  }

  if (receitas.length === 0) {
    return (
      <DataState
        type="empty"
        title={RECEITAS_PAGE.list.emptyTitle}
        description={RECEITAS_PAGE.list.emptyDescription}
      />
    );
  }

  return (
    <SurfaceCard
      title={RECEITAS_PAGE.list.title}
      description={RECEITAS_PAGE.list.description}
      tone="strong"
    >
      <div className={styles.list} role="list">
        {receitas.map((linha) => (
          <ReceitaRow
            key={linha.linhaId}
            linha={linha}
            receitas={receitas}
            deletingLinhaId={deletingLinhaId}
            pedidoQuantities={pedidoQuantities}
            pedidoItemsQuantities={pedidoItemsQuantities}
            expandedLinhaId={expandedLinhaId}
            hasPedidoActions={hasPedidoActions}
            hasDeleteActions={hasDeleteActions}
            onToggleCodes={handleToggleCodes}
            onPedidoQuantityChange={onPedidoQuantityChange}
            onAddToPedido={onAddToPedido}
            onBlockedDelete={onBlockedDelete}
            onDelete={onDelete}
          />
        ))}
      </div>
    </SurfaceCard>
  );
}
