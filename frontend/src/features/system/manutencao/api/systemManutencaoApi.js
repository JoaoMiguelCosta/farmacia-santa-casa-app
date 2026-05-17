import { API_ENDPOINTS } from "../../../../shared/api/endpoints";
import { httpClient } from "../../../../shared/api/httpClient";

export async function getSystemManutencaoJobs() {
  return httpClient.get(API_ENDPOINTS.manutencao.jobs);
}

export async function previewReceitaExpiry() {
  return httpClient.get(API_ENDPOINTS.manutencao.receitaExpiryPreview);
}

export async function runReceitaExpiry() {
  return httpClient.post(API_ENDPOINTS.manutencao.receitaExpiryRun, {});
}

export async function previewHigiene(options = {}) {
  return httpClient.get(API_ENDPOINTS.manutencao.higienePreview, {
    query: options,
  });
}

export async function runHigiene(options = {}) {
  return httpClient.post(API_ENDPOINTS.manutencao.higieneRun, options);
}

export async function previewPurgeHistory(options = {}) {
  return httpClient.get(API_ENDPOINTS.manutencao.purgeHistoryPreview, {
    query: options,
  });
}

export async function runPurgeHistory(options = {}) {
  return httpClient.post(API_ENDPOINTS.manutencao.purgeHistoryRun, options);
}
