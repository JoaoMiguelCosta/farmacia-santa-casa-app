// src/features/santacasa/regularizacoes/config/santaCasaRegularizacoesPage.config.js

export const SANTACASA_REGULARIZACOES_PAGE = Object.freeze({
  header: {
    eyebrow: "Santa Casa",
    title: "Regularizações",
    description:
      "Acompanha medicamentos de Venda Suspensa pendentes e consulta o histórico das regularizações concluídas.",
  },

  sections: {
    signal: {
      title: "Atividade de regularizações",
      description:
        "Resumo das receitas usadas para compensar medicamentos de Venda Suspensa.",
      loadingTitle: "A carregar atividade...",
      errorTitle: "Não foi possível carregar a atividade das regularizações.",
    },

    pending: {
      title: "Regularizações pendentes",
      description:
        "Medicamentos que ainda precisam de receita para ficarem totalmente regularizados.",
      emptyTitle: "Sem regularizações pendentes.",
      emptyDescription:
        "Quando existirem medicamentos por regularizar, aparecem aqui.",
      loadingTitle: "A carregar regularizações pendentes...",
      errorTitle: "Não foi possível carregar as regularizações pendentes.",
    },

    history: {
      title: "Histórico de regularizações",
      description:
        "Regularizações concluídas com receitas usadas pela Farmácia para compensar medicamentos de Venda Suspensa anteriores.",
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

    viewDetails: "Ver receitas usadas",
    hideDetails: "Ocultar receitas usadas",

    viewMedicamentos: "Ver medicamentos",
    hideMedicamentos: "Ocultar medicamentos",
    viewMoreMedicamentos: "Ver mais",
    viewAllMedicamentos: "Ver todos",

    viewRegularizacoes: "Ver regularizações",
    hideRegularizacoes: "Ocultar regularizações",
    viewMoreRegularizacoes: "Ver mais",
    viewAllRegularizacoes: "Ver todos",
    showLessRegularizacoes: "Mostrar menos",
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

    date: "Data",
    historyDateDescription: "Regularizações concluídas neste dia",

    utente: "Utente",
    utenteNumber: "N.º utente",

    medicamento: "Medicamento",
    quantidadeSolicitada: "Total de unidades para regularizar",
    quantidadeRegularizada: "Regularizado",
    quantidadeRestante: "Falta regularizar",
    unidadesRegularizadas: "Unidades regularizadas",

    progress: "Progresso",

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
    quantidade: "Regularizou",

    totalEventos: "Receitas usadas na regularização:",
    totalUnidades: "Unidades regularizadas:",
    latestEventoAt: "Última receita usada:",

    regularizacoesPendentes: "Regularizações pendentes",
    regularizacoesConcluidas: "Regularizações concluídas",

    regularizacoesShort: "Regularizações",
    unidadesShort: "Unidades",
    receitasShort: "Receitas",
  },

  waitingRecipe: {
    title: "A aguardar receita",
    description:
      "Este medicamento ainda precisa de uma ou mais receitas para ficar regularizado.",
  },

  completedRecipe: {
    title: "Regularização concluída",
    description:
      "Este medicamento já foi compensado por uma ou mais receitas futuras.",
  },

  filters: {
    searchLabel: "Pesquisa geral",
    searchPlaceholder: "Pesquisar por pedido, utente, medicamento, receita...",
    fromLabel: "Data inicial",
    toLabel: "Data final",
    clear: "Limpar",
    submit: "Filtrar",
  },

  feedback: {
    genericError: "Ocorreu um erro inesperado.",
    loadingDescription: "Aguarda enquanto os dados são carregados.",
  },
});
