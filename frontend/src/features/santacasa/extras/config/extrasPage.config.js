// src/features/santacasa/extras/config/extrasPage.config.js
export const EXTRAS_PAGE = Object.freeze({
  header: {
    eyebrow: "Santa Casa",
    title: "Vendas Suspensas",
    description:
      "Regista e acompanha vendas suspensas para medicamentos sem receita disponível no momento.",
  },

  form: {
    title: "Criar Venda Suspensa",
    description:
      "Regista um medicamento para pedido à Farmácia quando ainda não existe receita disponível.",
    submitLabel: "Criar Venda Suspensa",
    submittingLabel: "A criar...",
    noUtenteSelectedMessage:
      "Seleciona um utente antes de criar uma Venda Suspensa.",
    successMessage: "Venda Suspensa criada com sucesso.",

    errors: {
      medicamentoRequired: "O medicamento é obrigatório.",
      quantidadeSolicitadaInvalid:
        "A quantidade solicitada deve ser maior que 0.",
    },
  },

  list: {
    title: "Vendas suspensas em aberto",
    description:
      "Lista de medicamentos sem receita disponível no momento, com quantidade ainda disponível para pedido.",
    emptyTitle: "Sem vendas suspensas em aberto.",
    emptyDescription: "Cria uma venda suspensa ou seleciona outro utente.",
    noUtenteTitle: "Seleciona um utente.",
    noUtenteDescription:
      "Depois de selecionares um utente, as vendas suspensas aparecem aqui.",
    loadingTitle: "A carregar vendas suspensas...",
    loadingDescription: "Aguarda enquanto as vendas suspensas são carregadas.",
    errorTitle: "Não foi possível carregar as vendas suspensas.",
    retryLabel: "Tentar novamente",

    deleteLabel: "Remover",
    deletingLabel: "A remover...",
    deleteSuccessMessage: "Venda Suspensa removida com sucesso.",

    emptyValue: "—",

    columns: {
      medicamento: "Medicamento",
      quantidade: "Quantidade",
      criadoEm: "Criado em",
      pedido: "Pedido",
      remover: "Remover",
    },

    labels: {
      extraDescription: "Venda Suspensa",
      total: "Total",
      dispensada: "Dispensada",
      emPedido: "Em pedido",
      quantidadeShort: "Qtd",
    },

    pedidoActions: {
      addLabel: "Adicionar",
      noStockLabel: "Sem saldo",
      quantityAriaLabelPrefix: "Quantidade para pedido de",
    },
  },

  deleteDialog: {
    title: "Remover Venda Suspensa?",
    description:
      "Esta ação pode ser bloqueada se a venda suspensa já estiver associada a pedidos.",
    confirmLabel: "Remover Venda Suspensa",
    cancelLabel: "Cancelar",
  },

  fields: {
    medicamento: {
      id: "extra-medicamento",
      label: "Medicamento",
      hint: "Indica o nome do medicamento.",
      placeholder: "Ex: Cipralex 30mg",
    },
    quantidadeSolicitada: {
      id: "extra-quantidade-solicitada",
      label: "Quantidade solicitada",
      hint: "Deve ser um número inteiro maior que 0.",
      placeholder: "Ex: 3",
    },
  },
});
