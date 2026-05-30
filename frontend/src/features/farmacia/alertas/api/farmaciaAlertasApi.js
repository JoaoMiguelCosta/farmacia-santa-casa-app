import { API_ENDPOINTS } from "../../../../shared/api/endpoints";
import { httpClient } from "../../../../shared/api/httpClient";

function unwrapData(response) {
  return response?.data ?? response;
}

function normalizeAlertas(response) {
  const data = unwrapData(response);

  return Array.isArray(data) ? data : [];
}

export async function getFarmaciaAlertas() {
  const response = await httpClient.get(API_ENDPOINTS.farmacia.alertas);

  return normalizeAlertas(response);
}

export async function dismissFarmaciaAlerta(alertaId) {
  if (!alertaId) {
    throw new Error("ID do alerta em falta.");
  }

  const response = await httpClient.post(
    API_ENDPOINTS.farmacia.alertaDismiss(alertaId),
    {},
  );

  return unwrapData(response);
}

export async function dismissAllFarmaciaAlertas() {
  const response = await httpClient.post(
    API_ENDPOINTS.farmacia.alertasDismissAll,
    {},
  );

  return unwrapData(response);
}
