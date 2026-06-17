export const FARMACIA_REGULARIZACOES_PAGE = Object.freeze({
  header: {
    eyebrow: "Farmácia",
    title: "Regularizações",
    description:
      "Acompanha medicamentos de Venda Suspensa que aguardam receita compatível e consulta regularizações já concluídas.",
  },

  details: {
    backLabel: "Voltar às regularizações",
    eyebrow: "Regularizações do utente",
    titleFallback: "Utente",
    description:
      "Consulta os medicamentos de Venda Suspensa pendentes deste utente, agrupados por medicamento e com origem por pedido.",
    summaryAriaLabel: "Resumo operacional do utente",
    medicinesTitle: "Medicamentos para regularizar",
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
      "Consulta as regularizações concluídas deste utente, agrupadas por data e com rastreabilidade das receitas usadas.",
    summaryAriaLabel: "Resumo histórico do utente",
    listTitle: "Regularizações concluídas",
    listDescription:
      "Registos concluídos pela Farmácia, organizados por data de regularização.",
    controlsAriaLabel: "Filtros do histórico do utente",
    searchLabel: "Pesquisar histórico",
    searchPlaceholder: "Pesquisar por medicamento, pedido, receita ou PIN...",
    fromLabel: "Data inicial",
    toLabel: "Data final",
    emptyResultsTitle: "Sem histórico para estes filtros.",
    emptyResultsDescription:
      "Ajusta a pesquisa ou as datas para voltar a ver regularizações deste utente.",
    loadingTitle: "A carregar histórico do utente...",
    loadingDescription: "Aguarda enquanto os dados são carregados.",
    errorTitle: "Não foi possível carregar o histórico do utente.",
    emptyTitle: "Sem histórico para este utente.",
    emptyDescription:
      "Quando este utente tiver regularizações concluídas, aparecem aqui.",
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
      title: "Resumo operacional",
      description:
        "Indicadores acumulados das regularizações feitas pela Farmácia.",
      loadingTitle: "A carregar resumo...",
      loadingDescription: "Aguarda enquanto o resumo é carregado.",
      errorTitle: "Não foi possível carregar o resumo.",
    },

    pending: {
      title: "Regularizações pendentes",
      description:
        "Utentes com medicamentos de Venda Suspensa ainda por regularizar total ou parcialmente com receita compatível.",
      emptyTitle: "Sem regularizações pendentes.",
      emptyDescription:
        "Quando existirem utentes com medicamentos de Venda Suspensa por regularizar, aparecem aqui.",
      loadingTitle: "A carregar regularizações pendentes...",
      loadingDescription: "Aguarda enquanto os dados são carregados.",
      errorTitle: "Não foi possível carregar as regularizações pendentes.",
    },

    history: {
      title: "Histórico de regularizações",
      description:
        "Utentes com regularizações concluídas pela Farmácia, com acesso ao detalhe histórico por utente.",
      emptyTitle: "Sem histórico de regularizações.",
      emptyDescription:
        "Quando uma regularização for concluída, aparece neste histórico.",
      loadingTitle: "A carregar histórico de regularizações...",
      loadingDescription: "Aguarda enquanto os dados são carregados.",
      errorTitle: "Não foi possível carregar o histórico de regularizações.",
    },
  },

  toolbar: {
    ariaLabel: "Controlos da página",
    tabsAriaLabel: "Regularizações",
    totalLabel: "Total",
  },

  pagination: {
    ariaLabel: "Paginação das regularizações da Farmácia",
    emptyLabel: "Sem resultados.",
    previous: "Anterior",
    next: "Seguinte",
    getLabel({ start, end, total, currentPage, totalPages }) {
      return `A mostrar ${start}-${end} de ${total} regularização(ões). Página ${currentPage} de ${totalPages}.`;
    },
  },

  accessibility: {
    quantidadeStatus: "Estado da quantidade",
    receitaBarcodes: "Códigos da receita",
    utenteRegularizacoesGroup: "Resumo de regularizações por utente",
    historicoUtenteRegularizacoesGroup:
      "Resumo histórico de regularizações por utente",
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
    viewRegularizacoes: "Consultar regularizações",
    viewHistorico: "Consultar histórico",
    clearDetailsFilters: "Limpar filtros",
    clearHistoryFilters: "Limpar filtros",
    viewAllMedicamentos: "Ver todos",
    showLessMedicamentos: "Mostrar menos",
    viewAllHistory: "Ver todos",
    showLessHistory: "Mostrar menos",
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
    origemPorPedido: "Origem por pedido",
    status: "Estado",
    situacao: "Situação",
    comParciais: "Com parciais",
    comPendentes: "Com pendentes",
    regularizado: "Regularizado",
    utente: "Utente",
    utenteNumber: "N.º utente",
    medicamento: "Medicamento",
    medicamentos: "Medicamentos",
    medicamentosPorRegularizar: "Medicamentos por regularizar",
    unidadesRestantes: "Unidades restantes",
    unidadesRegularizadas: "Unidades regularizadas",
    regularizacoesConcluidas: "Regularizações concluídas",
    receitasUsadas: "Receitas usadas",
    ultimaRegularizacao: "Última regularização",
    parciais: "Parciais",
    pendentes: "Pendentes",
    quantidadeSolicitada: "Solicitada",
    quantidadeRegularizada: "Regularizada",
    quantidadeRestante: "Restante",
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
    progresso: "Progresso",
    totalEventos: "Total de eventos",
    totalUnidades: "Total de unidades",
    latestEventoAt: "Última regularização",
  },

  waitingRecipe: {
    title: "A aguardar receita compatível",
    description:
      "Quando existir uma receita futura para este medicamento, os dados da receita aparecem aqui para concluir a regularização.",
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
