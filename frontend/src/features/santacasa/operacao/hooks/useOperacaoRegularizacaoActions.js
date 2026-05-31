// src/features/santacasa/operacao/hooks/useOperacaoRegularizacaoActions.js
import { useState } from "react";

import { createReceita } from "../../receitas/api/receitasApi";
import { deleteExtra } from "../../extras/api/extrasApi";

import { RECEITAS_PAGE } from "../../receitas/config/receitasPage.config";

import {
  buildReceitaSuccessMessage,
  buildRegularizacaoConfirmationDescription,
  getResolvedExtraKeys,
  isSameMedication,
} from "../utils/santaCasaOperacao.utils";

export function useOperacaoRegularizacaoActions({
  selectedUtenteId,
  extras,
  removeItemsByKeys,
  refreshOperationData,
  handleAuthError,
  setFeedback,
}) {
  const [regularizacaoConfirmation, setRegularizacaoConfirmation] =
    useState(null);

  const [receitaFormResetKey, setReceitaFormResetKey] = useState(0);

  const [isConfirmingRegularizacao, setIsConfirmingRegularizacao] =
    useState(false);

  const regularizacaoDialogData = regularizacaoConfirmation
    ? {
        title: RECEITAS_PAGE.regularizationDialog.title,
        description: buildRegularizacaoConfirmationDescription(
          regularizacaoConfirmation.preview,
        ),
        confirmLabel: RECEITAS_PAGE.regularizationDialog.confirmLabel,
        cancelLabel: RECEITAS_PAGE.regularizationDialog.cancelLabel,
      }
    : {
        title: RECEITAS_PAGE.regularizationDialog.title,
        description: RECEITAS_PAGE.regularizationDialog.description,
        confirmLabel: RECEITAS_PAGE.regularizationDialog.confirmLabel,
        cancelLabel: RECEITAS_PAGE.regularizationDialog.cancelLabel,
      };

  function resetRegularizacaoConfirmation() {
    setRegularizacaoConfirmation(null);
  }

  async function handleCreatedReceitaSuccess(createdReceita) {
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
      message: buildReceitaSuccessMessage(createdReceita, extrasResolvidos),
    });
  }

  function handleCancelRegularizacaoConfirmation() {
    if (isConfirmingRegularizacao) return;

    setRegularizacaoConfirmation(null);
  }

  async function handleConfirmRegularizacaoConfirmation() {
    if (!selectedUtenteId || !regularizacaoConfirmation?.payload) return;

    setIsConfirmingRegularizacao(true);
    setFeedback(null);

    try {
      const createdReceita = await createReceita(selectedUtenteId, {
        ...regularizacaoConfirmation.payload,
        confirmRegularizacao: true,
      });

      await handleCreatedReceitaSuccess(createdReceita);

      setRegularizacaoConfirmation(null);
      setReceitaFormResetKey((currentValue) => currentValue + 1);
    } catch (requestError) {
      if (handleAuthError(requestError)) return;

      setFeedback({
        type: "error",
        message: requestError.message || "Erro ao confirmar regularização.",
      });
    } finally {
      setIsConfirmingRegularizacao(false);
    }
  }

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
        : `${matchingExtras.length} vendas suspensas`;

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
      if (handleAuthError(requestError)) {
        return {
          removedCount: 0,
          removedLabel: "",
        };
      }

      setFeedback({
        type: "error",
        message:
          requestError.message ||
          "Erro ao remover Venda Suspensa incompatível com a receita disponível.",
      });

      await refreshOperationData();

      return {
        removedCount: 0,
        removedLabel: "",
      };
    }
  }

  async function handleAfterReceitaQuantityBackToList(receitaItem) {
    const extraInfo = await deleteCompatibleExtrasFromBackend(receitaItem);

    if (extraInfo.removedCount > 0) {
      const removedVerb =
        extraInfo.removedCount === 1 ? "removido" : "removidas";

      const sameMedicationLabel =
        extraInfo.removedCount === 1
          ? "o mesmo medicamento"
          : "os mesmos medicamentos";

      setFeedback({
        type: "info",
        message: `${extraInfo.removedLabel} ${removedVerb} das vendas suspensas em aberto e do pedido geral, porque voltou a existir quantidade disponível com receita para ${sameMedicationLabel}.`,
      });
    }
  }

  return {
    regularizacaoConfirmation,
    setRegularizacaoConfirmation,
    regularizacaoDialogData,
    receitaFormResetKey,
    isConfirmingRegularizacao,

    handleCreatedReceitaSuccess,
    handleCancelRegularizacaoConfirmation,
    handleConfirmRegularizacaoConfirmation,
    handleAfterReceitaQuantityBackToList,
    resetRegularizacaoConfirmation,
  };
}
