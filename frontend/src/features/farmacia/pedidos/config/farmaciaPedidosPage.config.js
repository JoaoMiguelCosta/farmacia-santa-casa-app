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
        "A validação ou rejeição aplica-se a todos os utentes e medicamentos deste pedido.",

      labels: {
        utentes: "Total de utentes",
        items: "Medicamentos",
        quantity: "Quantidade total",
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

      updatingLabel: "A atualizar os resultados...",

      search: {
        ariaLabel: "Pesquisar pedidos pendentes",
        label: "Pesquisar pedidos",
        placeholder:
          "Pesquisar por número, utente, medicamento, receita ou PIN...",
        submitLabel: "Pesquisar",
        clearLabel: "Limpar",

        emptyTitle: "Nenhum pedido corresponde à pesquisa.",
        emptyDescription:
          "Altera ou limpa a pesquisa para consultares os restantes pedidos pendentes.",
      },

      pagination: {
        resultsPrefix: "A mostrar",
        resultsSeparator: "de",

        resultSingular: "pedido",
        resultPlural: "pedidos",

        pageLabel: "Página",
        pageSeparator: "de",

        previousLabel: "Anterior",
        nextLabel: "Seguinte",
      },

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

    labels: {
      pedido: "Pedido",
      totalUtentes: "Total de utentes",
      totalItems: "Total de medicamentos",
      totalQuantity: "Quantidade total",
    },
  },

  validateDialog: {
    icon: "✓",
    title: "Validar pedido?",
    description:
      "As quantidades deste pedido serão registadas como dispensadas e serão criadas as regularizações aplicáveis às vendas suspensas.",
    supportingText:
      "Confirma os medicamentos, as quantidades e os dados das receitas antes de validar.",
    confirmLabel: "Validar pedido",
    cancelLabel: "Cancelar",
    successMessage: "Pedido validado com sucesso.",
  },

  rejectDialog: {
    icon: "!",
    title: "Rejeitar pedido?",
    description:
      "Todos os itens pendentes deste pedido passam para o estado rejeitado e a decisão fica registada no histórico.",
    supportingText:
      "Confirma os dados do pedido e indica o motivo da rejeição quando for relevante.",
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
