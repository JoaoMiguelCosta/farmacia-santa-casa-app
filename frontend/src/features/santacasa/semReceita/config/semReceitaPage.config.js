// src/features/santacasa/sem-receita/config/semReceitaPage.config.js
export const SEM_RECEITA_PAGE = Object.freeze({
  header: {
    eyebrow: "Sem receita médica",
    title: "Medicamentos não sujeitos a receita médica",
    description:
      "Medicamentos que não exigem receita médica e podem ser pedidos diretamente.",
  },

  form: {
    title: "Adicionar Medicamento não sujeito a receita médica",
    description:
      "Adiciona um Medicamento que o utente pode pedir sem apresentar receita médica.",
    submitLabel: "Adicionar Medicamento",
    submittingLabel: "A adicionar...",
    noUtenteSelectedMessage:
      "Seleciona um utente antes de adicionar Medicamento.",
    successMessage: "Medicamento adicionado com sucesso.",

    errors: {
      medicamentoRequired: "O Medicamento é obrigatório.",
      quantidadeInvalid: "A quantidade deve ser maior que 0.",
    },
  },

  list: {
    title: "Medicamentos disponíveis",
    description:
      "Medicamentos não sujeitos a receita médica, com quantidade disponível para pedido à Farmácia.",
    emptyTitle: "Sem Medicamentos disponíveis.",
    emptyDescription: "Adiciona um Medicamento ou seleciona outro utente.",
    noUtenteTitle: "Seleciona um utente.",
    noUtenteDescription:
      "Depois de selecionares um utente, os Medicamentos aparecem aqui.",
    loadingTitle: "A carregar Medicamentos...",
    loadingDescription: "Aguarda enquanto os Medicamentos são carregados.",
    errorTitle: "Não foi possível carregar os Medicamentos.",
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
      semReceitaDescription: "Não exige receita médica",
      total: "Total inicial:",
      dispensada: "Dispensadas:",
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
    title: "Remover Medicamento?",
    description:
      "Pode não ser possível remover se o Medicamento já estiver associado a pedidos.",
    confirmLabel: "Remover Medicamento",
    cancelLabel: "Cancelar",
  },

  fields: {
    medicamento: {
      id: "sem-receita-medicamento",
      label: "Medicamento",
      hint: "Indica o nome do Medicamento.",
      placeholder: "Ex: Ben-u-ron",
    },
    quantidade: {
      id: "sem-receita-quantidade",
      label: "Quantidade",
      hint: "Indica a quantidade disponível.",
      placeholder: "Ex: 2",
    },
  },
});
