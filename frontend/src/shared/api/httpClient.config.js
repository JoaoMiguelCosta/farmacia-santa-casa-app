const DEVELOPMENT_API_BASE_URL = "http://localhost:3001/api";

function getApiBaseUrl() {
  const configuredApiBaseUrl = String(
    import.meta.env.VITE_API_BASE_URL || "",
  ).trim();

  if (configuredApiBaseUrl) {
    return configuredApiBaseUrl;
  }

  if (import.meta.env.DEV) {
    return DEVELOPMENT_API_BASE_URL;
  }

  throw new Error(
    "[httpClient] VITE_API_BASE_URL é obrigatória fora do ambiente de desenvolvimento.",
  );
}

export const HTTP_CLIENT_CONFIG = Object.freeze({
  baseUrl: getApiBaseUrl(),

  defaultHeaders: {
    contentType: "application/json",
  },

  status: {
    unauthorized: 401,
    forbidden: 403,
  },

  errors: {
    fallbackMessage: (status) => `Erro HTTP ${status} ao comunicar com a API.`,
  },
});
