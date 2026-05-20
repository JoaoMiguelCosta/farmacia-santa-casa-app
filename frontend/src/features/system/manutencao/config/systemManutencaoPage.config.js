export const SYSTEM_MANUTENCAO_PAGE = Object.freeze({
  header: {
    eyebrow: "Sistema/Admin",
    title: "Manutenção",
    description:
      "Execução controlada de jobs técnicos do sistema, com pré-visualização obrigatória antes de ações reais.",
  },

  sections: {
    jobs: {
      title: "Jobs disponíveis",
      description:
        "Rotinas técnicas disponíveis para execução manual controlada por administradores.",
      loadingTitle: "A carregar jobs...",
      errorTitle: "Não foi possível carregar os jobs.",
      emptyTitle: "Sem jobs disponíveis.",
      emptyDescription:
        "Quando existirem jobs configurados no backend, aparecem aqui.",
    },

    result: {
      title: "Resultado da operação",
      description:
        "Resumo devolvido pelo backend após uma pré-visualização ou execução.",
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
        "Expira linhas de receita vencidas e cancela itens pendentes associados.",
      scheduleLabel: "Diário",
      risk: "Médio",
      warning:
        "Pode cancelar itens pendentes associados a linhas de receita expiradas.",
    },

    higiene: {
      key: "higiene",
      title: "Higiene de utentes",
      description:
        "Marca utentes removidos antigos como arquivados e, quando permitido, anonimiza dados.",
      scheduleLabel: "Mensal",
      risk: "Elevado",
      warning:
        "Pode alterar dados de utentes removidos antigos. Usa preview antes de executar.",
    },

    purgeHistory: {
      key: "purge-history",
      title: "Limpeza de histórico",
      description:
        "Remove histórico antigo de pedidos fechados e regularizações concluídas.",
      scheduleLabel: "Mensal",
      risk: "Crítico",
      warning:
        "Ação destrutiva. Pode apagar histórico antigo. Nunca executes sem confirmar o preview.",
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
      hint: "Define a idade mínima dos registos considerados pelo job.",
    },

    anonymize: {
      label: "Anonimizar utentes",
      hint: "Só será aplicado se o backend permitir anonimização.",
    },
  },

  resultLabels: {
    job: "Job",
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
    title: "Executar job de manutenção?",
    description:
      "Esta ação pode alterar ou remover dados. Confirma apenas depois de analisares o preview.",
    confirmLabel: "Executar job",
    cancelLabel: "Cancelar",
  },

  feedback: {
    genericError: "Ocorreu um erro inesperado.",
    previewFirst: "Faz primeiro uma pré-visualização antes de executar.",
    previewSuccess: "Pré-visualização concluída.",
    runSuccess: "Job executado com sucesso.",
  },
});
