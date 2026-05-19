import { API_ENDPOINTS } from "../../../../shared/api/endpoints";
import { httpClient } from "../../../../shared/api/httpClient";

const DEFAULT_LIST_PARAMS = Object.freeze({
  status: "ATIVO",
});

function normalizeListParams(params = {}) {
  return {
    ...DEFAULT_LIST_PARAMS,
    ...params,
  };
}

function unwrapData(response) {
  return response?.data ?? response;
}

export async function getUtentes(params = {}) {
  const response = await httpClient.get(API_ENDPOINTS.santacasa.utentes, {
    query: normalizeListParams(params),
  });

  return unwrapData(response);
}

export async function getUtenteById(utenteId) {
  const response = await httpClient.get(
    API_ENDPOINTS.santacasa.utenteById(utenteId),
  );

  return unwrapData(response);
}

export async function createUtente(payload) {
  const response = await httpClient.post(
    API_ENDPOINTS.santacasa.utentes,
    payload,
  );

  return unwrapData(response);
}

export async function archiveUtente(utenteId, payload = {}) {
  const response = await httpClient.patch(
    API_ENDPOINTS.santacasa.archiveUtente(utenteId),
    payload,
  );

  return unwrapData(response);
}

export async function reactivateUtente(utenteId) {
  const response = await httpClient.patch(
    API_ENDPOINTS.santacasa.reactivateUtente(utenteId),
  );

  return unwrapData(response);
}

export async function deleteUtente(utenteId) {
  return httpClient.delete(API_ENDPOINTS.santacasa.utenteById(utenteId));
}
