export const SANTACASA_REGULARIZACOES_PAGE = Object.freeze({
  header: {
    eyebrow: "Santa Casa",
    title: "Regularizações",
    description:
      "Acompanha vendas suspensas enviadas para a Farmácia que aguardam receita futura ou já foram regularizadas.",
  },

  sections: {
    signal: {
      title: "Resumo das regularizações",
      description:
        "Visão geral das regularizações associadas às vendas suspensas enviadas pela Santa Casa.",
      loadingTitle: "A carregar resumo...",
      errorTitle: "Não foi possível carregar o resumo.",
    },

    pending: {
      title: "Regularizações pendentes",
      description:
        "Vendas suspensas que ainda precisam de receita futura para ficarem totalmente regularizadas.",
      emptyTitle: "Sem regularizações pendentes.",
      emptyDescription:
        "Quando existirem vendas suspensas ainda por regularizar, aparecem aqui.",
      loadingTitle: "A carregar regularizações pendentes...",
      errorTitle: "Não foi possível carregar as regularizações pendentes.",
    },

    history: {
      title: "Histórico de regularizações",
      description:
        "Regularizações concluídas com as receitas que foram usadas para compensar vendas suspensas anteriores.",
      emptyTitle: "Sem histórico de regularizações.",
      emptyDescription:
        "Quando uma regularização ficar concluída, aparece neste histórico.",
      loadingTitle: "A carregar histórico de regularizações...",
      errorTitle: "Não foi possível carregar o histórico de regularizações.",
    },
  },

  tabs: {
    pending: "Pendentes",
    history: "Histórico",
  },

  actions: {
    refresh: "Atualizar",
    refreshing: "A atualizar...",
    viewDetails: "Ver receita usada",
    hideDetails: "Ocultar receita",
  },

  status: {
    PENDENTE: "Pendente",
    PARCIALMENTE_REGULARIZADO: "Parcialmente regularizado",
    REGULARIZADO: "Regularizado",
  },

  labels: {
    regularizacao: "Regularização",
    pedido: "Pedido",
    pedidoNumber: "N.º pedido",
    status: "Estado",

    utente: "Utente",
    utenteNumber: "N.º utente",

    medicamento: "Medicamento",
    quantidadeSolicitada: "Quantidade enviada como venda suspensa",
    quantidadeRegularizada: "Quantidade regularizada",
    quantidadeRestante: "Quantidade ainda em falta",

    createdAt: "Criada em",
    updatedAt: "Atualizada em",

    eventos: "Receitas usadas",
    evento: "Receita usada",
    receita: "Receita",
    receitaNumber: "N.º receita",
    receitaLinha: "Linha de receita",
    pinAcesso: "PIN de acesso",
    pinOpcao: "PIN de opção",
    validade: "Validade",
    quantidade: "Quantidade regularizada",

    totalEventos: "Regularizações feitas",
    totalUnidades: "Unidades regularizadas",
    latestEventoAt: "Última regularização",
  },

  waitingRecipe: {
    title: "A aguardar receita",
    description:
      "Esta Venda Suspensa ainda precisa de uma receita futura com o mesmo medicamento para ser regularizada.",
  },

  completedRecipe: {
    title: "Regularização concluída",
    description:
      "Esta Venda Suspensa já foi compensada por uma ou mais receitas futuras.",
  },

  filters: {
    searchLabel: "Pesquisa geral",
    searchPlaceholder:
      "Pesquisar por pedido, utente, medicamento, receita ou PIN...",
    fromLabel: "Data inicial",
    toLabel: "Data final",
    clear: "Limpar",
    submit: "Filtrar",
  },

  feedback: {
    genericError: "Ocorreu um erro inesperado.",
  },
});
