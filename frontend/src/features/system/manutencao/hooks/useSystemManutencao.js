import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "../../../auth/hooks/useAuth";

import {
  getSystemManutencaoJobs,
  previewHigiene,
  previewPurgeHistory,
  previewReceitaExpiry,
  runHigiene,
  runPurgeHistory,
  runReceitaExpiry,
} from "../api/systemManutencaoApi";

import { SYSTEM_MANUTENCAO_PAGE } from "../config/systemManutencaoPage.config";

import {
  buildMaintenanceOptions,
  buildMaintenanceRunPayload,
  canRunMaintenanceJob,
  getMaintenanceErrorMessage,
  normalizeMaintenanceJobs,
} from "../utils/systemManutencao.utils";

const DEFAULT_OPTIONS = Object.freeze({
  "receita-expiry": {},
  higiene: {
    offsetMonths: "",
    anonymize: false,
  },
  "purge-history": {
    offsetMonths: "",
  },
});

function getPreviewAction(jobKey) {
  const actions = {
    "receita-expiry": previewReceitaExpiry,
    higiene: previewHigiene,
    "purge-history": previewPurgeHistory,
  };

  return actions[jobKey] || null;
}

function getRunAction(jobKey) {
  const actions = {
    "receita-expiry": runReceitaExpiry,
    higiene: runHigiene,
    "purge-history": runPurgeHistory,
  };

  return actions[jobKey] || null;
}

export function useSystemManutencao() {
  const { handleAuthError } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [jobOptions, setJobOptions] = useState(DEFAULT_OPTIONS);

  const [latestResult, setLatestResult] = useState(null);

  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [isRefreshingJobs, setIsRefreshingJobs] = useState(false);

  const [previewingJobKey, setPreviewingJobKey] = useState(null);
  const [runningJobKey, setRunningJobKey] = useState(null);

  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const hasJobs = jobs.length > 0;
  const isBusy = Boolean(previewingJobKey || runningJobKey);

  const canRunByJob = useMemo(() => {
    return jobs.reduce((accumulator, job) => {
      accumulator[job.key] = canRunMaintenanceJob({
        jobKey: job.key,
        latestResult,
        runningJobKey,
      });

      return accumulator;
    }, {});
  }, [jobs, latestResult, runningJobKey]);

  const clearFeedback = useCallback(() => {
    setFeedback(null);
  }, []);

  const loadJobs = useCallback(
    async ({ showRefreshing = false } = {}) => {
      if (showRefreshing) {
        setIsRefreshingJobs(true);
      } else {
        setIsLoadingJobs(true);
      }

      setError(null);

      try {
        const response = await getSystemManutencaoJobs();

        setJobs(normalizeMaintenanceJobs(response));
      } catch (loadError) {
        if (handleAuthError(loadError)) return;

        setError(getMaintenanceErrorMessage(loadError));
      } finally {
        setIsLoadingJobs(false);
        setIsRefreshingJobs(false);
      }
    },
    [handleAuthError],
  );

  const refreshJobs = useCallback(async () => {
    await loadJobs({ showRefreshing: true });
  }, [loadJobs]);

  const updateJobOption = useCallback((jobKey, optionName, value) => {
    setJobOptions((currentOptions) => ({
      ...currentOptions,
      [jobKey]: {
        ...(currentOptions[jobKey] || {}),
        [optionName]: value,
      },
    }));

    setLatestResult((currentResult) => {
      if (currentResult?.job !== jobKey) return currentResult;

      return null;
    });
  }, []);

  const previewJob = useCallback(
    async (jobKey) => {
      const action = getPreviewAction(jobKey);

      if (!action) {
        setFeedback({
          type: "error",
          message: "Job de manutenção inválido.",
        });

        return;
      }

      const options = buildMaintenanceOptions(jobKey, jobOptions[jobKey]);

      setPreviewingJobKey(jobKey);
      setError(null);
      setFeedback(null);

      try {
        const result = await action(options);

        setLatestResult(result);
        setFeedback({
          type: "success",
          message: SYSTEM_MANUTENCAO_PAGE.feedback.previewSuccess,
        });
      } catch (previewError) {
        if (handleAuthError(previewError)) return;

        setFeedback({
          type: "error",
          message: getMaintenanceErrorMessage(previewError),
        });
      } finally {
        setPreviewingJobKey(null);
      }
    },
    [handleAuthError, jobOptions],
  );

  const runJob = useCallback(
    async (jobKey) => {
      if (
        !canRunMaintenanceJob({
          jobKey,
          latestResult,
          runningJobKey,
        })
      ) {
        setFeedback({
          type: "error",
          message: SYSTEM_MANUTENCAO_PAGE.feedback.previewFirst,
        });

        return;
      }

      const action = getRunAction(jobKey);

      if (!action) {
        setFeedback({
          type: "error",
          message: "Job de manutenção inválido.",
        });

        return;
      }

      const payload = buildMaintenanceRunPayload(jobKey, jobOptions[jobKey]);

      setRunningJobKey(jobKey);
      setError(null);
      setFeedback(null);

      try {
        const result = await action(payload);

        setLatestResult(result);
        setFeedback({
          type: "success",
          message: SYSTEM_MANUTENCAO_PAGE.feedback.runSuccess,
        });

        await loadJobs({ showRefreshing: true });
      } catch (runError) {
        if (handleAuthError(runError)) return;

        setFeedback({
          type: "error",
          message: getMaintenanceErrorMessage(runError),
        });
      } finally {
        setRunningJobKey(null);
      }
    },
    [handleAuthError, jobOptions, latestResult, loadJobs, runningJobKey],
  );

  useEffect(() => {
    let isMounted = true;

    async function loadInitialJobs() {
      setIsLoadingJobs(true);
      setError(null);

      try {
        const response = await getSystemManutencaoJobs();

        if (!isMounted) return;

        setJobs(normalizeMaintenanceJobs(response));
      } catch (loadError) {
        if (!isMounted) return;
        if (handleAuthError(loadError)) return;

        setError(getMaintenanceErrorMessage(loadError));
      } finally {
        if (isMounted) {
          setIsLoadingJobs(false);
        }
      }
    }

    loadInitialJobs();

    return () => {
      isMounted = false;
    };
  }, [handleAuthError]);

  return {
    jobs,
    hasJobs,
    jobOptions,
    latestResult,

    isLoadingJobs,
    isRefreshingJobs,
    isBusy,

    previewingJobKey,
    runningJobKey,

    canRunByJob,

    error,
    feedback,

    loadJobs,
    refreshJobs,

    updateJobOption,
    previewJob,
    runJob,

    clearFeedback,
  };
}
