import { API_ENDPOINTS } from "../../../shared/api/endpoints";
import { httpClient } from "../../../shared/api/httpClient";

const SYSTEM_ENDPOINTS = Object.freeze({
  health: API_ENDPOINTS.health,
  santacasaHealth: API_ENDPOINTS.santacasa.health,
  farmaciaHealth: API_ENDPOINTS.farmacia.health,
});

export async function getSystemHealth(endpointKey) {
  const endpoint = SYSTEM_ENDPOINTS[endpointKey];

  if (!endpoint) {
    throw new Error(`Endpoint de health inválido: ${endpointKey}`);
  }

  return httpClient.get(endpoint);
}
