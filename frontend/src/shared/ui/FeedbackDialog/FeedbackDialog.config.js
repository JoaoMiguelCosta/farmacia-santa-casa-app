export const FEEDBACK_DIALOG_CONFIG = Object.freeze({
  ids: {
    title: "feedback-dialog-title",
    description: "feedback-dialog-description",
  },

  defaultCloseLabel: "Fechar",

  fallbackType: "info",

  types: {
    success: {
      eyebrow: "Sucesso",
      title: "Operação concluída",
      symbol: "✓",
    },

    error: {
      eyebrow: "Erro",
      title: "Operação não concluída",
      symbol: "!",
    },

    info: {
      eyebrow: "Informação",
      title: "Aviso",
      symbol: "i",
    },
  },
});
