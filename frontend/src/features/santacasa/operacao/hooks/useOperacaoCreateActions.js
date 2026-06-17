// src/features/santacasa/operacao/hooks/useOperacaoCreateActions.js
import { useState } from "react";

import { createReceita } from "../../receitas/api/receitasApi";
import { createSemReceita } from "../../semReceita/api/semReceitaApi";
import { createExtra } from "../../extras/api/extrasApi";

import { SEM_RECEITA_PAGE } from "../../semReceita/config/semReceitaPage.config";
import { EXTRAS_PAGE } from "../../extras/config/extrasPage.config";

import {
  buildReceitaDraftItems,
  getReceitaFieldErrors,
  getRegularizacaoConfirmationDetails,
  isRegularizacaoConfirmationRequired,
} from "../utils/santaCasaOperacao.utils";

export function useOperacaoCreateActions({
  selectedUtenteId,
  pedidoDraftItems,
  refreshOperationData,
  handleAuthError,
  setFeedback,
  setRegularizacaoConfirmation,
  handleCreatedReceitaSuccess,
}) {
  const [isCreatingReceita, setIsCreatingReceita] = useState(false);
  const [isCreatingSemReceita, setIsCreatingSemReceita] = useState(false);
  const [isCreatingExtra, setIsCreatingExtra] = useState(false);

  async function handleCreateReceita(payload) {
    if (!selectedUtenteId) {
      return {
        ok: false,
        fieldErrors: {},
      };
    }

    setIsCreatingReceita(true);
    setFeedback(null);
    setRegularizacaoConfirmation(null);

    try {
      const createdReceita = await createReceita(selectedUtenteId, payload);

      await handleCreatedReceitaSuccess(createdReceita);

      return {
        ok: true,
        fieldErrors: {},
      };
    } catch (requestError) {
      if (handleAuthError(requestError)) {
        return {
          ok: false,
          fieldErrors: {},
        };
      }

      if (isRegularizacaoConfirmationRequired(requestError)) {
        setRegularizacaoConfirmation({
          payload,
          preview: getRegularizacaoConfirmationDetails(requestError),
        });

        return {
          ok: false,
          fieldErrors: {},
        };
      }

      setFeedback({
        type: "error",
        message: requestError.message || "Erro ao criar receita.",
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
      if (handleAuthError(requestError)) {
        return {
          ok: false,
          fieldErrors: {},
        };
      }

      setFeedback({
        type: "error",
        message:
          requestError.message ||
          "Erro ao criar medicamento não sujeito a receita médica.",
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
      if (handleAuthError(requestError)) {
        return {
          ok: false,
          fieldErrors: {},
        };
      }

      setFeedback({
        type: "error",
        message: requestError.message || "Erro ao criar Venda Suspensa.",
      });

      return {
        ok: false,
        fieldErrors: {},
      };
    } finally {
      setIsCreatingExtra(false);
    }
  }

  return {
    isCreatingReceita,
    isCreatingSemReceita,
    isCreatingExtra,

    handleCreateReceita,
    handleCreateSemReceita,
    handleCreateExtra,
  };
}
