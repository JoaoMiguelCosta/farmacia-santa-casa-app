// src/features/santacasa/medicacao-habitual/hooks/useMedicacaoHabitualCreate.js
import { useCallback, useState } from "react";

import { createMedicacaoHabitual as createMedicacaoHabitualRequest } from "../api/medicacaoHabitualApi";

import { MEDICACAO_HABITUAL_CONFIG } from "../config/medicacaoHabitual.config";

import {
  buildMedicacaoHabitualPayload,
  isDuplicateMedicacaoHabitual,
  sortMedicacaoHabitualByName,
  validateMedicacaoHabitualValue,
} from "../utils/medicacaoHabitual.utils";

function getErrorMessage(error, fallback) {
  return error?.message || fallback;
}

export function useMedicacaoHabitualCreate({
  selectedUtenteId,
  medicacoes,
  setMedicacoes,
  setFeedback,
  handleAuthError,
}) {
  const [medicamentoInput, setMedicamentoInput] = useState("");
  const [inputError, setInputError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const updateMedicamentoInput = useCallback((value) => {
    setMedicamentoInput(value);
    setInputError("");
  }, []);

  const resetCreateState = useCallback(() => {
    setMedicamentoInput("");
    setInputError("");
  }, []);

  const createMedicacaoHabitualItem = useCallback(
    async (value = medicamentoInput) => {
      if (!selectedUtenteId) {
        setFeedback({
          type: "error",
          message: MEDICACAO_HABITUAL_CONFIG.feedback.missingUtente,
        });

        return {
          ok: false,
          data: null,
        };
      }

      const validationError = validateMedicacaoHabitualValue(value);

      if (validationError) {
        setInputError(validationError);

        return {
          ok: false,
          data: null,
        };
      }

      if (isDuplicateMedicacaoHabitual(medicacoes, value)) {
        setInputError(
          MEDICACAO_HABITUAL_CONFIG.validation.duplicateMedicamento,
        );

        return {
          ok: false,
          data: null,
        };
      }

      setIsCreating(true);
      setInputError("");
      setFeedback(null);

      try {
        const payload = buildMedicacaoHabitualPayload(value);

        const created = await createMedicacaoHabitualRequest(
          selectedUtenteId,
          payload,
        );

        setMedicacoes((currentItems) =>
          sortMedicacaoHabitualByName([...currentItems, created]),
        );

        setMedicamentoInput("");

        setFeedback({
          type: "success",
          message: MEDICACAO_HABITUAL_CONFIG.form.successMessage,
        });

        return {
          ok: true,
          data: created,
        };
      } catch (createError) {
        if (handleAuthError(createError)) {
          return {
            ok: false,
            data: null,
          };
        }

        setFeedback({
          type: "error",
          message: getErrorMessage(
            createError,
            MEDICACAO_HABITUAL_CONFIG.feedback.genericError,
          ),
        });

        return {
          ok: false,
          data: null,
        };
      } finally {
        setIsCreating(false);
      }
    },
    [
      handleAuthError,
      medicacoes,
      medicamentoInput,
      selectedUtenteId,
      setFeedback,
      setMedicacoes,
    ],
  );

  const handleSubmit = useCallback(
    async (event) => {
      event?.preventDefault?.();

      return createMedicacaoHabitualItem(medicamentoInput);
    },
    [createMedicacaoHabitualItem, medicamentoInput],
  );

  return {
    medicamentoInput,
    inputError,
    isCreating,

    updateMedicamentoInput,
    handleSubmit,
    createMedicacaoHabitualItem,

    resetCreateState,
  };
}
