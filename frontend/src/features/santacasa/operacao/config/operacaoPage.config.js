// src/features/santacasa/operacao/config/operacaoPage.config.js
export const OPERACAO_PAGE = Object.freeze({
  page: {
    titleId: "operacao-title",
  },

  header: {
    eyebrow: "Santa Casa",
    title: "Operação diária",
    description:
      "Gere receitas, medicamentos não sujeitos a receita médica e vendas suspensas. A partir daqui podes adicionar itens ao pedido geral para a Farmácia.",
    refreshLabel: "Atualizar operação",
    refreshingLabel: "A atualizar...",
  },

  selectedUtente: {
    eyebrow: "Utente selecionado",
    titleFallback: "Seleciona um utente",
    descriptionFallback:
      "Escolhe um utente para carregar receitas, medicamentos não sujeitos a receita médica e vendas suspensas.",
    numberLabel: "Número de utente",
  },

  summary: {
    ariaLabel: "Resumo operacional",
    receitasLabel: "Linhas de receita",
    semReceitaLabel: "Medicamentos não sujeitos a receita médica",
    extrasLabel: "Vendas Suspensas",
    pedidoDraftLabel: "No pedido geral",
  },

  draft: {
    eyebrow: "Pedido geral",
    title: "Itens selecionados para Farmácia",
    description:
      "Os itens adicionados nesta página ficam guardados no pedido geral. Podes adicionar itens de vários utentes e enviar tudo pela página Pedidos.",
    linkLabel: "Ver pedido geral",
    singularItemLabel: "item",
    pluralItemLabel: "itens",
    buildNotice: (count) =>
      `Existem ${count} ${count === 1 ? "item" : "itens"} no pedido geral.`,
  },

  sections: {
    receitas: {
      id: "operacao-receitas",
      eyebrow: "Receitas",
      title: "Receitas do utente",
      description:
        "Cria receitas, seleciona linhas para o pedido geral ou remove linhas ainda removíveis.",
    },

    semReceita: {
      id: "operacao-sem-receita",
      eyebrow: "Medicamentos não sujeitos a receita médica",
      title: "Medicamentos não sujeitos a receita médica",
      description:
        "Adiciona medicamentos não sujeitos a receita médica, seleciona para o pedido geral ou remove registos ainda removíveis.",
    },

    extras: {
      id: "operacao-extras",
      eyebrow: "Vendas Suspensas",
      title: "Vendas suspensas em aberto",
      description:
        "Cria vendas suspensas, seleciona para o pedido geral ou remove registos ainda removíveis.",
    },
  },
});
