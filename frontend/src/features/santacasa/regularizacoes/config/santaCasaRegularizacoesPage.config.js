// src/features/santacasa/regularizacoes/config/santaCasaRegularizacoesPage.config.js

export const SANTACASA_REGULARIZACOES_PAGE = Object.freeze({
  header: {
    eyebrow: "Santa Casa",
    title: "Regularizações",
    description:
      "Acompanha medicamentos de Venda Suspensa pendentes e consulta o histórico das regularizações concluídas.",
  },

  details: {
    backLabel: "Voltar às regularizações",
    eyebrow: "Regularizações do utente",
    titleFallback: "Utente",
    description:
      "Acompanha os medicamentos de Venda Suspensa deste utente que aguardam regularização total ou parcial pela Farmácia.",
    summaryAriaLabel: "Resumo das regularizações pendentes do utente",
    medicinesTitle: "Medicamentos por regularizar",
    medicinesDescription:
      "Medicamentos pendentes deste utente, agrupados por medicamento e com origem por pedido nos detalhes.",
    controlsAriaLabel: "Filtros dos medicamentos do utente",
    searchLabel: "Pesquisar medicamento",
    searchPlaceholder: "Pesquisar por medicamento ou pedido...",
    statusLabel: "Estado",
    statusAll: "Todos",
    emptyResultsTitle: "Sem medicamentos para estes filtros.",
    emptyResultsDescription:
      "Ajusta a pesquisa ou o estado para voltar a ver medicamentos deste utente.",
    loadingTitle: "A carregar regularizações do utente...",
    loadingDescription: "Aguarda enquanto os dados são carregados.",
    errorTitle: "Não foi possível carregar as regularizações do utente.",
    emptyTitle: "Sem regularizações pendentes para este utente.",
    emptyDescription:
      "Quando este utente tiver medicamentos de Venda Suspensa por regularizar, aparecem aqui.",
    getMedicinesResultsLabel({ visible, filtered, total }) {
      if (filtered !== total) {
        return `A mostrar ${visible} de ${filtered} medicamento(s) filtrado(s). Total do utente: ${total}.`;
      }

      return `A mostrar ${visible} de ${total} medicamento(s).`;
    },
    getViewMoreMedicinesLabel({ count }) {
      return `Ver mais ${count}`;
    },
    getHiddenMedicinesLabel({ hidden }) {
      if (hidden === 1) {
        return "Ainda existe 1 medicamento por mostrar.";
      }

      return `Ainda existem ${hidden} medicamentos por mostrar.`;
    },
  },

  historyDetails: {
    backLabel: "Voltar ao histórico",
    eyebrow: "Histórico do utente",
    titleFallback: "Utente",
    description:
      "Consulta as regularizações concluídas pela Farmácia para este utente, agrupadas por data e com rastreabilidade das receitas usadas.",
    summaryAriaLabel: "Resumo histórico das regularizações do utente",
    listTitle: "Regularizações concluídas",
    listDescription:
      "Regularizações concluídas pela Farmácia, organizadas por data de conclusão.",
    controlsAriaLabel: "Filtros do histórico do utente",
    searchLabel: "Pesquisar histórico",
    searchPlaceholder: "Pesquisar por medicamento, pedido, receita ou PIN...",
    fromLabel: "Data inicial",
    toLabel: "Data final",
    emptyResultsTitle: "Sem histórico para estes filtros.",
    emptyResultsDescription:
      "Ajusta a pesquisa ou o intervalo de datas para voltar a ver regularizações deste utente.",
    loadingTitle: "A carregar histórico do utente...",
    loadingDescription: "Aguarda enquanto os dados são carregados.",
    errorTitle: "Não foi possível carregar o histórico do utente.",
    emptyTitle: "Sem histórico para este utente.",
    emptyDescription:
      "Quando este utente tiver regularizações concluídas pela Farmácia, aparecem aqui.",
    dateGroupLabel: "Regularizações concluídas nesta data",
    getHistoryResultsLabel({ visible, filtered, total }) {
      if (filtered !== total) {
        return `A mostrar ${visible} de ${filtered} regularização(ões) filtrada(s). Total do utente: ${total}.`;
      }

      return `A mostrar ${visible} de ${total} regularização(ões).`;
    },
    getViewMoreHistoryLabel({ count }) {
      return `Ver mais ${count}`;
    },
    getHiddenHistoryLabel({ hidden }) {
      if (hidden === 1) {
        return "Ainda existe 1 regularização por mostrar.";
      }

      return `Ainda existem ${hidden} regularizações por mostrar.`;
    },
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
    showLessMedicamentos: "Mostrar menos",

    viewRegularizacoes: "Ver regularizações",
    hideRegularizacoes: "Ocultar regularizações",
    viewMoreRegularizacoes: "Ver mais",
    viewAllRegularizacoes: "Ver todos",
    showLessRegularizacoes: "Mostrar menos",

    consultRegularizacoes: "Consultar regularizações",
    consultHistorico: "Consultar histórico",

    clearDetailsFilters: "Limpar filtros",
    clearHistoryFilters: "Limpar filtros",
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
    pedidos: "Pedidos",
    pedidosEnvolvidos: "Pedidos envolvidos",
    status: "Estado",
    situacao: "Situação",

    comParciais: "Com parciais",
    comPendentes: "Com pendentes",
    parciais: "Parciais",
    pendentes: "Pendentes",
    regularizado: "Regularizado",

    date: "Data",
    historyDateDescription: "Regularizações concluídas neste dia",

    utente: "Utente",
    utenteNumber: "N.º utente",

    medicamento: "Medicamento",
    medicamentos: "Medicamentos",
    medicamentosPorRegularizar: "Medicamentos por regularizar",
    quantidadeSolicitada: "Total de unidades para regularizar",
    quantidadeRegularizada: "Regularizado",
    quantidadeRestante: "Falta regularizar",
    unidadesRestantes: "Unidades por regularizar",
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
    ultimaRegularizacao: "Última regularização",

    regularizacoesPendentes: "Regularizações pendentes",
    regularizacoesConcluidas: "Regularizações concluídas",

    regularizacoesShort: "Regularizações",
    unidadesShort: "Unidades",
    receitasShort: "Receitas",
    receitasUsadas: "Receitas usadas",
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
