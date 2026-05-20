import Button from "../../../../../shared/ui/Button/Button";
import DataState from "../../../../../shared/ui/DataState/DataState";
import SurfaceCard from "../../../../../shared/ui/SurfaceCard/SurfaceCard";
import { formatDateTime } from "../../../../../shared/utils/formatDate";

import { RECEITAS_PAGE } from "../../config/receitasPage.config";

import styles from "./ReceitasList.module.css";

const FEFO_BLOCKED_MESSAGE =
  "Usa primeiro a receita com validade mais próxima.";

function formatDateOnly(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

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

function getRecipeKey(linha) {
  return [linha.receitaId, linha.numero19, linha.pinAcesso6, linha.pinOpcao4]
    .filter(Boolean)
    .join("-");
}

function groupReceitasByRecipe(receitas = []) {
  const groups = [];

  receitas.forEach((linha) => {
    const key = getRecipeKey(linha);
    const latestGroup = groups[groups.length - 1];

    if (latestGroup?.key === key) {
      latestGroup.linhas.push(linha);
      return;
    }

    groups.push({
      key,
      receita: linha,
      linhas: [linha],
    });
  });

  return groups;
}

function buildPedidoItem(linha) {
  return {
    key: getReceitaPedidoKey(linha),
    tipo: "COM_RECEITA",
    id: linha.linhaId,
    title: linha.medicamento,
    description: `Receita ${linha.numero19}`,
    meta: `PIN ${linha.pinAcesso6} · Opção ${linha.pinOpcao4}`,
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

export default function ReceitasList({
  receitas = [],
  selectedUtenteId = "",
  selectedUtente = null,
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
  const hasPedidoActions = typeof onAddToPedido === "function";
  const hasDeleteActions = typeof onDelete === "function";

  if (!selectedUtenteId) {
    return (
      <DataState
        type="empty"
        title="Seleciona um utente."
        description="Depois de selecionares um utente, as receitas disponíveis aparecem aqui."
      />
    );
  }

  if (isLoading) {
    return (
      <DataState
        type="loading"
        title={RECEITAS_PAGE.list.loadingTitle}
        description="Aguarda enquanto as receitas são carregadas."
      />
    );
  }

  if (error) {
    return (
      <DataState
        type="error"
        title={RECEITAS_PAGE.list.errorTitle}
        description={error}
        actionLabel="Tentar novamente"
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

  const receitaGroups = groupReceitasByRecipe(receitas);

  return (
    <SurfaceCard
      title={RECEITAS_PAGE.list.title}
      description={RECEITAS_PAGE.list.description}
      tone="strong"
    >
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Utente</th>
              <th>Receita</th>
              <th>Medicamento</th>
              <th>Quantidade</th>
              <th>Validade</th>
              <th>Estado</th>
              <th>Criado em</th>
              {hasPedidoActions ? <th>Pedido</th> : null}
              {hasDeleteActions ? <th>Remover</th> : null}
            </tr>
          </thead>

          <tbody>
            {receitaGroups.map((group) =>
              group.linhas.map((linha, index) => {
                const pedidoItem = buildPedidoItem(linha);
                const quantidadeEmPedido =
                  Number(pedidoItemsQuantities[pedidoItem.key]) || 0;
                const isDeleteBlocked = quantidadeEmPedido > 0;
                const quantidadeDisponivel = Math.max(
                  0,
                  pedidoItem.quantidadeRestante - quantidadeEmPedido,
                );
                const quantity = getInputQuantity(
                  pedidoQuantities[pedidoItem.key],
                  quantidadeDisponivel,
                );

                const isDeleting = deletingLinhaId === linha.linhaId;
                const isFirstRecipeLine = index === 0;
                const isBlockedByFefo = hasEarlierAvailableReceita({
                  linha,
                  receitas,
                  pedidoItemsQuantities,
                });

                const isPedidoDisabled =
                  quantidadeDisponivel <= 0 || isBlockedByFefo;

                return (
                  <tr
                    key={linha.linhaId}
                    className={isBlockedByFefo ? styles.fefoBlockedRow : ""}
                  >
                    {isFirstRecipeLine ? (
                      <td
                        rowSpan={group.linhas.length}
                        className={styles.groupCell}
                      >
                        <strong>
                          {selectedUtente?.nome || "Utente selecionado"}
                        </strong>
                        <span>
                          {selectedUtente?.numero9 || selectedUtenteId}
                        </span>
                      </td>
                    ) : null}

                    {isFirstRecipeLine ? (
                      <td
                        rowSpan={group.linhas.length}
                        className={styles.groupCell}
                      >
                        <strong>{linha.numero19}</strong>
                        <span>
                          PIN {linha.pinAcesso6} · Opção {linha.pinOpcao4}
                        </span>
                      </td>
                    ) : null}

                    <td>
                      <strong>{linha.medicamento}</strong>
                      <span>{linha.linhaId}</span>

                      {isBlockedByFefo ? (
                        <span className={styles.fefoInlineNotice}>
                          {FEFO_BLOCKED_MESSAGE}
                        </span>
                      ) : null}
                    </td>

                    <td>
                      <strong>{quantidadeDisponivel}</strong>
                      <span>
                        Total {linha.quantidade} · Dispensada{" "}
                        {linha.quantidadeDispensada}
                      </span>
                      <span>Em pedido {quantidadeEmPedido}</span>
                    </td>

                    <td>{formatDateOnly(linha.validade)}</td>

                    <td>
                      <span className={styles.status}>{linha.status}</span>
                    </td>

                    <td>{formatDateTime(linha.createdAt)}</td>

                    {hasPedidoActions ? (
                      <td className={styles.actionCell}>
                        <div className={styles.actionStack}>
                          <label htmlFor={`receita-pedido-${linha.linhaId}`}>
                            Qtd
                          </label>

                          <input
                            id={`receita-pedido-${linha.linhaId}`}
                            type="number"
                            min="1"
                            max={quantidadeDisponivel}
                            value={quantity}
                            disabled={isPedidoDisabled}
                            aria-describedby={
                              isBlockedByFefo
                                ? `fefo-notice-${linha.linhaId}`
                                : undefined
                            }
                            onChange={(event) =>
                              onPedidoQuantityChange?.(
                                pedidoItem.key,
                                event.target.value,
                                quantidadeDisponivel,
                              )
                            }
                          />

                          <Button
                            type="button"
                            size="sm"
                            disabled={isPedidoDisabled}
                            aria-describedby={
                              isBlockedByFefo
                                ? `fefo-notice-${linha.linhaId}`
                                : undefined
                            }
                            onClick={() =>
                              onAddToPedido({
                                ...pedidoItem,
                                quantidade: quantity,
                              })
                            }
                          >
                            {quantidadeDisponivel <= 0
                              ? "Sem saldo"
                              : isBlockedByFefo
                                ? "Usar anterior"
                                : "Adicionar"}
                          </Button>

                          {isBlockedByFefo ? (
                            <p
                              id={`fefo-notice-${linha.linhaId}`}
                              className={styles.fefoNotice}
                            >
                              {FEFO_BLOCKED_MESSAGE}
                            </p>
                          ) : null}
                        </div>
                      </td>
                    ) : null}

                    {hasDeleteActions ? (
                      <td className={styles.actionCell}>
                        <Button
                          variant="danger"
                          size="sm"
                          isLoading={isDeleting}
                          disabled={Boolean(deletingLinhaId)}
                          onClick={() => {
                            if (isDeleteBlocked) {
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
                      </td>
                    ) : null}
                  </tr>
                );
              }),
            )}
          </tbody>
        </table>
      </div>
    </SurfaceCard>
  );
}
