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

import PedidoDraft from "../../features/santacasa/pedidos/components/PedidoDraft/PedidoDraft";
import { createPedido } from "../../features/santacasa/pedidos/api/pedidosApi";
import { PEDIDOS_PAGE } from "../../features/santacasa/pedidos/config/pedidosPage.config";
import {
  clampQuantity,
  normalizeExtraItems,
  normalizeReceitaItems,
  normalizeSemReceitaItems,
  sortPedidoItems,
} from "../../features/santacasa/pedidos/utils/pedidoItems";

import OperationSection from "../../features/santacasa/operacao/components/OperationSection/OperationSection";
import { useSantaCasaOperacao } from "../../features/santacasa/operacao/hooks/useSantaCasaOperacao";

import styles from "./SantaCasaOperacaoPage.module.css";

function buildAvailablePedidoItems({ receitas, semReceita, extras }) {
  return sortPedidoItems([
    ...normalizeReceitaItems(receitas),
    ...normalizeSemReceitaItems(semReceita),
    ...normalizeExtraItems(extras),
  ]);
}

function buildDraftPedidoItems({ selectedPedidoItems, availablePedidoItems }) {
  const availableItemsByKey = new Map(
    availablePedidoItems.map((item) => [item.key, item]),
  );

  const draftItems = selectedPedidoItems
    .map((selectedItem) => {
      const availableItem = availableItemsByKey.get(selectedItem.key);

      if (!availableItem) return null;

      return {
        ...availableItem,
        quantidade: clampQuantity(
          selectedItem.quantidade,
          availableItem.quantidadeRestante,
        ),
      };
    })
    .filter(Boolean);

  return sortPedidoItems(draftItems);
}

function buildPedidoPayload(utenteId, draftItems) {
  return {
    items: draftItems.map((item) => ({
      utenteId,
      tipo: item.tipo,
      id: item.id,
      quantidade: Number(item.quantidade),
    })),
  };
}

function buildDraftQuantityMap(items = []) {
  const map = {};

  items.forEach((item) => {
    map[item.key] = Number(item.quantidade) || 0;
  });

  return map;
}

