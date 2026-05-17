import { API_ENDPOINTS } from "../../../../shared/api/endpoints";
import { httpClient } from "../../../../shared/api/httpClient";

const HEALTH_ENDPOINTS = Object.freeze({
  api: API_ENDPOINTS.health,
  santacasa: API_ENDPOINTS.santacasa.health,
  farmacia: API_ENDPOINTS.farmacia.health,
});

function getHealthEndpoint(serviceKey) {
  return HEALTH_ENDPOINTS[serviceKey] || null;
}

function normalizeHealthSuccess(serviceKey, data) {
  return {
    key: serviceKey,
    status: "online",
    data,
    error: null,
    checkedAt: new Date().toISOString(),
  };
}

function normalizeHealthError(serviceKey, error) {
  return {
    key: serviceKey,
    status: "offline",
    data: null,
    error: error?.message || "Não foi possível contactar o serviço.",
    checkedAt: new Date().toISOString(),
  };
}

export async function getSystemHealthService(serviceKey) {
  const endpoint = getHealthEndpoint(serviceKey);

  if (!endpoint) {
    return normalizeHealthError(serviceKey, {
      message: "Endpoint de saúde não configurado.",
    });
  }

  try {
    const data = await httpClient.get(endpoint);

    return normalizeHealthSuccess(serviceKey, data);
  } catch (error) {
    return normalizeHealthError(serviceKey, error);
  }
}

export async function getSystemHealth(serviceKeys = []) {
  const results = await Promise.all(
    serviceKeys.map((serviceKey) => getSystemHealthService(serviceKey)),
  );

  return results;
}
