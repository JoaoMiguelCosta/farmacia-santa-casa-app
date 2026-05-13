import { API_ENDPOINTS } from "../../../../shared/api/endpoints";
import { httpClient } from "../../../../shared/api/httpClient";

export async function getUtentes() {
  const response = await httpClient.get(API_ENDPOINTS.santacasa.utentes);

  return Array.isArray(response?.data) ? response.data : [];
}

export async function createUtente(payload) {
  const response = await httpClient.post(
    API_ENDPOINTS.santacasa.utentes,
    payload,
  );

  return response?.data ?? null;
}

export async function deleteUtente(utenteId) {
  await httpClient.delete(API_ENDPOINTS.santacasa.utenteById(utenteId));

  return true;
}
