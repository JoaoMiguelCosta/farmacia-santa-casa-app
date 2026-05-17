const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

function buildUrl(path, query = {}) {
  const url = new URL(`${API_BASE_URL}${path}`);

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;

    url.searchParams.set(key, value);
  });

  return url.toString();
}

async function parseResponse(response) {
  const text = await response.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiRequest(path, options = {}) {
  const { method = "GET", body, query, headers = {} } = options;

  const response = await fetch(buildUrl(path, query), {
    method,
    credentials: "include",
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      `Erro HTTP ${response.status} ao comunicar com a API.`;

    const error = new Error(message);
    error.status = response.status;
    error.payload = data;

    throw error;
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
