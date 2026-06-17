import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  dismissAllFarmaciaAlertas,
  dismissFarmaciaAlerta,
  getFarmaciaAlertas,
} from "../api/farmaciaAlertasApi";

import { FARMACIA_ALERTAS_CONFIG } from "../config/farmaciaAlertas.config";
import {
  getSafeErrorMessage,
  sortAlertasByDate,
} from "../utils/farmaciaAlertas.utils";

export function useFarmaciaAlertas({
  enabled = true,
  pollingIntervalMs = FARMACIA_ALERTAS_CONFIG.pollingIntervalMs,
} = {}) {
  const isMountedRef = useRef(false);

  const [alertas, setAlertas] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dismissingId, setDismissingId] = useState("");
  const [isDismissingAll, setIsDismissingAll] = useState(false);

  const hasAlertas = alertas.length > 0;
  const alertasCount = alertas.length;

  const visibleAlertas = useMemo(() => {
    return alertas.slice(0, FARMACIA_ALERTAS_CONFIG.maxVisibleAlertas);
  }, [alertas]);

  const hiddenAlertasCount = Math.max(0, alertasCount - visibleAlertas.length);

  const loadAlertas = useCallback(
    async ({ silent = false } = {}) => {
      if (!enabled) return;

      if (silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError("");

      try {
        const data = await getFarmaciaAlertas();

        if (isMountedRef.current) {
          setAlertas(sortAlertasByDate(data));
        }
      } catch (loadError) {
        if (isMountedRef.current) {
          setError(
            getSafeErrorMessage(loadError, FARMACIA_ALERTAS_CONFIG.errors.load),
          );
        }
      } finally {
        if (isMountedRef.current) {
          if (silent) {
            setIsRefreshing(false);
          } else {
            setIsLoading(false);
          }
        }
      }
    },
    [enabled],
  );

  const refreshAlertas = useCallback(() => {
    return loadAlertas({ silent: true });
  }, [loadAlertas]);

  const dismissAlerta = useCallback(async (alertaId) => {
    if (!alertaId) return;

    setDismissingId(alertaId);
    setError("");

    try {
      await dismissFarmaciaAlerta(alertaId);

      if (isMountedRef.current) {
        setAlertas((currentAlertas) =>
          currentAlertas.filter((alerta) => alerta.id !== alertaId),
        );
      }
    } catch (dismissError) {
      if (isMountedRef.current) {
        setError(
          getSafeErrorMessage(
            dismissError,
            FARMACIA_ALERTAS_CONFIG.errors.dismiss,
          ),
        );
      }
    } finally {
      if (isMountedRef.current) {
        setDismissingId("");
      }
    }
  }, []);

  const dismissAllAlertas = useCallback(async () => {
    if (!hasAlertas) return;

    setIsDismissingAll(true);
    setError("");

    try {
      await dismissAllFarmaciaAlertas();

      if (isMountedRef.current) {
        setAlertas([]);
      }
    } catch (dismissError) {
      if (isMountedRef.current) {
        setError(
          getSafeErrorMessage(
            dismissError,
            FARMACIA_ALERTAS_CONFIG.errors.dismissAll,
          ),
        );
      }
    } finally {
      if (isMountedRef.current) {
        setIsDismissingAll(false);
      }
    }
  }, [hasAlertas]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;

    const initialLoadId = window.setTimeout(() => {
      void loadAlertas({ silent: false });
    }, 0);

    const intervalId = window.setInterval(() => {
      void loadAlertas({ silent: true });
    }, pollingIntervalMs);

    return () => {
      window.clearTimeout(initialLoadId);
      window.clearInterval(intervalId);
    };
  }, [enabled, loadAlertas, pollingIntervalMs]);

  return {
    alertas,
    visibleAlertas,
    alertasCount,
    hiddenAlertasCount,

    hasAlertas,
    error,

    isLoading,
    isRefreshing,
    dismissingId,
    isDismissingAll,

    loadAlertas,
    refreshAlertas,
    dismissAlerta,
    dismissAllAlertas,
  };
}
