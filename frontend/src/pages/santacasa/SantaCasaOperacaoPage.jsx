import { Link } from "react-router-dom";
import { useMemo, useState } from "react";

import Button from "../../shared/ui/Button/Button";
import ConfirmDialog from "../../shared/ui/ConfirmDialog/ConfirmDialog";
import FeedbackDialog from "../../shared/ui/FeedbackDialog/FeedbackDialog";
import PageHeader from "../../shared/ui/PageHeader/PageHeader";
import SurfaceCard from "../../shared/ui/SurfaceCard/SurfaceCard";

import SantaCasaSectionNav from "../../features/santacasa/shared/components/SantaCasaSectionNav/SantaCasaSectionNav";
import UtenteSelector from "../../features/santacasa/shared/components/UtenteSelector/UtenteSelector";

import ReceitaCreateForm from "../../features/santacasa/receitas/components/ReceitaCreateForm/ReceitaCreateForm";
import ReceitasList from "../../features/santacasa/receitas/components/ReceitasList/ReceitasList";
import {
  createReceita,
  deleteReceitaLinha,
} from "../../features/santacasa/receitas/api/receitasApi";
import { RECEITAS_PAGE } from "../../features/santacasa/receitas/config/receitasPage.config";

import SemReceitaCreateForm from "../../features/santacasa/sem-receita/components/SemReceitaCreateForm/SemReceitaCreateForm";
import SemReceitaList from "../../features/santacasa/sem-receita/components/SemReceitaList/SemReceitaList";
import {
  createSemReceita,
  deleteSemReceita,
} from "../../features/santacasa/sem-receita/api/semReceitaApi";
import { SEM_RECEITA_PAGE } from "../../features/santacasa/sem-receita/config/semReceitaPage.config";

import ExtraCreateForm from "../../features/santacasa/extras/components/ExtraCreateForm/ExtraCreateForm";
import ExtrasList from "../../features/santacasa/extras/components/ExtrasList/ExtrasList";
import {
  createExtra,
  deleteExtra,
} from "../../features/santacasa/extras/api/extrasApi";
import { EXTRAS_PAGE } from "../../features/santacasa/extras/config/extrasPage.config";

import { clampQuantity } from "../../features/santacasa/pedidos/utils/pedidoItems";
import { usePedidoDraft } from "../../features/santacasa/pedidos/state/usePedidoDraft";

import OperationSection from "../../features/santacasa/operacao/components/OperationSection/OperationSection";
import { useSantaCasaOperacao } from "../../features/santacasa/operacao/hooks/useSantaCasaOperacao";

import styles from "./SantaCasaOperacaoPage.module.css";

function buildDraftQuantityMap(items = []) {
  const map = {};

  items.forEach((item) => {
    map[item.key] = Number(item.quantidade) || 0;
  });

  return map;
}

function buildReceitaDraftItems(items = [], utenteId) {
  return items
    .filter((item) => item.tipo === "COM_RECEITA")
    .filter((item) => item.utenteId === utenteId)
    .map((item) => ({
      linhaId: item.id,
      quantidade: Number(item.quantidade) || 0,
    }))
    .filter((item) => item.linhaId && item.quantidade > 0);
}

