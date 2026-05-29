import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "../../../auth/hooks/useAuth";

import {
  clearMedicacaoHabitual as clearMedicacaoHabitualRequest,
  createMedicacaoHabitual as createMedicacaoHabitualRequest,
  deleteMedicacaoHabitual as deleteMedicacaoHabitualRequest,
  getMedicacaoHabitualByUtente,
} from "../api/medicacaoHabitualApi";

import { MEDICACAO_HABITUAL_CONFIG } from "../config/medicacaoHabitual.config";

import {
  buildMedicacaoHabitualOptions,
  buildMedicacaoHabitualPayload,
  isDuplicateMedicacaoHabitual,
  sortMedicacaoHabitualByName,
  validateMedicacaoHabitualValue,
} from "../utils/medicacaoHabitual.utils";

function getErrorMessage(error, fallback) {
  return error?.message || fallback;
}

export function useMedicacaoHabitual({ selectedUtenteId } = {}) {
  const { handleAuthError } = useAuth();

  const [medicacoes, setMedicacoes] = useState([]);

  const [medicamentoInput, setMedicamentoInput] = useState("");
  const [inputError, setInputError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(Boolean(selectedUtenteId));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const [deletingMedicacaoId, setDeletingMedicacaoId] = useState(null);

  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const hasMedicacoes = medicacoes.length > 0;

  const options = useMemo(() => {
    return buildMedicacaoHabitualOptions(medicacoes);
  }, [medicacoes]);

  const isBusy = Boolean(isCreating || isClearing || deletingMedicacaoId);

  const loadMedicacaoHabitual = useCallback(
    async ({ showRefreshing = false } = {}) => {
      if (!selectedUtenteId) {
        setMedicacoes([]);
        setIsLoading(false);
        setIsRefreshing(false);
        setError(null);
        return;
      }

      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      try {
        const data = await getMedicacaoHabitualByUtente(selectedUtenteId);

        setMedicacoes(sortMedicacaoHabitualByName(data));
      } catch (loadError) {
        if (handleAuthError(loadError)) return;

        setError(
          getErrorMessage(
            loadError,
            MEDICACAO_HABITUAL_CONFIG.section.errorTitle,
          ),
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [handleAuthError, selectedUtenteId],
  );

  const refreshMedicacaoHabitual = useCallback(async () => {
    await loadMedicacaoHabitual({ showRefreshing: true });
  }, [loadMedicacaoHabitual]);

  const updateMedicamentoInput = useCallback((value) => {
    setMedicamentoInput(value);
    setInputError("");
  }, []);

  const clearFeedback = useCallback(() => {
    setFeedback(null);
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
        const duplicateMessage =
          "Este medicamento já existe na medicação habitual.";

        setInputError(duplicateMessage);

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

        const message = getErrorMessage(
          createError,
          MEDICACAO_HABITUAL_CONFIG.feedback.genericError,
        );

        setFeedback({
          type: "error",
          message,
        });

        return {
          ok: false,
          data: null,
        };
      } finally {
        setIsCreating(false);
      }
    },
    [handleAuthError, medicacoes, medicamentoInput, selectedUtenteId],
  );

  const handleSubmit = useCallback(
    async (event) => {
      event?.preventDefault?.();

      return createMedicacaoHabitualItem(medicamentoInput);
    },
    [createMedicacaoHabitualItem, medicamentoInput],
  );

  const requestDeleteMedicacao = useCallback((medicacao) => {
    setDeleteTarget(medicacao);
    setFeedback(null);
  }, []);

  const cancelDeleteMedicacao = useCallback(() => {
    if (deletingMedicacaoId) return;

    setDeleteTarget(null);
  }, [deletingMedicacaoId]);

  const confirmDeleteMedicacao = useCallback(async () => {
    if (!selectedUtenteId || !deleteTarget?.id) return;

    setDeletingMedicacaoId(deleteTarget.id);
    setFeedback(null);

    try {
      await deleteMedicacaoHabitualRequest(selectedUtenteId, deleteTarget.id);

      setMedicacoes((currentItems) =>
        currentItems.filter((item) => item.id !== deleteTarget.id),
      );

      setFeedback({
        type: "success",
        message: MEDICACAO_HABITUAL_CONFIG.list.deleteSuccessMessage,
      });

      setDeleteTarget(null);
    } catch (deleteError) {
      if (handleAuthError(deleteError)) return;

      setFeedback({
        type: "error",
        message: getErrorMessage(
          deleteError,
          MEDICACAO_HABITUAL_CONFIG.feedback.genericError,
        ),
      });
    } finally {
      setDeletingMedicacaoId(null);
    }
  }, [deleteTarget, handleAuthError, selectedUtenteId]);

  const requestClearMedicacao = useCallback(() => {
    if (!hasMedicacoes) return;

    setIsClearDialogOpen(true);
    setFeedback(null);
  }, [hasMedicacoes]);

  const cancelClearMedicacao = useCallback(() => {
    if (isClearing) return;

    setIsClearDialogOpen(false);
  }, [isClearing]);

  const confirmClearMedicacao = useCallback(async () => {
    if (!selectedUtenteId) return;

    setIsClearing(true);
    setFeedback(null);

    try {
      await clearMedicacaoHabitualRequest(selectedUtenteId);

      setMedicacoes([]);
      setIsClearDialogOpen(false);

      setFeedback({
        type: "success",
        message: MEDICACAO_HABITUAL_CONFIG.list.clearSuccessMessage,
      });
    } catch (clearError) {
      if (handleAuthError(clearError)) return;

      setFeedback({
        type: "error",
        message: getErrorMessage(
          clearError,
          MEDICACAO_HABITUAL_CONFIG.feedback.genericError,
        ),
      });
    } finally {
      setIsClearing(false);
    }
  }, [handleAuthError, selectedUtenteId]);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialMedicacaoHabitual() {
      await Promise.resolve();

      if (!isMounted) return;

      setDeleteTarget(null);
      setIsClearDialogOpen(false);
      setMedicamentoInput("");
      setInputError("");
      setFeedback(null);

      if (!selectedUtenteId) {
        setMedicacoes([]);
        setIsLoading(false);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await getMedicacaoHabitualByUtente(selectedUtenteId);

        if (!isMounted) return;

        setMedicacoes(sortMedicacaoHabitualByName(data));
      } catch (loadError) {
        if (!isMounted) return;
        if (handleAuthError(loadError)) return;

        setError(
          getErrorMessage(
            loadError,
            MEDICACAO_HABITUAL_CONFIG.section.errorTitle,
          ),
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadInitialMedicacaoHabitual();

    return () => {
      isMounted = false;
    };
  }, [handleAuthError, selectedUtenteId]);

  return {
    medicacoes,
    options,
    hasMedicacoes,

    medicamentoInput,
    inputError,

    deleteTarget,
    isDeleteDialogOpen: Boolean(deleteTarget),
    isClearDialogOpen,

    isLoading,
    isRefreshing,
    isCreating,
    isClearing,
    deletingMedicacaoId,
    isBusy,

    error,
    feedback,
    setFeedback,

    loadMedicacaoHabitual,
    refreshMedicacaoHabitual,

    updateMedicamentoInput,
    handleSubmit,
    createMedicacaoHabitualItem,

    requestDeleteMedicacao,
    cancelDeleteMedicacao,
    confirmDeleteMedicacao,

    requestClearMedicacao,
    cancelClearMedicacao,
    confirmClearMedicacao,

    clearFeedback,
  };
}
