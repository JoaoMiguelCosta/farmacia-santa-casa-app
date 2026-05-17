import { useCallback, useEffect, useMemo, useState } from "react";

import { getSystemHealth } from "../api/systemHealthApi";
import { SYSTEM_HEALTH_CONFIG } from "../config/systemHealth.config";

function mergeServicesWithResults(results = []) {
  const resultMap = new Map(results.map((result) => [result.key, result]));

  return SYSTEM_HEALTH_CONFIG.services.map((service) => {
    const result = resultMap.get(service.key);

    return {
      ...service,
      status: result?.status || "offline",
      data: result?.data ?? null,
      error: result?.error ?? null,
      checkedAt: result?.checkedAt ?? null,
    };
  });
}

export function useSystemHealth() {
  const [services, setServices] = useState(() => mergeServicesWithResults([]));

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const serviceKeys = useMemo(() => {
    return SYSTEM_HEALTH_CONFIG.services.map((service) => service.key);
  }, []);

  const loadHealth = useCallback(
    async ({ showRefreshing = false } = {}) => {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const results = await getSystemHealth(serviceKeys);

        setServices(mergeServicesWithResults(results));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [serviceKeys],
  );

  const refreshHealth = useCallback(async () => {
    await loadHealth({ showRefreshing: true });
  }, [loadHealth]);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialHealth() {
      setIsLoading(true);

      try {
        const results = await getSystemHealth(serviceKeys);

        if (!isMounted) return;

        setServices(mergeServicesWithResults(results));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadInitialHealth();

    return () => {
      isMounted = false;
    };
  }, [serviceKeys]);

  return {
    services,
    hasServices: services.length > 0,

    isLoading,
    isRefreshing,

    loadHealth,
    refreshHealth,
  };
}
