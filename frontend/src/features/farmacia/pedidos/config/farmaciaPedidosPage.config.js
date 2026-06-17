// src/features/farmacia/pedidos/config/farmaciaPedidosPage.config.js
export const FARMACIA_PEDIDOS_PAGE = Object.freeze({
  header: {
    eyebrow: "Farmácia",
    title: "Pedidos",
    description:
      "Consulta os pedidos enviados pela Santa Casa e abre cada pedido para conferir os utentes, medicamentos e receitas antes da decisão.",
  },

  detail: {
    backLabel: "Voltar aos pedidos",

    eyebrow: "Farmácia",
    title: "Detalhe do pedido",
    description:
      "Consulta os utentes e os medicamentos incluídos neste pedido.",

    refreshLabel: "Atualizar pedido",
    refreshingLabel: "A atualizar...",

    loadingTitle: "A carregar pedido...",
    loadingDescription: "Aguarda enquanto os dados do pedido são carregados.",

    errorTitle: "Não foi possível carregar o pedido.",
    retryLabel: "Tentar novamente",

    actionBar: {
      ariaLabel: "Ações do pedido",
      title: "Decisão do pedido",

      description:
        "A validação ou rejeição aplica-se aos medicamentos ainda pendentes deste pedido.",

      warningDescription:
        "A decisão aplica-se apenas aos medicamentos ainda pendentes. Os medicamentos cancelados por expiração são mantidos para consulta e auditoria.",

      labels: {
        utentes: "Total de utentes",
        validatableItems: "Medicamentos pendentes",
        validatableQuantity: "Quantidade pendente",
        expiredItems: "Cancelados por expiração",
        expiredQuantity: "Quantidade cancelada",
      },
    },
  },

  sections: {
    list: {
      title: "Pedidos pendentes",
      description:
        "Pedidos que aguardam conferência. Abre um pedido para consultar o conteúdo e tomar uma decisão.",

      countSingular: "pedido pendente",
      countPlural: "pedidos pendentes",

      emptyTitle: "Sem pedidos pendentes.",
      emptyDescription:
        "Quando a Santa Casa enviar novos pedidos, ficam disponíveis nesta área.",

      loadingTitle: "A carregar pedidos...",
      loadingDescription:
        "Aguarda enquanto os pedidos pendentes são carregados.",

      errorTitle: "Não foi possível carregar os pedidos.",
    },
  },

  decisionDialog: {
    eyebrow: "Confirmação necessária",
    expiryWarningTitle: "Existem medicamentos cancelados por expiração",

    labels: {
      pedido: "Pedido",
      totalUtentes: "Total de utentes",

      totalItems: "Total de medicamentos",
      totalQuantity: "Quantidade total",

      validatableItems: "Medicamentos a validar",
      validatableQuantity: "Quantidade a validar",

      rejectableItems: "Medicamentos a rejeitar",
      rejectableQuantity: "Quantidade a rejeitar",

      expiredItems: "Cancelados por expiração",
      expiredQuantity: "Quantidade cancelada",
    },
  },

  validateDialog: {
    icon: "✓",
    title: "Validar pedido?",

    description:
      "As quantidades deste pedido serão registadas como dispensadas e serão criadas as regularizações aplicáveis às vendas suspensas.",

    warningDescription:
      "Apenas os medicamentos ainda pendentes serão validados. Os medicamentos cancelados por expiração não serão dispensados.",

    supportingText:
      "Confirma os medicamentos, as quantidades e os dados das receitas antes de validar.",

    warningSupportingText:
      "Confirma os medicamentos ainda pendentes. Os medicamentos expirados serão ignorados e mantidos no pedido para auditoria.",

    expiryNotice:
      "Os medicamentos cancelados por expiração não serão validados nem apagados. A quantidade, a validade e os códigos da receita permanecem disponíveis para consulta.",

    confirmLabel: "Validar pedido",
    cancelLabel: "Cancelar",
    successMessage: "Pedido validado com sucesso.",
  },

  rejectDialog: {
    icon: "!",
    title: "Rejeitar pedido?",

    description:
      "Todos os itens pendentes deste pedido passam para o estado rejeitado e a decisão fica registada no histórico.",

    warningDescription:
      "A rejeição será aplicada apenas aos medicamentos ainda pendentes. Os medicamentos já cancelados por expiração mantêm o respetivo estado.",

    supportingText:
      "Confirma os dados do pedido e indica o motivo da rejeição quando for relevante.",

    warningSupportingText:
      "Confirma os medicamentos ainda pendentes. Os medicamentos expirados permanecem cancelados por expiração para auditoria.",

    expiryNotice:
      "Os medicamentos cancelados por expiração não serão alterados para rejeitados e continuam disponíveis para consulta.",

    confirmLabel: "Rejeitar pedido",
    cancelLabel: "Cancelar",
    successMessage: "Pedido rejeitado com sucesso.",

    reasonLabel: "Motivo da rejeição",
    reasonPlaceholder: "Ex.: medicamento indisponível ou dados inválidos...",
    reasonHint: "Opcional. Máximo de 500 caracteres.",
    reasonMaxLength: 500,
  },

  feedback: {
    actionErrorTitle: "Erro na operação",
    genericError: "Ocorreu um erro inesperado.",
    validateError: "Não foi possível validar o pedido.",
    rejectError: "Não foi possível rejeitar o pedido.",
    validateSuccessDetail: "foi validado.",
    rejectSuccessDetail: "foi rejeitado.",
  },

  labels: {
    pedido: "Pedido",
  },
});
