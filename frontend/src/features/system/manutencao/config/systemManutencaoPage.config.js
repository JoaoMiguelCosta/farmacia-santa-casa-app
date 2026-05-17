export const FARMACIA_MANUTENCAO_PAGE = Object.freeze({
  header: {
    eyebrow: "Farmácia",
    title: "Manutenção",
    description:
      "Execução controlada de jobs operacionais da Farmácia, com pré-visualização obrigatória antes de ações reais.",
  },

  sections: {
    access: {
      title: "Acesso de manutenção",
      description:
        "Introduz a chave de manutenção para consultar previews e executar jobs protegidos.",
    },

    jobs: {
      title: "Jobs disponíveis",
      description:
        "Rotinas operacionais disponíveis para execução manual controlada.",
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

  access: {
    keyLabel: "Chave de manutenção",
    keyPlaceholder: "Introduz a chave de manutenção...",
    saveLabel: "Guardar chave",
    clearLabel: "Limpar chave",
    savedLabel: "Chave ativa nesta sessão.",
    missingLabel: "Chave de manutenção em falta.",
    storageKey: "farmacia-santa-casa:maintenance-key",
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
    missingKey: "Introduz a chave de manutenção antes de continuar.",
    previewFirst: "Faz primeiro uma pré-visualização antes de executar.",
    previewSuccess: "Pré-visualização concluída.",
    runSuccess: "Job executado com sucesso.",
  },
});
