import { AUTH_MESSAGES } from "./auth.config";

export const LOGIN_PAGE_CONFIG = Object.freeze({
  aria: {
    titleId: "login-title",
    emailId: "login-email",
    passwordId: "login-password",
    authFeedbackId: "login-auth-feedback",
    localErrorId: "login-local-error",
  },

  header: {
    eyebrow: "Área reservada",
    title: "Iniciar sessão",
    description: "Introduz as tuas credenciais para aceder à plataforma.",
  },

  fields: {
    email: {
      label: "Email",
      placeholder: "nome@entidade.pt",
      autoComplete: "email",
    },

    password: {
      label: "Palavra-passe",
      placeholder: "Introduz a tua palavra-passe",
      autoComplete: "current-password",
    },
  },

  actions: {
    submit: "Iniciar sessão",
    submitting: "A iniciar sessão...",
    showPassword: "Mostrar palavra-passe",
    hidePassword: "Ocultar palavra-passe",
    showPasswordShort: "Mostrar",
    hidePasswordShort: "Ocultar",
  },

  feedback: {
    loadingSession: AUTH_MESSAGES.loadingSession,
    missingFields: "Preenche o email e a palavra-passe.",
  },

  footer: {
    note: "O acesso é direcionado automaticamente para a área associada às credenciais utilizadas.",
  },
});
