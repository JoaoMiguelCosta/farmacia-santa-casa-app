export const HTTP_CLIENT_CONFIG = Object.freeze({
  baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api",

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
