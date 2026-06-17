import { API_ENDPOINTS } from "../../../../shared/api/endpoints";
import { httpClient } from "../../../../shared/api/httpClient";

import { UTENTE_STATUS } from "../config/utentesStatus.config";

const DEFAULT_LIST_PARAMS = Object.freeze({
  status: UTENTE_STATUS.ATIVO,
  search: "",
  skip: 0,
  take: 50,
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

function normalizePaginatedUtentes(data) {
  if (Array.isArray(data)) {
    return {
      rows: data,
      total: data.length,
      params: {
        ...DEFAULT_LIST_PARAMS,
        take: data.length || DEFAULT_LIST_PARAMS.take,
      },
    };
  }

  return {
    rows: Array.isArray(data?.rows) ? data.rows : [],
    total: Number(data?.total) || 0,
    params: {
      ...DEFAULT_LIST_PARAMS,
      ...(data?.params || {}),
    },
  };
}

export async function getUtentes(params = {}) {
  const response = await httpClient.get(API_ENDPOINTS.santacasa.utentes, {
    query: normalizeListParams(params),
  });

  const data = unwrapData(response);

  if (Array.isArray(data)) return data;

  return Array.isArray(data?.rows) ? data.rows : [];
}

export async function getUtentesPaginated(params = {}) {
  const response = await httpClient.get(API_ENDPOINTS.santacasa.utentes, {
    query: normalizeListParams(params),
  });

  return normalizePaginatedUtentes(unwrapData(response));
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
