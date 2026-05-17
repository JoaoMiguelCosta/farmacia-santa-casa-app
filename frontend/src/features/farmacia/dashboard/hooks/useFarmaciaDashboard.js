import { useCallback, useEffect, useState } from "react";

import { getFarmaciaDashboard } from "../api/farmaciaDashboardApi";

function getErrorMessage(error, fallback) {
  return error?.message || fallback;
}

export function useFarmaciaDashboard() {
  const [dashboard, setDashboard] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [error, setError] = useState(null);

  const loadDashboard = useCallback(async ({ showRefreshing = false } = {}) => {
    if (showRefreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError(null);

    try {
      const data = await getFarmaciaDashboard();

      setDashboard(data);
    } catch (loadError) {
      setError(
        getErrorMessage(
          loadError,
          "Não foi possível carregar o dashboard da Farmácia.",
        ),
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const refreshDashboard = useCallback(async () => {
    await loadDashboard({ showRefreshing: true });
  }, [loadDashboard]);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialDashboard() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getFarmaciaDashboard();

        if (!isMounted) return;

        setDashboard(data);
      } catch (loadError) {
        if (!isMounted) return;

        setError(
          getErrorMessage(
            loadError,
            "Não foi possível carregar o dashboard da Farmácia.",
          ),
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadInitialDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    dashboard,

    isLoading,
    isRefreshing,
    error,

    loadDashboard,
    refreshDashboard,
  };
}
