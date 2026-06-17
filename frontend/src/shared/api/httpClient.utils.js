import { HTTP_CLIENT_CONFIG } from "./httpClient.config";

export function buildApiUrl(path, query = {}) {
  const url = new URL(`${HTTP_CLIENT_CONFIG.baseUrl}${path}`);

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;

    url.searchParams.set(key, value);
  });

  return url.toString();
}

export async function parseApiResponse(response) {
  const text = await response.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export function buildHttpError(response, data) {
  const message =
    data?.message ||
    data?.error ||
    HTTP_CLIENT_CONFIG.errors.fallbackMessage(response.status);

  const error = new Error(message);

  error.status = response.status;
  error.payload = data;
  error.code = data?.error || data?.code || null;

  error.isUnauthorized =
    response.status === HTTP_CLIENT_CONFIG.status.unauthorized;
  error.isForbidden = response.status === HTTP_CLIENT_CONFIG.status.forbidden;
  error.isAuthError = error.isUnauthorized || error.isForbidden;

  return error;
}

export function buildRequestHeaders({ body, headers = {} } = {}) {
  return {
    ...(body
      ? { "Content-Type": HTTP_CLIENT_CONFIG.defaultHeaders.contentType }
      : {}),
    ...headers,
  };
}
