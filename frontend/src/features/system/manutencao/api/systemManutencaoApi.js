import { API_ENDPOINTS } from "../../../../shared/api/endpoints";
import { httpClient } from "../../../../shared/api/httpClient";

export async function getSystemManutencaoJobs() {
  return httpClient.get(API_ENDPOINTS.manutencao.jobs);
}

export async function previewReceitaExpiry() {
  return httpClient.get(API_ENDPOINTS.manutencao.receitaExpiryPreview);
}

export async function runReceitaExpiry(payload = {}) {
  return httpClient.post(API_ENDPOINTS.manutencao.receitaExpiryRun, payload);
}

export async function previewHigiene(options = {}) {
  return httpClient.get(API_ENDPOINTS.manutencao.higienePreview, {
    query: options,
  });
}

export async function runHigiene(payload = {}) {
  return httpClient.post(API_ENDPOINTS.manutencao.higieneRun, payload);
}

export async function previewPurgeHistory(options = {}) {
  return httpClient.get(API_ENDPOINTS.manutencao.purgeHistoryPreview, {
    query: options,
  });
}

export async function runPurgeHistory(payload = {}) {
  return httpClient.post(API_ENDPOINTS.manutencao.purgeHistoryRun, payload);
}
