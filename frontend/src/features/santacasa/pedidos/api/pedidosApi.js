import { API_ENDPOINTS } from "../../../../shared/api/endpoints";
import { httpClient } from "../../../../shared/api/httpClient";

export async function createPedido(payload) {
  const response = await httpClient.post(
    API_ENDPOINTS.santacasa.pedidos,
    payload,
  );

  return response?.data ?? null;
}
