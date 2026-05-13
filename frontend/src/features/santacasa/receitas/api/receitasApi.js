import { API_ENDPOINTS } from "../../../../shared/api/endpoints";
import { httpClient } from "../../../../shared/api/httpClient";

export async function getReceitasByUtente(utenteId) {
  if (!utenteId) return [];

  const response = await httpClient.get(
    API_ENDPOINTS.santacasa.receitas(utenteId),
  );

  return Array.isArray(response?.data) ? response.data : [];
}

export async function createReceita(utenteId, payload) {
  const response = await httpClient.post(
    API_ENDPOINTS.santacasa.receitas(utenteId),
    payload,
  );

  return response?.data ?? null;
}

export async function deleteReceitaLinha(utenteId, linhaId) {
  await httpClient.delete(
    API_ENDPOINTS.santacasa.receitaLinhaById(utenteId, linhaId),
  );

  return true;
}