function buildReceitaDraftItems(draftItems = []) {
  return draftItems
    .filter((item) => item.tipo === "COM_RECEITA")
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

function buildAddToPedidoMessage({ item, addedQuantity, remainingQuantity }) {
  const medicamento = getItemMedicationName(item);
  const originLabel = getOriginListLabel(item.tipo);
  const addVerb = formatVerbByQuantity(
    addedQuantity,
    "adicionada",
    "adicionadas",
  );

  const baseMessage = `${formatUnitsLabel(
    addedQuantity,
  )} de ${medicamento} ${addVerb} ao pedido.`;

  if (remainingQuantity <= 0) {
    return `${baseMessage} Toda a quantidade disponível ficou no pedido. O item deixou de aparecer em ${originLabel}.`;
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

  const [selectedPedidoItems, setSelectedPedidoItems] = useState([]);
  const [pedidoQuantities, setPedidoQuantities] = useState({});
  const [pedidoReturnQuantities, setPedidoReturnQuantities] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingTargetKey, setDeletingTargetKey] = useState(null);

  const [isCreatingReceita, setIsCreatingReceita] = useState(false);
  const [isCreatingSemReceita, setIsCreatingSemReceita] = useState(false);
  const [isCreatingExtra, setIsCreatingExtra] = useState(false);
  const [isSubmittingPedido, setIsSubmittingPedido] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const availablePedidoItems = useMemo(
    () =>
      buildAvailablePedidoItems({
        receitas,
        semReceita,
        extras,
      }),
    [receitas, semReceita, extras],
  );

  const draftItems = useMemo(
    () =>
      buildDraftPedidoItems({
        selectedPedidoItems,
        availablePedidoItems,
      }),
    [selectedPedidoItems, availablePedidoItems],
  );

  const pedidoItemsQuantities = useMemo(
    () => buildDraftQuantityMap(draftItems),
    [draftItems],
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

  function removeExtraFromDraft(extraId) {
    const extraPedidoKey = `EXTRA:${extraId}`;

    setSelectedPedidoItems((currentItems) =>
      currentItems.filter((item) => item.key !== extraPedidoKey),
    );

    setPedidoQuantities((currentQuantities) => ({
      ...currentQuantities,
      [extraPedidoKey]: 1,
    }));

    setPedidoReturnQuantities((currentQuantities) => ({
      ...currentQuantities,
      [extraPedidoKey]: 1,
    }));
  }

  async function deleteCompatibleExtrasFromBackend(
    receitaItem,
    { showFeedback = true } = {},
  ) {
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

    matchingExtras.forEach((extra) => {
      removeExtraFromDraft(extra.id);
    });

    const removedLabel =
      matchingExtras.length === 1
        ? matchingExtras[0].medicamento
        : `${matchingExtras.length} Extras`;

    try {
      await Promise.all(
        matchingExtras.map((extra) => deleteExtra(selectedUtenteId, extra.id)),
      );

      await refreshOperationData();

      if (showFeedback) {
        setFeedback({
          type: "info",
          message: `${removedLabel} removido do pedido e dos Extras em aberto, porque voltou a existir quantidade disponível com receita para o mesmo medicamento.`,
        });
      }

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
    setSelectedPedidoItems([]);
    setPedidoQuantities({});
    setPedidoReturnQuantities({});
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

  function handlePedidoReturnQuantityChange(itemKey, value, max) {
    const quantity = max > 0 ? clampQuantity(value, max) : 0;

    setPedidoReturnQuantities((currentQuantities) => ({
      ...currentQuantities,
      [itemKey]: quantity,
    }));
  }

  async function handleReturnPedidoQuantity(itemKey, quantityToReturn) {
    const draftItem = draftItems.find((item) => item.key === itemKey);

    if (!draftItem) return;

    const currentQuantity = Number(draftItem.quantidade) || 0;
    const returnQuantity = clampQuantity(quantityToReturn, currentQuantity);
    const medicamento = getItemMedicationName(draftItem);

    setSelectedPedidoItems((currentItems) =>
      currentItems
        .map((item) => {
          if (item.key !== itemKey) return item;

          const nextQuantity = currentQuantity - returnQuantity;

          if (nextQuantity <= 0) return null;

          return {
            ...item,
            quantidade: nextQuantity,
          };
        })
        .filter(Boolean),
    );

    setPedidoReturnQuantities((currentQuantities) => ({
      ...currentQuantities,
      [itemKey]: 1,
    }));

    setPedidoQuantities((currentQuantities) => ({
      ...currentQuantities,
      [itemKey]: 1,
    }));

    let extraInfo = null;

    if (draftItem.tipo === "COM_RECEITA") {
      extraInfo = await deleteCompatibleExtrasFromBackend(draftItem, {
        showFeedback: false,
      });
    }

    const baseMessage = `${formatUnitsLabel(returnQuantity)} de ${medicamento} retiradas do pedido. A quantidade voltou a ficar disponível na lista correspondente.`;

    const extraMessage =
      extraInfo?.removedCount > 0
        ? ` ${extraInfo.removedLabel} foi removido dos Extras em aberto porque voltou a existir quantidade disponível com receita para o mesmo medicamento.`
        : "";

    setFeedback({
      type: "success",
      message: `${baseMessage}${extraMessage}`,
    });
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
      await createReceita(selectedUtenteId, payload);
      await refreshOperationData();

      setFeedback({
        type: "success",
        message: RECEITAS_PAGE.form.successMessage,
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
        receitaDraftItems: buildReceitaDraftItems(draftItems),
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
    const maxAvailable = Number(item.quantidadeRestante) || 0;

    const existingItem = selectedPedidoItems.find(
      (currentItem) => currentItem.key === item.key,
    );

    const currentQuantityInPedido = Number(existingItem?.quantidade) || 0;
    const availableToAdd = Math.max(0, maxAvailable - currentQuantityInPedido);

    if (availableToAdd <= 0) {
      setFeedback({
        type: "info",
        message: `${getItemMedicationName(
          item,
        )} já está totalmente no pedido em preparação.`,
      });

      return;
    }

    const quantityToAdd = clampQuantity(item.quantidade, availableToAdd);
    const nextQuantityInPedido = Math.min(
      currentQuantityInPedido + quantityToAdd,
      maxAvailable,
    );
    const remainingQuantity = Math.max(0, maxAvailable - nextQuantityInPedido);

    setSelectedPedidoItems((currentItems) => {
      const alreadyExists = currentItems.some(
        (currentItem) => currentItem.key === item.key,
      );

      if (!alreadyExists) {
        return [
          ...currentItems,
          {
            key: item.key,
            quantidade: quantityToAdd,
          },
        ];
      }

      return currentItems.map((currentItem) => {
        if (currentItem.key !== item.key) return currentItem;

        return {
          ...currentItem,
          quantidade: nextQuantityInPedido,
        };
      });
    });

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
      }),
    });
  }

  async function handlePedidoDraftQuantityChange(itemKey, value) {
    const draftItem = draftItems.find((item) => item.key === itemKey);

    if (!draftItem) return;

    const currentQuantity = Number(draftItem.quantidade) || 0;
    const nextQuantity = clampQuantity(value, draftItem.quantidadeRestante);

    setSelectedPedidoItems((currentItems) =>
      currentItems.map((item) =>
        item.key === itemKey
          ? {
              ...item,
              quantidade: nextQuantity,
            }
          : item,
      ),
    );

    if (draftItem.tipo === "COM_RECEITA" && nextQuantity < currentQuantity) {
      await deleteCompatibleExtrasFromBackend(draftItem);
    }
  }

  async function handleRemovePedidoItem(itemKey) {
    const draftItem = draftItems.find((item) => item.key === itemKey);

    setSelectedPedidoItems((currentItems) =>
      currentItems.filter((item) => item.key !== itemKey),
    );

    setPedidoQuantities((currentQuantities) => ({
      ...currentQuantities,
      [itemKey]: 1,
    }));

    setPedidoReturnQuantities((currentQuantities) => ({
      ...currentQuantities,
      [itemKey]: 1,
    }));

    if (draftItem?.tipo === "COM_RECEITA") {
      await deleteCompatibleExtrasFromBackend(draftItem);
    }
  }

  function handleBlockedDelete(item, quantidadeEmPedido) {
    const medicamento = getItemMedicationName(item);
    const quantityLabel = formatUnitsLabel(quantidadeEmPedido);

    setFeedback({
      type: "info",
      message: `Não é possível remover ${medicamento} porque ainda existem ${quantityLabel} no pedido em preparação. Retira primeiro essa quantidade do pedido.`,
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

      setSelectedPedidoItems((currentItems) =>
        currentItems.filter((item) => item.key !== pedidoKey),
      );

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

  async function handleSubmitPedido(event) {
    event.preventDefault();

    if (!selectedUtenteId || draftItems.length === 0) return;

    setIsSubmittingPedido(true);
    setFeedback(null);

    try {
      await createPedido(buildPedidoPayload(selectedUtenteId, draftItems));

      setSelectedPedidoItems([]);
      setPedidoQuantities({});
      setPedidoReturnQuantities({});

      await refreshOperationData();

      setFeedback({
        type: "success",
        message: PEDIDOS_PAGE.sections.draft.successMessage,
      });
    } catch (requestError) {
      setFeedback({
        type: "error",
        message: requestError.message || "Erro ao criar pedido.",
      });
    } finally {
      setIsSubmittingPedido(false);
    }
  }

  return (
    <section className={styles.page} aria-labelledby="operacao-title">
      <PageHeader
        titleId="operacao-title"
        eyebrow="Santa Casa"
        title="Operação diária"
        description="Centraliza receitas, medicamentos sem receita, Extras e criação de pedidos numa única página organizada."
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
              <strong>{draftItems.length}</strong>
              <span>No pedido</span>
            </article>
          </div>
        ) : null}
      </SurfaceCard>

      <div className={styles.sections}>
        <OperationSection
          id="operacao-receitas"
          eyebrow="Receitas"
          title="Receitas do utente"
          description="Cria receitas, seleciona linhas para pedido ou remove linhas ainda removíveis."
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
          />
        </OperationSection>

        <OperationSection
          id="operacao-sem-receita"
          eyebrow="Sem Receita"
          title="Medicamentos sem receita"
          description="Adiciona medicamentos sem receita, seleciona para pedido ou remove registos ainda removíveis."
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
          description="Cria Extras, seleciona para pedido ou remove Extras ainda removíveis."
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

        <OperationSection
          id="operacao-pedidos"
          eyebrow="Pedido"
          title="Pedido para Farmácia"
          description="Aqui aparecem apenas os itens selecionados nas listas acima."
        >
          <PedidoDraft
            items={draftItems}
            returnQuantities={pedidoReturnQuantities}
            isSubmitting={isSubmittingPedido}
            onQuantityChange={handlePedidoDraftQuantityChange}
            onReturnQuantityChange={handlePedidoReturnQuantityChange}
            onReturnQuantity={handleReturnPedidoQuantity}
            onRemove={handleRemovePedidoItem}
            onSubmit={handleSubmitPedido}
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
