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
  },

  labels: {
    receita: "Com receita",
    semReceita: "Sem receita",
    extra: "Extra",
    add: "Adicionar",
    remove: "Remover",
    quantity: "Quantidade",
  },
});
