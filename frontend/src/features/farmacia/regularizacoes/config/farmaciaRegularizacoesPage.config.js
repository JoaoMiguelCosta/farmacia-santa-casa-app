export const FARMACIA_REGULARIZACOES_PAGE = Object.freeze({
  header: {
    eyebrow: "Farmácia",
    title: "Regularizações",
    description:
      "Acompanha Extras criados a partir de pedidos validados e regularizados por receitas futuras.",
  },

  sections: {
    signal: {
      title: "Resumo operacional",
      description:
        "Totais acumulados de eventos e unidades regularizadas pela Farmácia.",
      loadingTitle: "A carregar resumo...",
      errorTitle: "Não foi possível carregar o resumo.",
    },

    pending: {
      title: "Regularizações pendentes",
      description:
        "Extras que ainda aguardam regularização total ou parcial por receita.",
      emptyTitle: "Sem regularizações pendentes.",
      emptyDescription:
        "Quando a Farmácia validar pedidos com Extras, eles aparecem aqui até serem regularizados.",
      loadingTitle: "A carregar regularizações pendentes...",
      errorTitle: "Não foi possível carregar as regularizações pendentes.",
    },

    history: {
      title: "Histórico de regularizações",
      description:
        "Regularizações concluídas, com eventos associados às linhas de receita usadas.",
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
    viewDetails: "Ver detalhes",
    hideDetails: "Ocultar detalhes",
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
    quantidadeSolicitada: "Quantidade solicitada",
    quantidadeRegularizada: "Quantidade regularizada",
    quantidadeRestante: "Quantidade restante",
    createdAt: "Criada em",
    updatedAt: "Atualizada em",
    eventos: "Eventos",
    evento: "Evento",
    receita: "Receita",
    receitaNumber: "N.º receita",
    receitaLinha: "Linha de receita",
    pinAcesso: "PIN de acesso",
    pinOpcao: "PIN de opção",
    validade: "Validade",
    quantidade: "Quantidade",
    totalEventos: "Total de eventos",
    totalUnidades: "Total de unidades",
    latestEventoAt: "Última regularização",
  },

  waitingRecipe: {
    title: "A aguardar receita",
    description:
      "Esta regularização ainda não tem receita associada. Quando for criada uma receita futura com este medicamento, aparecem aqui o número da receita, o PIN de acesso e o PIN de opção.",
  },

  filters: {
    searchLabel: "Pesquisa geral",
    searchPlaceholder: "Pesquisar por pedido, utente, receita ou PIN...",
    medicamentoLabel: "Medicamento",
    medicamentoPlaceholder: "Pesquisar medicamento...",
    fromLabel: "Data inicial",
    toLabel: "Data final",
    submit: "Filtrar",
    clear: "Limpar",
  },

  feedback: {
    genericError: "Ocorreu um erro inesperado.",
  },
});