function normalizeMedicationName(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function getItemMedicationName(item) {
  return (
    item?.medicamento ||
    item?.nome ||
    item?.title ||
    item?.source?.medicamento ||
    item?.source?.nome ||
    ""
  );
}

function isSameMedication(a, b) {
  return (
    normalizeMedicationName(getItemMedicationName(a)) ===
    normalizeMedicationName(getItemMedicationName(b))
  );
}

function formatUnitsLabel(quantity) {
  const amount = Number(quantity) || 0;

  return amount === 1 ? "1 unidade" : `${amount} unidades`;
}

function getOriginListLabel(tipo) {
  if (tipo === "COM_RECEITA") return "Receitas";
  if (tipo === "SEM_RECEITA") return "Sem Receita";
  if (tipo === "EXTRA") return "Extras";

  return "lista correspondente";
}

function formatVerbByQuantity(quantity, singular, plural) {
  return Number(quantity) === 1 ? singular : plural;
}

function buildAddToPedidoMessage({
  item,
  addedQuantity,
  remainingQuantity,
  utenteNome,
}) {
  const medicamento = getItemMedicationName(item);
  const originLabel = getOriginListLabel(item.tipo);
  const addVerb = formatVerbByQuantity(
    addedQuantity,
    "adicionada",
    "adicionadas",
  );

  const baseMessage = `${formatUnitsLabel(
    addedQuantity,
  )} de ${medicamento} ${addVerb} ao pedido geral de ${utenteNome}.`;

  if (remainingQuantity <= 0) {
    return `${baseMessage} Toda a quantidade disponível ficou no pedido geral. O item deixou de aparecer em ${originLabel} para este utente.`;
  }

  const remainVerb = formatVerbByQuantity(
    remainingQuantity,
    "continua",
    "continuam",
  );

  const availableWord = formatVerbByQuantity(
    remainingQuantity,
    "disponível",
    "disponíveis",
  );

  return `${baseMessage} ${formatUnitsLabel(
    remainingQuantity,
  )} ${remainVerb} ${availableWord} em ${originLabel}.`;
}

function getResolvedExtraKeys(extrasResolvidos = []) {
  return extrasResolvidos
    .map((extra) => extra?.id)
    .filter(Boolean)
    .map((extraId) => `EXTRA:${extraId}`);
}

function buildResolvedExtrasMessage(extrasResolvidos = []) {
  if (!Array.isArray(extrasResolvidos) || extrasResolvidos.length === 0) {
    return "";
  }

  if (extrasResolvidos.length === 1) {
    const extra = extrasResolvidos[0];
    const quantidade = Number(extra.quantidadeRemovida) || 0;

    if (extra.action === "DELETED") {
      return ` O Extra ${extra.medicamento} foi removido porque passou a existir receita ativa para o mesmo medicamento.`;
    }

    return ` No Extra ${extra.medicamento}, ${formatUnitsLabel(
      quantidade,
    )} que ainda não tinham sido enviadas à Farmácia foram removidas. A parte já enviada foi preservada.`;
  }

  return ` ${extrasResolvidos.length} Extras compatíveis foram ajustados/removidos porque passaram a ter receita ativa.`;
}

function getReceitaFieldErrors(requestError) {
  if (requestError?.status === 409) {
    return {
      numero19:
        requestError.message || "Já existe uma receita com esse número.",
    };
  }

  return {};
}

function getDeleteTargetKey(target) {
  if (!target) return "";

  if (target.kind === "receita") {
    return `receita:${target.item.linhaId}`;
  }

  if (target.kind === "semReceita") {
    return `semReceita:${target.item.id}`;
  }

  if (target.kind === "extra") {
    return `extra:${target.item.id}`;
  }

  return "";
}

function getDeletingId(deletingKey, kind) {
  if (!deletingKey?.startsWith(`${kind}:`)) return null;

  return deletingKey.slice(kind.length + 1);
}

function getPedidoKeyFromDeleteTarget(target) {
  if (!target) return "";

  if (target.kind === "receita") {
    return `COM_RECEITA:${target.item.linhaId}`;
  }

  if (target.kind === "semReceita") {
    return `SEM_RECEITA:${target.item.id}`;
  }

  if (target.kind === "extra") {
    return `EXTRA:${target.item.id}`;
  }

  return "";
}

function getDeleteDialogData(target) {
  if (!target) {
    return {
      title: "Remover item?",
      description: "Esta ação pode ser bloqueada se o item tiver histórico.",
      confirmLabel: "Remover",
      cancelLabel: "Cancelar",
    };
  }

  if (target.kind === "receita") {
    return {
      ...RECEITAS_PAGE.deleteDialog,
      description: `${RECEITAS_PAGE.deleteDialog.description} Medicamento: ${target.item.medicamento}.`,
    };
  }

  if (target.kind === "semReceita") {
    return {
      ...SEM_RECEITA_PAGE.deleteDialog,
      description: `${SEM_RECEITA_PAGE.deleteDialog.description} Medicamento: ${target.item.medicamento}.`,
    };
  }

  return {
    ...EXTRAS_PAGE.deleteDialog,
    description: `${EXTRAS_PAGE.deleteDialog.description} Medicamento: ${target.item.medicamento}.`,
  };
}

function getDeleteSuccessMessage(target) {
  if (target?.kind === "receita") {
    return RECEITAS_PAGE.list.deleteSuccessMessage;
  }

  if (target?.kind === "semReceita") {
    return SEM_RECEITA_PAGE.list.deleteSuccessMessage;
  }

  return EXTRAS_PAGE.list.deleteSuccessMessage;
}

function getReceitaPedidoKey(linha) {
  return `COM_RECEITA:${linha.linhaId}`;
}

function getSemReceitaPedidoKey(item) {
  return `SEM_RECEITA:${item.id}`;
}

function getExtraPedidoKey(item) {
  return `EXTRA:${item.id}`;
}

function getExtraQuantidadeRestante(item) {
  const restante = Number(item.quantidadeRestante);

  if (Number.isFinite(restante)) return Math.max(0, restante);

  const total = Number(item.quantidadeSolicitada ?? item.quantidade ?? 0) || 0;
  const regularizada =
    Number(item.quantidadeRegularizada ?? item.quantidadeDispensada ?? 0) || 0;

  return Math.max(0, total - regularizada);
}

function getQuantidadeDisponivelVisual(totalRestante, pedidoKey, pedidoMap) {
  const quantidadeRestante = Number(totalRestante) || 0;
  const quantidadeEmPedido = Number(pedidoMap[pedidoKey]) || 0;

  return Math.max(0, quantidadeRestante - quantidadeEmPedido);
}

function buildGlobalDraftItem({ item, selectedUtente, selectedUtenteId }) {
  return {
    ...item,
    utenteId: selectedUtenteId,
    utenteNome: selectedUtente?.nome || "Utente selecionado",
    utenteNumero9: selectedUtente?.numero9 || "",
  };
}

export default function SantaCasaOperacaoPage() {
  const {
    utentes,
    selectedUtenteId,
    selectedUtente,

    receitas,
    semReceita,
    extras,

    isLoadingUtentes,
    isLoadingData,
    isRefreshing,

    utentesError,
    dataError,

    handleSelectUtente,
    refreshOperationData,
  } = useSantaCasaOperacao();

  const {
    items: pedidoDraftItems,
    count: pedidoDraftCount,
    addItem: addPedidoDraftItem,
    removeItemsByKeys,
  } = usePedidoDraft();

  const [pedidoQuantities, setPedidoQuantities] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingTargetKey, setDeletingTargetKey] = useState(null);

  const [isCreatingReceita, setIsCreatingReceita] = useState(false);
  const [isCreatingSemReceita, setIsCreatingSemReceita] = useState(false);
  const [isCreatingExtra, setIsCreatingExtra] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const pedidoItemsQuantities = useMemo(
    () => buildDraftQuantityMap(pedidoDraftItems),
    [pedidoDraftItems],
  );

  const visibleReceitas = useMemo(
    () =>
      receitas.filter((linha) => {
        const pedidoKey = getReceitaPedidoKey(linha);

        return (
          getQuantidadeDisponivelVisual(
            linha.quantidadeRestante,
            pedidoKey,
            pedidoItemsQuantities,
          ) > 0
        );
      }),
    [receitas, pedidoItemsQuantities],
  );

  const visibleSemReceita = useMemo(
    () =>
      semReceita.filter((item) => {
        const pedidoKey = getSemReceitaPedidoKey(item);

        return (
          getQuantidadeDisponivelVisual(
            item.quantidadeRestante,
            pedidoKey,
            pedidoItemsQuantities,
          ) > 0
        );
      }),
    [semReceita, pedidoItemsQuantities],
  );

  const visibleExtras = useMemo(
    () =>
      extras.filter((item) => {
        const pedidoKey = getExtraPedidoKey(item);

        return (
          getQuantidadeDisponivelVisual(
            getExtraQuantidadeRestante(item),
            pedidoKey,
            pedidoItemsQuantities,
          ) > 0
        );
      }),
    [extras, pedidoItemsQuantities],
  );

  const deleteDialogData = getDeleteDialogData(deleteTarget);

  async function deleteCompatibleExtrasFromBackend(receitaItem) {
    if (!selectedUtenteId) {
      return {
        removedCount: 0,
        removedLabel: "",
      };
    }

    const matchingExtras = extras.filter((extra) =>
      isSameMedication(extra, receitaItem),
    );

    if (matchingExtras.length === 0) {
      return {
        removedCount: 0,
        removedLabel: "",
      };
    }

    const matchingExtraKeys = matchingExtras.map(
      (extra) => `EXTRA:${extra.id}`,
    );

    removeItemsByKeys(matchingExtraKeys);

    const removedLabel =
      matchingExtras.length === 1
        ? matchingExtras[0].medicamento
        : `${matchingExtras.length} Extras`;

    try {
      await Promise.all(
        matchingExtras.map((extra) => deleteExtra(selectedUtenteId, extra.id)),
      );

      await refreshOperationData();

      return {
        removedCount: matchingExtras.length,
        removedLabel,
      };
    } catch (requestError) {
      setFeedback({
        type: "error",
        message:
          requestError.message ||
          "Erro ao remover Extra incompatível com a receita disponível.",
      });

      await refreshOperationData();

      return {
        removedCount: 0,
        removedLabel: "",
      };
    }
  }

  function handleSelectOperationUtente(utenteId) {
    setPedidoQuantities({});
    setFeedback(null);
    handleSelectUtente(utenteId);
  }

  function handlePedidoQuantityInputChange(itemKey, value, max) {
    const nextQuantity = max > 0 ? clampQuantity(value, max) : 0;

    setPedidoQuantities((currentQuantities) => ({
      ...currentQuantities,
      [itemKey]: nextQuantity,
    }));
  }

  async function handleCreateReceita(payload) {
    if (!selectedUtenteId) {
      return {
        ok: false,
        fieldErrors: {},
      };
    }

    setIsCreatingReceita(true);
    setFeedback(null);

    try {
      const createdReceita = await createReceita(selectedUtenteId, payload);

      const extrasResolvidos = Array.isArray(createdReceita?.extrasResolvidos)
        ? createdReceita.extrasResolvidos
        : [];

      const extraKeysToRemove = getResolvedExtraKeys(extrasResolvidos);

      if (extraKeysToRemove.length > 0) {
        removeItemsByKeys(extraKeysToRemove);
      }

      await refreshOperationData();

      setFeedback({
        type: "success",
        message: `${RECEITAS_PAGE.form.successMessage}${buildResolvedExtrasMessage(
          extrasResolvidos,
        )}`,
      });

      return {
        ok: true,
        fieldErrors: {},
      };
    } catch (requestError) {
      const message = requestError.message || "Erro ao criar receita.";

      setFeedback({
        type: "error",
        message,
      });

      return {
        ok: false,
        fieldErrors: getReceitaFieldErrors(requestError),
      };
    } finally {
      setIsCreatingReceita(false);
    }
  }

  async function handleCreateSemReceita(payload) {
    if (!selectedUtenteId) {
      return {
        ok: false,
        fieldErrors: {},
      };
    }

    setIsCreatingSemReceita(true);
    setFeedback(null);

    try {
      await createSemReceita(selectedUtenteId, payload);
      await refreshOperationData();

      setFeedback({
        type: "success",
        message: SEM_RECEITA_PAGE.form.successMessage,
      });

      return {
        ok: true,
        fieldErrors: {},
      };
    } catch (requestError) {
      setFeedback({
        type: "error",
        message:
          requestError.message || "Erro ao criar medicamento sem receita.",
      });

      return {
        ok: false,
        fieldErrors: {},
      };
    } finally {
      setIsCreatingSemReceita(false);
    }
  }

  async function handleCreateExtra(payload) {
    if (!selectedUtenteId) {
      return {
        ok: false,
        fieldErrors: {},
      };
    }

    setIsCreatingExtra(true);
    setFeedback(null);

    try {
      await createExtra(selectedUtenteId, {
        ...payload,
        receitaDraftItems: buildReceitaDraftItems(
          pedidoDraftItems,
          selectedUtenteId,
        ),
      });

      await refreshOperationData();

      setFeedback({
        type: "success",
        message: EXTRAS_PAGE.form.successMessage,
      });

      return {
        ok: true,
        fieldErrors: {},
      };
    } catch (requestError) {
      setFeedback({
        type: "error",
        message: requestError.message || "Erro ao criar Extra.",
      });

      return {
        ok: false,
        fieldErrors: {},
      };
    } finally {
      setIsCreatingExtra(false);
    }
  }

  function handleAddPedidoItem(item) {
    if (!selectedUtenteId) return;

    const maxAvailable = Number(item.quantidadeRestante) || 0;

    const existingItem = pedidoDraftItems.find(
      (currentItem) => currentItem.key === item.key,
    );

    const currentQuantityInPedido = Number(existingItem?.quantidade) || 0;
    const availableToAdd = Math.max(0, maxAvailable - currentQuantityInPedido);

    if (availableToAdd <= 0) {
      setFeedback({
        type: "info",
        message: `${getItemMedicationName(
          item,
        )} já está totalmente no pedido geral.`,
      });

      return;
    }

    const quantityToAdd = clampQuantity(item.quantidade, availableToAdd);
    const nextQuantityInPedido = Math.min(
      currentQuantityInPedido + quantityToAdd,
      maxAvailable,
    );
    const remainingQuantity = Math.max(0, maxAvailable - nextQuantityInPedido);

    addPedidoDraftItem(
      buildGlobalDraftItem({
        item: {
          ...item,
          quantidade: quantityToAdd,
        },
        selectedUtente,
        selectedUtenteId,
      }),
    );

    setPedidoQuantities((currentQuantities) => ({
      ...currentQuantities,
      [item.key]: 1,
    }));

    setFeedback({
      type: "success",
      message: buildAddToPedidoMessage({
        item,
        addedQuantity: quantityToAdd,
        remainingQuantity,
        utenteNome: selectedUtente?.nome || "utente selecionado",
      }),
    });
  }

  function handleBlockedDelete(item, quantidadeEmPedido) {
    const medicamento = getItemMedicationName(item);
    const quantityLabel = formatUnitsLabel(quantidadeEmPedido);

    setFeedback({
      type: "info",
      message: `Não é possível remover ${medicamento} porque ainda existem ${quantityLabel} no pedido geral. Retira primeiro essa quantidade na página Pedidos.`,
    });
  }

  function handleRequestDelete(kind, item) {
    setDeleteTarget({
      kind,
      item,
    });
    setFeedback(null);
  }

  function handleCancelDelete() {
    if (deletingTargetKey) return;

    setDeleteTarget(null);
  }

  async function handleConfirmDelete() {
    if (!selectedUtenteId || !deleteTarget) return;

    const targetKey = getDeleteTargetKey(deleteTarget);

    setDeletingTargetKey(targetKey);
    setFeedback(null);

    try {
      if (deleteTarget.kind === "receita") {
        await deleteReceitaLinha(selectedUtenteId, deleteTarget.item.linhaId);
      }

      if (deleteTarget.kind === "semReceita") {
        await deleteSemReceita(selectedUtenteId, deleteTarget.item.id);
      }

      if (deleteTarget.kind === "extra") {
        await deleteExtra(selectedUtenteId, deleteTarget.item.id);
      }

      const pedidoKey = getPedidoKeyFromDeleteTarget(deleteTarget);
      removeItemsByKeys([pedidoKey]);

      await refreshOperationData();

      setFeedback({
        type: "success",
        message: getDeleteSuccessMessage(deleteTarget),
      });

      setDeleteTarget(null);
    } catch (requestError) {
      setFeedback({
        type: "error",
        message: requestError.message || "Erro ao remover item.",
      });
    } finally {
      setDeletingTargetKey(null);
    }
  }

  async function handleAfterReceitaQuantityBackToList(receitaItem) {
    const extraInfo = await deleteCompatibleExtrasFromBackend(receitaItem);

    if (extraInfo.removedCount > 0) {
      setFeedback({
        type: "info",
        message: `${extraInfo.removedLabel} removido dos Extras em aberto e do pedido geral, porque voltou a existir quantidade disponível com receita para o mesmo medicamento.`,
      });
    }
  }

  return (
    <section className={styles.page} aria-labelledby="operacao-title">
      <PageHeader
        titleId="operacao-title"
        eyebrow="Santa Casa"
        title="Operação diária"
        description="Gere receitas, medicamentos sem receita e Extras. A partir daqui podes adicionar itens ao pedido geral para a Farmácia."
        actions={
          <Button
            type="button"
            variant="secondary"
            onClick={refreshOperationData}
            isLoading={isRefreshing}
            disabled={!selectedUtenteId || isRefreshing}
          >
            {isRefreshing ? "A atualizar..." : "Atualizar operação"}
          </Button>
        }
      />

      <SantaCasaSectionNav />

      <SurfaceCard
        eyebrow="Utente selecionado"
        title={selectedUtente?.nome || "Seleciona um utente"}
        description={
          selectedUtente
            ? `Número de utente: ${selectedUtente.numero9}`
            : "Escolhe um utente para carregar receitas, medicamentos sem receita e Extras."
        }
        tone="green"
      >
        <UtenteSelector
          utentes={utentes}
          value={selectedUtenteId}
          onChange={handleSelectOperationUtente}
          isLoading={isLoadingUtentes}
          error={utentesError}
        />

        {dataError ? (
          <p className={styles.error} role="alert">
            {dataError}
          </p>
        ) : null}

        {selectedUtente ? (
          <div
            className={styles.summary}
            aria-label="Resumo operacional"
            role="list"
          >
            <article role="listitem">
              <strong>{receitas.length}</strong>
              <span>Linhas de receita</span>
            </article>

            <article role="listitem">
              <strong>{semReceita.length}</strong>
              <span>Sem receita</span>
            </article>

            <article role="listitem">
              <strong>{extras.length}</strong>
              <span>Extras</span>
            </article>

            <article role="listitem">
              <strong>{pedidoDraftCount}</strong>
              <span>No pedido geral</span>
            </article>
          </div>
        ) : null}
      </SurfaceCard>

      <SurfaceCard
        eyebrow="Pedido geral"
        title="Itens selecionados para Farmácia"
        description="Os itens adicionados nesta página ficam guardados no pedido geral. Podes adicionar itens de vários utentes e enviar tudo pela página Pedidos."
        tone="gold"
      >
        <div className={styles.draftNotice}>
          <p>
            Existem <strong>{pedidoDraftCount}</strong>{" "}
            {pedidoDraftCount === 1 ? "item" : "itens"} no pedido geral.
          </p>

          <Link to="/santacasa/pedidos" className={styles.draftLink}>
            Ver pedido geral
          </Link>
        </div>
      </SurfaceCard>

      <div className={styles.sections}>
        <OperationSection
          id="operacao-receitas"
          eyebrow="Receitas"
          title="Receitas do utente"
          description="Cria receitas, seleciona linhas para o pedido geral ou remove linhas ainda removíveis."
        >
          <ReceitaCreateForm
            selectedUtenteId={selectedUtenteId}
            onCreate={handleCreateReceita}
            isSubmitting={isCreatingReceita}
          />

          <ReceitasList
            receitas={visibleReceitas}
            selectedUtenteId={selectedUtenteId}
            selectedUtente={selectedUtente}
            isLoading={isLoadingData}
            error={dataError}
            deletingLinhaId={getDeletingId(deletingTargetKey, "receita")}
            pedidoQuantities={pedidoQuantities}
            pedidoItemsQuantities={pedidoItemsQuantities}
            onPedidoQuantityChange={handlePedidoQuantityInputChange}
            onAddToPedido={handleAddPedidoItem}
            onRetry={refreshOperationData}
            onBlockedDelete={handleBlockedDelete}
            onDelete={(linha) => handleRequestDelete("receita", linha)}
            onQuantityBackToList={handleAfterReceitaQuantityBackToList}
          />
        </OperationSection>

        <OperationSection
          id="operacao-sem-receita"
          eyebrow="Sem Receita"
          title="Medicamentos sem receita"
          description="Adiciona medicamentos sem receita, seleciona para o pedido geral ou remove registos ainda removíveis."
        >
          <SemReceitaCreateForm
            selectedUtenteId={selectedUtenteId}
            onCreate={handleCreateSemReceita}
            isSubmitting={isCreatingSemReceita}
          />

          <SemReceitaList
            items={visibleSemReceita}
            selectedUtenteId={selectedUtenteId}
            selectedUtente={selectedUtente}
            isLoading={isLoadingData}
            error={dataError}
            deletingItemId={getDeletingId(deletingTargetKey, "semReceita")}
            pedidoQuantities={pedidoQuantities}
            pedidoItemsQuantities={pedidoItemsQuantities}
            onPedidoQuantityChange={handlePedidoQuantityInputChange}
            onAddToPedido={handleAddPedidoItem}
            onRetry={refreshOperationData}
            onBlockedDelete={handleBlockedDelete}
            onDelete={(item) => handleRequestDelete("semReceita", item)}
          />
        </OperationSection>

        <OperationSection
          id="operacao-extras"
          eyebrow="Extras"
          title="Extras em aberto"
          description="Cria Extras, seleciona para o pedido geral ou remove Extras ainda removíveis."
        >
          <ExtraCreateForm
            selectedUtenteId={selectedUtenteId}
            onCreate={handleCreateExtra}
            isSubmitting={isCreatingExtra}
          />

          <ExtrasList
            items={visibleExtras}
            selectedUtenteId={selectedUtenteId}
            selectedUtente={selectedUtente}
            isLoading={isLoadingData}
            error={dataError}
            deletingItemId={getDeletingId(deletingTargetKey, "extra")}
            pedidoQuantities={pedidoQuantities}
            pedidoItemsQuantities={pedidoItemsQuantities}
            onPedidoQuantityChange={handlePedidoQuantityInputChange}
            onAddToPedido={handleAddPedidoItem}
            onRetry={refreshOperationData}
            onBlockedDelete={handleBlockedDelete}
            onDelete={(item) => handleRequestDelete("extra", item)}
          />
        </OperationSection>
      </div>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title={deleteDialogData.title}
        description={deleteDialogData.description}
        confirmLabel={deleteDialogData.confirmLabel}
        cancelLabel={deleteDialogData.cancelLabel}
        isLoading={Boolean(deletingTargetKey)}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <FeedbackDialog
        isOpen={Boolean(feedback)}
        type={feedback?.type}
        message={feedback?.message}
        onClose={() => setFeedback(null)}
      />
    </section>
  );
}
