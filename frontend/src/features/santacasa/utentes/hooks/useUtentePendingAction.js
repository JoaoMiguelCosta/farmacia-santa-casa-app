// src/features/santacasa/utentes/hooks/useUtentePendingAction.js
import { useCallback, useMemo, useState } from "react";

import { UTENTE_ARCHIVE_DEFAULT_REASON } from "../config/utentesStatus.config";

import {
  UTENTE_PAGE_ACTIONS,
  getUtenteActionDialogConfig,
} from "../utils/utentesPage.utils";

export function useUtentePendingAction({
  isActionRunning = false,
  onArchiveUtente,
  onReactivateUtente,
} = {}) {
  const [pendingAction, setPendingAction] = useState(null);

  const actionDialog = useMemo(() => {
    return getUtenteActionDialogConfig(pendingAction);
  }, [pendingAction]);

  const handleRequestArchiveUtente = useCallback((utente) => {
    setPendingAction({
      type: UTENTE_PAGE_ACTIONS.ARCHIVE,
      utente,
    });
  }, []);

  const handleRequestReactivateUtente = useCallback((utente) => {
    setPendingAction({
      type: UTENTE_PAGE_ACTIONS.REACTIVATE,
      utente,
    });
  }, []);

  const handleCancelPendingAction = useCallback(() => {
    if (isActionRunning) return;

    setPendingAction(null);
  }, [isActionRunning]);

  const handleConfirmPendingAction = useCallback(async () => {
    if (!pendingAction?.utente) return null;

    if (pendingAction.type === UTENTE_PAGE_ACTIONS.REACTIVATE) {
      const updatedUtente = await onReactivateUtente?.(pendingAction.utente);

      if (updatedUtente) {
        setPendingAction(null);
      }

      return updatedUtente;
    }

    const updatedUtente = await onArchiveUtente?.(pendingAction.utente, {
      archivedReason: UTENTE_ARCHIVE_DEFAULT_REASON,
    });

    if (updatedUtente) {
      setPendingAction(null);
    }

    return updatedUtente;
  }, [onArchiveUtente, onReactivateUtente, pendingAction]);

  return {
    pendingAction,
    actionDialog,

    handleRequestArchiveUtente,
    handleRequestReactivateUtente,
    handleCancelPendingAction,
    handleConfirmPendingAction,
  };
}
