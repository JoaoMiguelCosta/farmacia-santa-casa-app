import { API_ENDPOINTS } from "../../../../shared/api/endpoints";
import { httpClient } from "../../../../shared/api/httpClient";

export async function getFarmaciaDashboard() {
  return httpClient.get(API_ENDPOINTS.farmacia.dashboard);
}
