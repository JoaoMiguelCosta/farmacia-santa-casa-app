import { API_ENDPOINTS } from "../../../../shared/api/endpoints";
import { httpClient } from "../../../../shared/api/httpClient";

function buildSystemManutencaoHeaders(maintenanceKey) {
  const key = String(maintenanceKey || "").trim();

  if (!key) {
    throw new Error("Chave de manutenção em falta.");
  }

  return {
    "x-maintenance-key": key,
  };
}

export async function getSystemManutencaoJobs(maintenanceKey) {
  return httpClient.get(API_ENDPOINTS.system.manutencao.jobs, {
    headers: buildSystemManutencaoHeaders(maintenanceKey),
  });
}

export async function previewReceitaExpiry(maintenanceKey) {
  return httpClient.get(API_ENDPOINTS.system.manutencao.receitaExpiryPreview, {
    headers: buildSystemManutencaoHeaders(maintenanceKey),
  });
}

export async function runReceitaExpiry(maintenanceKey) {
  return httpClient.post(
    API_ENDPOINTS.system.manutencao.receitaExpiryRun,
    {},
    {
      headers: buildSystemManutencaoHeaders(maintenanceKey),
    },
  );
}

export async function previewHigiene(maintenanceKey, options = {}) {
  return httpClient.get(API_ENDPOINTS.system.manutencao.higienePreview, {
    query: options,
    headers: buildSystemManutencaoHeaders(maintenanceKey),
  });
}

export async function runHigiene(maintenanceKey, options = {}) {
  return httpClient.post(API_ENDPOINTS.system.manutencao.higieneRun, options, {
    headers: buildSystemManutencaoHeaders(maintenanceKey),
  });
}

export async function previewPurgeHistory(maintenanceKey, options = {}) {
  return httpClient.get(API_ENDPOINTS.system.manutencao.purgeHistoryPreview, {
    query: options,
    headers: buildSystemManutencaoHeaders(maintenanceKey),
  });
}

export async function runPurgeHistory(maintenanceKey, options = {}) {
  return httpClient.post(
    API_ENDPOINTS.system.manutencao.purgeHistoryRun,
    options,
    {
      headers: buildSystemManutencaoHeaders(maintenanceKey),
    },
  );
}
