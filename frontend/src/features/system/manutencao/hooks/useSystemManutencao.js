import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getSystemManutencaoJobs,
  previewHigiene,
  previewPurgeHistory,
  previewReceitaExpiry,
  runHigiene,
  runPurgeHistory,
  runReceitaExpiry,
} from "../api/systemManutencaoApi";

import { FARMACIA_MANUTENCAO_PAGE as SYSTEM_MANUTENCAO_PAGE } from "../config/systemManutencaoPage.config";

import {
  buildMaintenanceOptions,
  canRunMaintenanceJob,
  clearStoredMaintenanceKey,
  getMaintenanceErrorMessage,
  getStoredMaintenanceKey,
  hasMaintenanceKey,
  normalizeMaintenanceJobs,
  saveStoredMaintenanceKey,
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

function getInitialAccessState() {
  const storedKey = getStoredMaintenanceKey();

  return {
    storedKey,
    hasStoredKey: hasMaintenanceKey(storedKey),
  };
}

export function useSystemManutencao() {
  const [initialAccessState] = useState(() => getInitialAccessState());

  const [maintenanceKey, setMaintenanceKey] = useState(
    initialAccessState.storedKey,
  );
  const [keyInput, setKeyInput] = useState(initialAccessState.storedKey);

  const [jobs, setJobs] = useState([]);
  const [jobOptions, setJobOptions] = useState(DEFAULT_OPTIONS);

  const [latestResult, setLatestResult] = useState(null);

  const [isLoadingJobs, setIsLoadingJobs] = useState(
    initialAccessState.hasStoredKey,
  );
  const [isRefreshingJobs, setIsRefreshingJobs] = useState(false);

  const [previewingJobKey, setPreviewingJobKey] = useState(null);
  const [runningJobKey, setRunningJobKey] = useState(null);

  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const hasKey = hasMaintenanceKey(maintenanceKey);
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

  const updateKeyInput = useCallback((value) => {
    setKeyInput(value);
  }, []);

  const clearFeedback = useCallback(() => {
    setFeedback(null);
  }, []);

  const loadJobs = useCallback(
    async ({ showRefreshing = false, keyOverride = null } = {}) => {
      const finalKey = String(keyOverride ?? maintenanceKey).trim();

      if (!hasMaintenanceKey(finalKey)) {
        setJobs([]);
        setIsLoadingJobs(false);
        setIsRefreshingJobs(false);
        setError(SYSTEM_MANUTENCAO_PAGE.feedback.missingKey);
        return;
      }

      if (showRefreshing) {
        setIsRefreshingJobs(true);
      } else {
        setIsLoadingJobs(true);
      }

      setError(null);

      try {
        const response = await getSystemManutencaoJobs(finalKey);

        setJobs(normalizeMaintenanceJobs(response));
      } catch (loadError) {
        setError(getMaintenanceErrorMessage(loadError));
      } finally {
        setIsLoadingJobs(false);
        setIsRefreshingJobs(false);
      }
    },
    [maintenanceKey],
  );

  const refreshJobs = useCallback(async () => {
    await loadJobs({ showRefreshing: true });
  }, [loadJobs]);

  const saveMaintenanceKey = useCallback(async () => {
    const savedKey = saveStoredMaintenanceKey(keyInput);

    if (!hasMaintenanceKey(savedKey)) {
      setFeedback({
        type: "error",
        message: SYSTEM_MANUTENCAO_PAGE.feedback.missingKey,
      });

      return;
    }

    setMaintenanceKey(savedKey);
    setKeyInput(savedKey);
    setFeedback({
      type: "success",
      message: SYSTEM_MANUTENCAO_PAGE.access.savedLabel,
    });

    await loadJobs({ keyOverride: savedKey });
  }, [keyInput, loadJobs]);

  const clearMaintenanceKey = useCallback(() => {
    clearStoredMaintenanceKey();

    setMaintenanceKey("");
    setKeyInput("");
    setJobs([]);
    setLatestResult(null);
    setError(null);
    setFeedback(null);
    setIsLoadingJobs(false);
    setIsRefreshingJobs(false);
  }, []);

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
      if (!hasMaintenanceKey(maintenanceKey)) {
        setFeedback({
          type: "error",
          message: SYSTEM_MANUTENCAO_PAGE.feedback.missingKey,
        });

        return;
      }

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
        const result = await action(maintenanceKey, options);

        setLatestResult(result);
        setFeedback({
          type: "success",
          message: SYSTEM_MANUTENCAO_PAGE.feedback.previewSuccess,
        });
      } catch (previewError) {
        setFeedback({
          type: "error",
          message: getMaintenanceErrorMessage(previewError),
        });
      } finally {
        setPreviewingJobKey(null);
      }
    },
    [jobOptions, maintenanceKey],
  );

  const runJob = useCallback(
    async (jobKey) => {
      if (!hasMaintenanceKey(maintenanceKey)) {
        setFeedback({
          type: "error",
          message: SYSTEM_MANUTENCAO_PAGE.feedback.missingKey,
        });

        return;
      }

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

      const options = buildMaintenanceOptions(jobKey, jobOptions[jobKey]);

      setRunningJobKey(jobKey);
      setError(null);
      setFeedback(null);

      try {
        const result = await action(maintenanceKey, options);

        setLatestResult(result);
        setFeedback({
          type: "success",
          message: SYSTEM_MANUTENCAO_PAGE.feedback.runSuccess,
        });

        await loadJobs({ showRefreshing: true });
      } catch (runError) {
        setFeedback({
          type: "error",
          message: getMaintenanceErrorMessage(runError),
        });
      } finally {
        setRunningJobKey(null);
      }
    },
    [jobOptions, latestResult, loadJobs, maintenanceKey, runningJobKey],
  );

  useEffect(() => {
    const storedKey = initialAccessState.storedKey;

    if (!hasMaintenanceKey(storedKey)) {
      return undefined;
    }

    let isMounted = true;

    async function loadInitialJobs() {
      try {
        const response = await getSystemManutencaoJobs(storedKey);

        if (!isMounted) return;

        setJobs(normalizeMaintenanceJobs(response));
      } catch (loadError) {
        if (!isMounted) return;

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
  }, [initialAccessState.storedKey]);

  return {
    maintenanceKey,
    keyInput,
    hasKey,

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

    updateKeyInput,
    saveMaintenanceKey,
    clearMaintenanceKey,

    loadJobs,
    refreshJobs,

    updateJobOption,
    previewJob,
    runJob,

    clearFeedback,
  };
}
