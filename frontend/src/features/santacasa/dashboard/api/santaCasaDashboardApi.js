import { API_ENDPOINTS } from "../../../../shared/api/endpoints";
import { httpClient } from "../../../../shared/api/httpClient";

export async function getSantaCasaDashboard() {
  return httpClient.get(API_ENDPOINTS.santacasa.dashboard);
}
