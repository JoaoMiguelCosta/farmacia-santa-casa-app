// src/features/santacasa/receitas/config/receitasPage.config.js
export const RECEITAS_PAGE = Object.freeze({
  header: {
    eyebrow: "Receitas",
    title: "Receitas do utente",
    description:
      "Cria receitas com Medicamentos e consulta as quantidades disponíveis para pedido.",
  },

  form: {
    title: "Criar receita com Medicamentos",
    description:
      "Insere os códigos da receita e adiciona pelo menos um Medicamento.",
    submitLabel: "Criar receita",
    submittingLabel: "A criar...",
    addLineLabel: "Adicionar Medicamento",
    removeLineLabel: "Remover Medicamento",
    noUtenteSelectedMessage: "Seleciona um utente antes de criar uma receita.",
    lineLegendPrefix: "Medicamento",
    successMessage: "Receita criada com sucesso.",
    regularizationSuccessPrefix: "Venda suspensa atualizada:",
    regularizationUsedSingular:
      "foi usada para regularizar Medicamento pendente",
    regularizationUsedPlural:
      "foram usadas para regularizar Medicamentos pendentes",
    regularizationRemainingSingular: "ficou disponível na receita",
    regularizationRemainingPlural: "ficaram disponíveis na receita",
    regularizationNoRemaining: "não ficou quantidade disponível na receita",

    errors: {
      numero19Invalid: "O número da receita deve ter exatamente 19 dígitos.",
      pinAcesso6Invalid: "O PIN de acesso deve ter exatamente 6 dígitos.",
      pinOpcao4Invalid: "O PIN de opção deve ter exatamente 4 dígitos.",
      medicamentoRequired: "O Medicamento é obrigatório.",
      quantidadeInvalid: "A quantidade deve ser maior que 0.",
      validadeRequired: "A validade é obrigatória.",
      validadePast: "A validade não pode ser anterior ao dia atual.",
      numero19Conflict: "Já existe uma receita com esse número.",
    },
  },

  regularizationDialog: {
    title: "Atualizar Medicamentos para venda suspensa?",
    description:
      "Esta receita pode ser usada para regularizar Medicamentos que estavam sem receita disponível. Confirma apenas se os dados da receita estiverem corretos.",
    confirmLabel: "Criar receita e atualizar",
    cancelLabel: "Voltar atrás",
    fallbackDetails:
      "Esta receita tem impacto em Medicamentos para venda suspensa. Confirma para continuar.",
  },

  list: {
    title: "Medicamentos com receita",
    description:
      "Medicamentos com receita ativa, com quantidade disponível para pedido à Farmácia.",
    emptyTitle: "Sem Medicamentos disponíveis.",
    emptyDescription:
      "Cria uma receita para este utente ou seleciona outro utente.",
    noUtenteTitle: "Seleciona um utente.",
    noUtenteDescription:
      "Depois de selecionares um utente, os Medicamentos com receita aparecem aqui.",
    loadingTitle: "A carregar receitas...",
    loadingDescription: "Aguarda enquanto as receitas são carregadas.",
    errorTitle: "Não foi possível carregar as receitas.",
    retryLabel: "Tentar novamente",

    deleteLabel: "Remover",
    deletingLabel: "A remover...",
    deleteSuccessMessage: "Medicamento removido com sucesso.",

    selectedUtenteFallback: "Utente selecionado",
    emptyValue: "—",

    columns: {
      utente: "Utente",
      receita: "Receita",
      medicamento: "Medicamento",
      quantidade: "Quantidade",
      validade: "Validade",
      estado: "Estado",
      criadoEm: "Criado em",
      pedido: "Pedido",
      remover: "Remover",
    },

    labels: {
      receitaPrefix: "Receita",
      pinPrefix: "PIN",
      optionPrefix: "Opção",
      total: "Total inicial:",
      dispensada: "Dispensadas:",
      usadaRegularizacao: "Para regularizações:",
      emPedido: "Em pedidos:",
      quantidadeShort: "Qtd",
    },

    codes: {
      title: "Códigos da receita",
      showLabel: "Ver códigos",
      hideLabel: "Ocultar códigos",
    },

    pedidoActions: {
      addLabel: "Adicionar",
      noStockLabel: "Sem saldo",
      usePreviousLabel: "Usar anterior",
    },

    fefo: {
      blockedMessage: "Usa primeiro a receita com validade mais próxima.",
    },
  },

  deleteDialog: {
    title: "Remover Medicamento da receita?",
    description:
      "Pode não ser possível remover se alguma quantidade já tiver sido usada em pedidos ou em Medicamentos para venda suspensa.",
    confirmLabel: "Remover Medicamento",
    cancelLabel: "Cancelar",
  },

  fields: {
    numero19: {
      id: "numero19",
      label: "Número da receita",
      hint: "Deve conter exatamente 19 dígitos.",
      placeholder: "Ex: 1234567890123456789",
    },
    pinAcesso6: {
      id: "pinAcesso6",
      label: "PIN de acesso",
      hint: "Deve conter exatamente 6 dígitos.",
      placeholder: "Ex: 123456",
    },
    pinOpcao4: {
      id: "pinOpcao4",
      label: "PIN de opção",
      hint: "Deve conter exatamente 4 dígitos.",
      placeholder: "Ex: 1234",
    },
    medicamento: {
      label: "Medicamento",
      placeholder: "Ex: Paracetamol 1000mg",
    },
    quantidade: {
      label: "Quantidade",
      placeholder: "Ex: 2",
    },
    validade: {
      label: "Validade",
    },
  },
});
