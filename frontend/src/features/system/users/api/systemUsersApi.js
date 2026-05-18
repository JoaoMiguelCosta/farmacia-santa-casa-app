import { API_ENDPOINTS } from "../../../../shared/api/endpoints";
import { httpClient } from "../../../../shared/api/httpClient";

export async function getSystemUsers(query = {}) {
  return httpClient.get(API_ENDPOINTS.admin.users, {
    query,
  });
}

export async function createSystemUser(payload) {
  return httpClient.post(API_ENDPOINTS.admin.users, payload);
}

export async function updateSystemUser(userId, payload) {
  return httpClient.patch(API_ENDPOINTS.admin.userById(userId), payload);
}

export async function updateSystemUserPassword(userId, payload) {
  return httpClient.patch(API_ENDPOINTS.admin.userPassword(userId), payload);
}

export async function updateSystemUserStatus(userId, payload) {
  return httpClient.patch(API_ENDPOINTS.admin.userStatus(userId), payload);
}

export async function deleteSystemUser(userId) {
  return httpClient.delete(API_ENDPOINTS.admin.userById(userId));
}
