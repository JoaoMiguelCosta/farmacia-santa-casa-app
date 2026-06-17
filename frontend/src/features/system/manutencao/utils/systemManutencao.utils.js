import { formatDateTime } from "../../../../shared/utils/formatDate";
import { SYSTEM_MANUTENCAO_PAGE } from "../config/systemManutencaoPage.config";

const UNKNOWN_LABEL = "—";

export const MAINTENANCE_RUN_CONFIRMATIONS = Object.freeze({
  "receita-expiry": "RUN_RECEITA_EXPIRY",
  higiene: "RUN_HIGIENE",
  "purge-history": "RUN_PURGE_HISTORY",
});

function toText(value) {
  return String(value || "").trim();
}

function toSafeNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return null;

  return number;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getConfiguredJobs() {
  return Object.values(SYSTEM_MANUTENCAO_PAGE.jobs);
}

export function getJobConfig(jobKey) {
  const key = toText(jobKey);

  return getConfiguredJobs().find((job) => job.key === key) || null;
}

export function getJobLabel(jobKey) {
  return (
    SYSTEM_MANUTENCAO_PAGE.jobLabels[jobKey] ||
    getJobConfig(jobKey)?.title ||
    jobKey ||
    UNKNOWN_LABEL
  );
}

export function getJobRiskLabel(jobKey) {
  return getJobConfig(jobKey)?.risk || UNKNOWN_LABEL;
}

export function getJobWarning(jobKey) {
  return getJobConfig(jobKey)?.warning || "";
}

export function hasJobOptions(jobKey) {
  return ["higiene", "purge-history"].includes(jobKey);
}

export function supportsAnonymizeOption(jobKey) {
  return jobKey === "higiene";
}

export function requiresBackupConfirmation(jobKey) {
  return jobKey === "purge-history";
}

export function getRunConfirmationValue(jobKey) {
  return MAINTENANCE_RUN_CONFIRMATIONS[jobKey] || "";
}

export function sortMaintenanceJobs(jobs = []) {
  const order = SYSTEM_MANUTENCAO_PAGE.jobOrder;

  return [...jobs].sort((a, b) => {
    const indexA = order.indexOf(a?.key);
    const indexB = order.indexOf(b?.key);

    const safeIndexA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA;
    const safeIndexB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB;

    return safeIndexA - safeIndexB;
  });
}

export function normalizeMaintenanceJobs(response) {
  const rows = Array.isArray(response?.data)
    ? response.data
    : Array.isArray(response)
      ? response
      : [];

  const jobs = rows.map((job) => {
    const config = getJobConfig(job?.key);

    return {
      key: job?.key,
      title: config?.title || getJobLabel(job?.key),
      description: config?.description || job?.description || "",
      schedule: job?.schedule || "",
      scheduleLabel: config?.scheduleLabel || job?.schedule || UNKNOWN_LABEL,
      risk: config?.risk || UNKNOWN_LABEL,
      warning: config?.warning || "",
      actions: Array.isArray(job?.actions) ? job.actions : [],
    };
  });

  return sortMaintenanceJobs(jobs);
}

export function buildMaintenanceOptions(jobKey, values = {}) {
  if (jobKey === "receita-expiry") {
    return {};
  }

  const offsetMonths = toSafeNumber(values.offsetMonths);

  if (jobKey === "higiene") {
    return {
      ...(offsetMonths !== null ? { offsetMonths } : {}),
      anonymize: Boolean(values.anonymize),
    };
  }

  if (jobKey === "purge-history") {
    return {
      ...(offsetMonths !== null ? { offsetMonths } : {}),
    };
  }

  return {};
}

export function buildMaintenanceRunPayload(jobKey, values = {}) {
  const options = buildMaintenanceOptions(jobKey, values);
  const confirm = getRunConfirmationValue(jobKey);

  return {
    confirm,
    ...options,
    ...(requiresBackupConfirmation(jobKey) ? { backupConfirmed: true } : {}),
  };
}

export function canRunMaintenanceJob({
  jobKey,
  latestResult,
  runningJobKey,
} = {}) {
  if (!jobKey) return false;
  if (runningJobKey) return false;

  return latestResult?.job === jobKey && latestResult?.mode === "preview";
}

export function getRunConfirmationDescription(jobKey, jobLabel) {
  const baseDescription = SYSTEM_MANUTENCAO_PAGE.confirmDialog.description;
  const jobDescription =
    SYSTEM_MANUTENCAO_PAGE.confirmDialog.byJob?.[jobKey] || "";
  const selectedJob = jobLabel
    ? `${SYSTEM_MANUTENCAO_PAGE.confirmDialog.selectedJobPrefix}: ${jobLabel}.`
    : "";

  return [baseDescription, jobDescription, selectedJob]
    .filter(Boolean)
    .join(" ");
}

export function getResultModeLabel(mode) {
  if (mode === "preview") {
    return SYSTEM_MANUTENCAO_PAGE.resultLabels.preview;
  }

  if (mode === "run") {
    return SYSTEM_MANUTENCAO_PAGE.resultLabels.run;
  }

  return mode || UNKNOWN_LABEL;
}

export function getResultFieldLabel(key) {
  return SYSTEM_MANUTENCAO_PAGE.resultLabels[key] || key || UNKNOWN_LABEL;
}

export function formatMaintenanceValue(key, value) {
  if (value === null || value === undefined || value === "") {
    return UNKNOWN_LABEL;
  }

  if (typeof value === "boolean") {
    return value ? "Sim" : "Não";
  }

  if (["checkedAt", "cutoffDate", "createdAt", "updatedAt"].includes(key)) {
    return formatDateTime(value);
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : UNKNOWN_LABEL;
  }

  if (isPlainObject(value)) {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

function buildRowsFromObject(source = {}) {
  if (!isPlainObject(source)) return [];

  return Object.entries(source).map(([key, value]) => ({
    key,
    label: getResultFieldLabel(key),
    value: formatMaintenanceValue(key, value),
  }));
}

export function buildMaintenanceResultSections(payload) {
  if (!payload) return [];

  const summaryRows = [
    {
      key: "job",
      label: SYSTEM_MANUTENCAO_PAGE.resultLabels.job,
      value: getJobLabel(payload.job),
    },
    {
      key: "mode",
      label: SYSTEM_MANUTENCAO_PAGE.resultLabels.mode,
      value: getResultModeLabel(payload.mode),
    },
  ];

  const optionsRows = buildRowsFromObject(payload.options);
  const resultRows = buildRowsFromObject(payload.result);

  return [
    {
      key: "summary",
      title: "Resumo",
      rows: summaryRows,
    },
    ...(optionsRows.length > 0
      ? [
          {
            key: "options",
            title: SYSTEM_MANUTENCAO_PAGE.resultLabels.options,
            rows: optionsRows,
          },
        ]
      : []),
    {
      key: "result",
      title: SYSTEM_MANUTENCAO_PAGE.resultLabels.result,
      rows: resultRows,
    },
  ];
}

export function getMaintenanceErrorMessage(error) {
  return error?.message || SYSTEM_MANUTENCAO_PAGE.feedback.genericError;
}
