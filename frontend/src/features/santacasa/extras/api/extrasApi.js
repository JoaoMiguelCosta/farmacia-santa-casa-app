import { API_ENDPOINTS } from "../../../../shared/api/endpoints";
import { httpClient } from "../../../../shared/api/httpClient";

export async function getExtrasByUtente(utenteId) {
  if (!utenteId) return [];

  const response = await httpClient.get(
    API_ENDPOINTS.santacasa.extras(utenteId),
  );

  return Array.isArray(response?.data) ? response.data : [];
}

export async function createExtra(utenteId, payload) {
  const response = await httpClient.post(
    API_ENDPOINTS.santacasa.extras(utenteId),
    payload,
  );

  return response?.data ?? null;
}

export async function deleteExtra(utenteId, extraId) {
  await httpClient.delete(API_ENDPOINTS.santacasa.extraById(utenteId, extraId));

  return true;
}
