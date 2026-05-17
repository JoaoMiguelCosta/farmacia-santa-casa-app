import { API_ENDPOINTS } from "../../../shared/api/endpoints";
import { httpClient } from "../../../shared/api/httpClient";

export async function loginUser(payload) {
  return httpClient.post(API_ENDPOINTS.auth.login, payload);
}

export async function logoutUser() {
  return httpClient.post(API_ENDPOINTS.auth.logout, {});
}

export async function getCurrentUser() {
  return httpClient.get(API_ENDPOINTS.auth.me);
}
