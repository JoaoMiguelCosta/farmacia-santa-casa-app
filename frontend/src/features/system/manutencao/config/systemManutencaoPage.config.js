// src/features/system/manutencao/config/systemManutencaoPage.config.js

export const SYSTEM_MANUTENCAO_PAGE = Object.freeze({
  header: {
    eyebrow: "Administração",
    title: "Manutenção",
    description:
      "Acompanha e executa tarefas protegidas da plataforma, sempre com pré-visualização antes de qualquer ação real.",
  },

  sections: {
    jobs: {
      title: "Tarefas de manutenção",
      description:
        "Operações protegidas disponíveis para administradores responsáveis pela Santa Casa e Farmácia.",
      loadingTitle: "A carregar tarefas...",
      errorTitle: "Não foi possível carregar as tarefas de manutenção.",
      emptyTitle: "Sem tarefas disponíveis.",
      emptyDescription: "Quando existirem tarefas configuradas, aparecem aqui.",
    },

    result: {
      title: "Resultado da operação",
      description:
        "Resumo devolvido após uma pré-visualização ou execução de manutenção.",
      emptyTitle: "Sem resultado disponível.",
      emptyDescription:
        "Executa uma pré-visualização para veres o impacto previsto.",
    },
  },

  jobs: {
    receitaExpiry: {
      key: "receita-expiry",
      title: "Expiração de receitas",
      description:
        "Identifica receitas vencidas, expira as respetivas linhas e cancela itens pendentes associados.",
      scheduleLabel: "Diário",
      risk: "Médio",
      warning:
        "Pode cancelar itens pendentes associados a linhas de receita expiradas.",
    },

    higiene: {
      key: "higiene",
      title: "Higiene de utentes",
      description:
        "Trata registos antigos de utentes removidos, mantendo a base de dados mais limpa e controlada.",
      scheduleLabel: "Mensal",
      risk: "Elevado",
      warning:
        "Pode alterar dados de utentes removidos antigos. Usa sempre a pré-visualização antes de executar.",
    },

    purgeHistory: {
      key: "purge-history",
      title: "Limpeza de histórico",
      description:
        "Remove histórico antigo de pedidos fechados e regularizações concluídas.",
      scheduleLabel: "Mensal",
      risk: "Crítico",
      warning:
        "Ação destrutiva. Pode apagar histórico antigo. Nunca executes sem confirmar a pré-visualização.",
    },
  },

  jobOrder: ["receita-expiry", "higiene", "purge-history"],

  jobLabels: {
    "receita-expiry": "Expiração de receitas",
    higiene: "Higiene de utentes",
    "purge-history": "Limpeza de histórico",
  },

  actions: {
    refresh: "Atualizar",
    refreshing: "A atualizar...",

    preview: "Pré-visualizar",
    previewing: "A pré-visualizar...",

    run: "Executar",
    running: "A executar...",

    confirmRun: "Confirmar execução",
    close: "Fechar",
  },

  options: {
    offsetMonths: {
      label: "Meses de margem",
      placeholder: "Ex: 6",
      hint: "Define a idade mínima dos registos considerados pela tarefa.",
    },

    anonymize: {
      label: "Anonimizar utentes",
      hint: "Só será aplicado se o sistema permitir anonimização.",
    },
  },

  resultLabels: {
    job: "Tarefa",
    mode: "Modo",
    options: "Opções",
    result: "Resultado",

    preview: "Pré-visualização",
    run: "Execução",

    checkedAt: "Verificado em",
    cutoffDate: "Data limite",
    offsetMonths: "Meses de margem",

    expiredLines: "Linhas expiradas",
    pendingItemsFromExpiredLines: "Itens pendentes de receitas expiradas",
    canceledPedidoItems: "Itens cancelados",
    canceledPedidos: "Pedidos cancelados",

    candidatos: "Utentes candidatos",
    atualizados: "Utentes atualizados",
    anonymize: "Anonimizar utentes",
    anonymizeRequested: "Anonimização pedida",
    anonymizeApplied: "Anonimização aplicada",

    pedidos: "Pedidos",
    pedidoItens: "Itens de pedido",
    dispensas: "Dispensas",
    regularizacoes: "Regularizações",
    eventos: "Eventos",
    regularizacoesDesvinculadas: "Regularizações desvinculadas",
  },

  confirmDialog: {
    title: "Executar tarefa de manutenção?",
    description:
      "Esta ação pode alterar ou remover dados. Confirma apenas depois de analisares a pré-visualização.",
    confirmLabel: "Executar tarefa",
    cancelLabel: "Cancelar",
  },

  feedback: {
    genericError: "Ocorreu um erro inesperado.",
    previewFirst: "Faz primeiro uma pré-visualização antes de executar.",
    previewSuccess: "Pré-visualização concluída.",
    runSuccess: "Tarefa executada com sucesso.",
  },
});
