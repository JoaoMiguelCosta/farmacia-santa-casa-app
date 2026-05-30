import {
  buildApiUrl,
  buildHttpError,
  buildRequestHeaders,
  parseApiResponse,
} from "./httpClient.utils";

export async function apiRequest(path, options = {}) {
  const { method = "GET", body, query, headers = {} } = options;

  const response = await fetch(buildApiUrl(path, query), {
    method,
    credentials: "include",
    headers: buildRequestHeaders({
      body,
      headers,
    }),
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await parseApiResponse(response);

  if (!response.ok) {
    throw buildHttpError(response, data);
  }

  return data;
}

export const httpClient = Object.freeze({
  get: (path, options) => apiRequest(path, { ...options, method: "GET" }),

  post: (path, body, options) =>
    apiRequest(path, { ...options, method: "POST", body }),

  patch: (path, body, options) =>
    apiRequest(path, { ...options, method: "PATCH", body }),

  delete: (path, options) => apiRequest(path, { ...options, method: "DELETE" }),
});
