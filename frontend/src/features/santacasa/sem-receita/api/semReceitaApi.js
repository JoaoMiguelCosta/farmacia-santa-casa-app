import { API_ENDPOINTS } from "../../../../shared/api/endpoints";
import { httpClient } from "../../../../shared/api/httpClient";

export async function getSemReceitaByUtente(utenteId) {
  if (!utenteId) return [];

  const response = await httpClient.get(
    API_ENDPOINTS.santacasa.semReceita(utenteId),
  );

  return Array.isArray(response?.data) ? response.data : [];
}

export async function createSemReceita(utenteId, payload) {
  const response = await httpClient.post(
    API_ENDPOINTS.santacasa.semReceita(utenteId),
    payload,
  );

  return response?.data ?? null;
}

export async function deleteSemReceita(utenteId, semReceitaId) {
  await httpClient.delete(
    API_ENDPOINTS.santacasa.semReceitaById(utenteId, semReceitaId),
  );

  return true;
}
