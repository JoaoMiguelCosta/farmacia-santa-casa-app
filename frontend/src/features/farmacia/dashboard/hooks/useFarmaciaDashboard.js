import { useCallback, useEffect, useState } from "react";

import { useAuth } from "../../../auth/hooks/useAuth";

import { getFarmaciaDashboard } from "../api/farmaciaDashboardApi";
import { FARMACIA_DASHBOARD_PAGE } from "../config/farmaciaDashboardPage.config";

function getErrorMessage(error, fallback) {
  return error?.message || fallback;
}

function canAlwaysUpdateState() {
  return true;
}

export function useFarmaciaDashboard() {
  const { handleAuthError } = useAuth();

  const [dashboard, setDashboard] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [error, setError] = useState(null);

  const loadDashboard = useCallback(
    async ({
      showRefreshing = false,
      canUpdateState = canAlwaysUpdateState,
    } = {}) => {
      if (!canUpdateState()) {
        return null;
      }

      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      try {
        const data = await getFarmaciaDashboard();

        if (!canUpdateState()) {
          return null;
        }

        setDashboard(data);

        return data;
      } catch (loadError) {
        if (!canUpdateState()) {
          return null;
        }

        if (handleAuthError(loadError)) {
          return null;
        }

        setError(
          getErrorMessage(
            loadError,
            FARMACIA_DASHBOARD_PAGE.sections.signals.errorTitle,
          ),
        );

        return null;
      } finally {
        if (canUpdateState()) {
          if (showRefreshing) {
            setIsRefreshing(false);
          } else {
            setIsLoading(false);
          }
        }
      }
    },
    [handleAuthError],
  );

  const refreshDashboard = useCallback(async () => {
    return loadDashboard({
      showRefreshing: true,
    });
  }, [loadDashboard]);

  useEffect(() => {
    let isMounted = true;

    const initialLoadTimerId = window.setTimeout(() => {
      void loadDashboard({
        canUpdateState: () => isMounted,
      });
    }, 0);

    return () => {
      isMounted = false;
      window.clearTimeout(initialLoadTimerId);
    };
  }, [loadDashboard]);

  return {
    dashboard,

    isLoading,
    isRefreshing,
    error,

    loadDashboard,
    refreshDashboard,
  };
}
