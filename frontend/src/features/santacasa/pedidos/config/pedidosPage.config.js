// src/features/santacasa/pedidos/config/pedidosPage.config.js
export const PEDIDOS_PAGE = Object.freeze({
  header: {
    eyebrow: "Santa Casa",
    title: "Pedidos",
    description:
      "Revê o pedido geral, envia medicamentos para a Farmácia e acompanha pedidos pendentes.",
  },

  summary: {
    ariaLabel: "Resumo dos pedidos",

    cards: {
      items: {
        singular: "Medicamento no pedido geral",
        plural: "Medicamentos no pedido geral",
      },

      utentes: {
        singular: "Utente incluído",
        plural: "Utentes incluídos",
      },

      pending: {
        singular: "Pedido pendente",
        plural: "Pedidos pendentes",
      },
    },
  },

  sections: {
    available: {
      title: "Medicamentos disponíveis",
      description:
        "Seleciona os medicamentos disponíveis para incluir no pedido.",
      emptyTitle: "Sem medicamentos disponíveis.",
      emptyDescription:
        "Este utente não tem receitas, medicamentos não sujeitos a receita médica ou vendas suspensas com quantidade restante.",
      loadingTitle: "A carregar medicamentos disponíveis...",
      errorTitle: "Não foi possível carregar os medicamentos disponíveis.",
    },

    draft: {
      title: "Pedido geral para a Farmácia",
      description:
        "Revê os medicamentos selecionados por utente antes de enviares um único pedido para a Farmácia.",
      emptyTitle: "Pedido geral vazio.",
      emptyDescription:
        "Adiciona medicamentos a partir da página Operação. Podes juntar medicamentos de vários utentes no mesmo pedido.",
      submitLabel: "Enviar para Farmácia",
      submittingLabel: "A enviar...",
      successMessage: "Pedido criado com sucesso.",
      detailsVisibleLimit: 10,
      visibleMedicamentosLabel: "A mostrar {visible} de {total} medicamentos.",
      itemsAriaLabel: "Medicamentos do pedido geral",
    },

    pending: {
      title: "Pedidos enviados pendentes",
      description:
        "Pedidos enviados para a Farmácia que ainda aguardam validação ou rejeição.",
      emptyTitle: "Sem pedidos pendentes.",
      emptyDescription:
        "Quando enviares pedidos para a Farmácia, aparecem aqui enquanto aguardam decisão.",
      loadingTitle: "A carregar pedidos pendentes...",
      errorTitle: "Não foi possível carregar os pedidos pendentes.",
      detailsTitle: "Medicamentos do pedido",
      detailsVisibleLimit: 10,
      visibleMedicamentosLabel: "A mostrar {visible} de {total} medicamentos.",
      itemsAriaLabel: "Medicamentos do pedido pendente",
      barcodeAriaLabel: "Códigos da receita",
      paginationEmptyLabel: "Sem pedidos pendentes.",
      paginationLabel:
        "A mostrar {start}-{end} de {total} pedido(s). Página {currentPage} de {totalPages}.",
      expirationWarningTitle: "Pedido pendente com aviso",
      expirationWarningDescription:
        "Alguns medicamentos já não serão incluídos porque a validade da receita terminou antes da validação da Farmácia.",
    },
  },

  filters: {
    searchLabel: "Pesquisa",
    searchPlaceholder:
      "Pesquisar por pedido, utente, medicamento ou receita...",
    submit: "Filtrar",
    clear: "Limpar",
  },

  actions: {
    refresh: "Atualizar",
    refreshing: "A atualizar...",
    previous: "Anterior",
    next: "Seguinte",
    clearDraft: "Limpar pedido",
    clearDraftGeneral: "Limpar pedido geral",
    cancelPedido: "Cancelar pedido",
    cancelingPedido: "A cancelar...",
    viewMedicamentos: "Ver medicamentos",
    hideMedicamentos: "Ocultar medicamentos",
    viewMoreMedicamentos: "Ver mais {amount}",
    viewAllMedicamentos: "Ver todos",
  },

  clearDialog: {
    title: "Limpar pedido geral?",
    description:
      "Todos os medicamentos selecionados serão retirados do pedido geral. As quantidades voltam a ficar disponíveis nas respetivas listas.",
    confirmLabel: "Limpar pedido",
    cancelLabel: "Cancelar",
  },

  cancelDialog: {
    title: "Cancelar pedido pendente?",
    description:
      "Esta ação cancela o pedido antes da validação pela Farmácia. Os medicamentos deixam de estar reservados e voltam às respetivas listas disponíveis, desde que continuem válidos.",
    confirmLabel: "Cancelar pedido",
    cancelLabel: "Manter pedido",
    reason: "Pedido criado por engano pela Santa Casa.",
  },

  feedback: {
    cancelSuccess:
      "Pedido cancelado com sucesso. Os medicamentos deixaram de estar reservados.",
    expiredReceitaRemoved:
      "{medicamento} foi removido do pedido geral porque a receita expirou ou deixou de estar disponível. Revê o pedido atualizado e volta a enviar.",
    expiredReceitasRemoved:
      "{count} medicamentos foram removidos do pedido geral porque as receitas expiraram ou deixaram de estar disponíveis: {medicamentos}. Revê o pedido atualizado e volta a enviar.",
    draftSyncError:
      "Não foi possível confirmar se as receitas do pedido geral continuam disponíveis. Atualiza a página e tenta novamente.",
    genericError: "Ocorreu um erro inesperado.",
  },

  labels: {
    receita: "Com receita",
    semReceita: "Medicamentos não sujeitos a receita médica",
    extra: "Venda Suspensa",

    add: "Adicionar",
    remove: "Remover",
    return: "Retirar",
    removeFromPedido: "Remover medicamento",

    quantity: "Quantidade no pedido",
    quantityToReturn: "Qtd a retirar",
    maxAvailable: "Disponível",
    availableAtOrigin: "Ainda disponível",
    quantityInPedido: "No pedido",

    pedido: "Pedido",
    pendingStatus: "Pendente",
    pendingWithWarningsStatus: "Pendente com avisos",
    validatedStatus: "Validado",
    validatedWithWarningsStatus: "Validado com avisos",
    rejectedStatus: "Rejeitado",
    canceledStatus: "Cancelado",
    canceledByExpirationStatus: "Cancelado por expiração",
    status: "Estado",
    createdAt: "Criado em",
    utente: "Utente",
    utentes: "Utentes",
    items: "Medicamentos",
    totalQuantity: "Quantidade total",
    pendingItems: "Pendentes",
    canceledItems: "Cancelados",
    pendingQuantity: "Quantidade pendente",
    canceledQuantity: "Quantidade cancelada",

    itemSingular: "medicamento",
    itemPlural: "medicamentos",
    expiredItemSingular: "medicamento cancelado por expiração",
    expiredItemPlural: "medicamentos cancelados por expiração",
    utenteSingular: "utente",
    utentePlural: "utentes",
    unidadeSingular: "unidade",
    unidadePlural: "unidades",

    receitaNumber: "N.º receita",
    pinAcesso: "PIN acesso",
    pinOpcao: "PIN opção",
    validadeReceita: "Validade",
    expiredReceitaItemDescription:
      "A receita deste medicamento expirou antes da validação da Farmácia.",

    medicamentoFallback: "Medicamento",
    utenteFallback: "Utente",
    emptyValue: "—",
    quantityShort: "Qtd.",
    numeroUtente: "N.º utente",
  },
});
