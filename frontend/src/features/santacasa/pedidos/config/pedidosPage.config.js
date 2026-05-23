export const PEDIDOS_PAGE = Object.freeze({
  header: {
    eyebrow: "Santa Casa",
    title: "Pedidos",
    description:
      "Cria pedidos para a Farmácia juntando linhas de receita, medicamentos sem receita e Extras num único envio.",
  },

  sections: {
    available: {
      title: "Itens disponíveis",
      description:
        "Seleciona os medicamentos disponíveis para incluir no pedido.",
      emptyTitle: "Sem itens disponíveis.",
      emptyDescription:
        "Este utente não tem receitas, medicamentos sem receita ou Extras com quantidade restante.",
      loadingTitle: "A carregar itens disponíveis...",
      errorTitle: "Não foi possível carregar os itens disponíveis.",
    },

    draft: {
      title: "Pedido em preparação",
      description:
        "Revê os itens selecionados antes de enviar o pedido para a Farmácia.",
      emptyTitle: "Ainda não selecionaste itens.",
      emptyDescription:
        "Adiciona pelo menos um item disponível para criar o pedido.",
      submitLabel: "Enviar pedido para Farmácia",
      submittingLabel: "A enviar pedido...",
      successMessage: "Pedido criado com sucesso.",
    },

    pending: {
      title: "Pedidos enviados pendentes",
      description:
        "Pedidos enviados para a Farmácia que ainda aguardam validação ou rejeição.",
      emptyTitle: "Sem pedidos pendentes.",
      emptyDescription:
        "Quando enviares pedidos para a Farmácia, aparecem aqui enquanto aguardam decisão.",
      loadingTitle: "A carregar pedidos pendentes...",
      errorTitle: "Não foi possível carregar os pedidos pendentes.",
    },
  },

  filters: {
    searchLabel: "Pesquisa",
    searchPlaceholder:
      "Pesquisar por pedido, utente, medicamento ou receita...",
    submit: "Filtrar",
    clear: "Limpar",
  },

  actions: {
    refresh: "Atualizar",
    refreshing: "A atualizar...",
    previous: "Anterior",
    next: "Seguinte",
    cancelPedido: "Cancelar pedido",
    cancelingPedido: "A cancelar...",
  },

  cancelDialog: {
    title: "Cancelar pedido pendente?",
    description:
      "Esta ação cancela o pedido antes da validação pela Farmácia. Os itens deixam de estar reservados e voltam às respetivas listas disponíveis, desde que continuem válidos.",
    confirmLabel: "Cancelar pedido",
    cancelLabel: "Manter pedido",
    reason: "Pedido criado por engano pela Santa Casa.",
  },

  feedback: {
    cancelSuccess:
      "Pedido cancelado com sucesso. Os itens deixaram de estar reservados.",
    genericError: "Ocorreu um erro inesperado.",
  },

  labels: {
    receita: "Com receita",
    semReceita: "Sem receita",
    extra: "Extra",
    add: "Adicionar",
    remove: "Remover",
    quantity: "Quantidade",
    pedido: "Pedido",
    status: "Estado",
    createdAt: "Criado em",
    utente: "Utente",
    items: "Itens",
    totalQuantity: "Quantidade total",
  },
});
