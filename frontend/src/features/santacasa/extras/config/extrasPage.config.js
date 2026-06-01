// src/features/santacasa/extras/config/extrasPage.config.js
export const EXTRAS_PAGE = Object.freeze({
  header: {
    eyebrow: "Vendas suspensas",
    title: "Medicamentos para Venda Suspensa",
    description:
      "Medicamentos que exigem receita, mas que ainda não têm receita disponível.",
  },

  form: {
    title: "Criar Medicamento para Venda Suspensa",
    description:
      "Adiciona um Medicamento que o utente precisa, mas que ainda não tem receita disponível.",
    submitLabel: "Criar Medicamento",
    submittingLabel: "A criar...",
    noUtenteSelectedMessage:
      "Seleciona um utente antes de criar um Medicamento para Venda Suspensa.",
    successMessage: "Medicamento para Venda Suspensa criado com sucesso.",

    errors: {
      medicamentoRequired: "O Medicamento é obrigatório.",
      quantidadeSolicitadaInvalid: "A quantidade deve ser maior que 0.",
    },
  },

  list: {
    title: "Medicamentos para Venda Suspensa",
    description:
      "Medicamentos sem receita disponível, com quantidade ainda disponível para pedido à Farmácia.",
    emptyTitle: "Sem Medicamentos para Venda Suspensa.",
    emptyDescription:
      "Cria um Medicamento para Venda Suspensa ou seleciona outro utente.",
    noUtenteTitle: "Seleciona um utente.",
    noUtenteDescription:
      "Depois de selecionares um utente, os Medicamentos para Venda Suspensa aparecem aqui.",
    loadingTitle: "A carregar Medicamentos...",
    loadingDescription: "Aguarda enquanto os Medicamentos são carregados.",
    errorTitle:
      "Não foi possível carregar os Medicamentos para Venda Suspensa.",
    retryLabel: "Tentar novamente",

    deleteLabel: "Remover",
    deletingLabel: "A remover...",
    deleteSuccessMessage: "Medicamento removido com sucesso.",

    emptyValue: "—",

    columns: {
      medicamento: "Medicamento",
      quantidade: "Quantidade",
      criadoEm: "Criado em",
      pedido: "Pedido",
      remover: "Remover",
    },

    labels: {
      extraDescription: "Para Venda Suspensa",
      total: "Total:",
      dispensada: "Dispensadas",
      emPedido: "Em pedidos:",
      quantidadeShort: "Qtd",
    },

    pedidoActions: {
      addLabel: "Adicionar",
      noStockLabel: "Sem saldo",
      quantityAriaLabelPrefix: "Quantidade para pedido de",
    },
  },

  deleteDialog: {
    title: "Remover Medicamento para Venda Suspensa?",
    description:
      "Pode não ser possível remover se o Medicamento já estiver associado a pedidos.",
    confirmLabel: "Remover Medicamento",
    cancelLabel: "Cancelar",
  },

  fields: {
    medicamento: {
      id: "extra-medicamento",
      label: "Medicamento",
      hint: "Indica o nome do Medicamento.",
      placeholder: "Ex: Cipralex 30mg",
    },
    quantidadeSolicitada: {
      id: "extra-quantidade-solicitada",
      label: "Quantidade",
      hint: "Indica a quantidade necessária.",
      placeholder: "Ex: 3",
    },
  },
});
