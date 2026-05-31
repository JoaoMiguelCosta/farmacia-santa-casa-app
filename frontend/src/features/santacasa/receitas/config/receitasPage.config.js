// src/features/santacasa/receitas/config/receitasPage.config.js
export const RECEITAS_PAGE = Object.freeze({
  header: {
    eyebrow: "Santa Casa",
    title: "Receitas",
    description:
      "Cria receitas oficiais, consulta linhas disponíveis e gere saldos por utente.",
  },

  form: {
    title: "Criar receita",
    description:
      "Regista uma receita com os respetivos códigos e uma ou mais linhas de medicamentos.",
    submitLabel: "Criar receita",
    submittingLabel: "A criar...",
    addLineLabel: "Adicionar linha",
    removeLineLabel: "Remover linha",
    noUtenteSelectedMessage: "Seleciona um utente antes de criar receita.",
    compositionEyebrow: "Composição",
    linesTitle: "Linhas da receita",
    lineLegendPrefix: "Linha",
    successMessage: "Receita criada com sucesso.",
    regularizationSuccessPrefix: "Regularização automática:",
    regularizationUsedSingular: "foi usada para regularização",
    regularizationUsedPlural: "foram usadas para regularização",
    regularizationRemainingSingular: "ficou disponível na linha de receita",
    regularizationRemainingPlural: "ficaram disponíveis na linha de receita",
    regularizationNoRemaining:
      "não ficou quantidade disponível na linha de receita",

    errors: {
      numero19Invalid: "O número da receita deve ter exatamente 19 dígitos.",
      pinAcesso6Invalid: "O PIN de acesso deve ter exatamente 6 dígitos.",
      pinOpcao4Invalid: "O PIN de opção deve ter exatamente 4 dígitos.",
      medicamentoRequired: "O medicamento é obrigatório.",
      quantidadeInvalid: "A quantidade deve ser maior que 0.",
      validadeRequired: "A validade é obrigatória.",
      validadePast: "A validade não pode ser anterior ao dia atual.",
      numero19Conflict: "Já existe uma receita com esse número.",
    },
  },

  regularizationDialog: {
    title: "Confirmar regularização automática?",
    description:
      "Esta receita vai regularizar vendas suspensas pendentes deste utente. Confirma apenas se os dados da receita estiverem corretos.",
    confirmLabel: "Criar receita e regularizar",
    cancelLabel: "Voltar atrás",
    fallbackDetails:
      "A receita tem impacto em regularizações pendentes. Confirma para continuar.",
  },

  list: {
    title: "Linhas de receita disponíveis",
    description:
      "Linhas ativas com quantidade restante para o utente selecionado.",
    emptyTitle: "Sem linhas de receita disponíveis.",
    emptyDescription:
      "Cria uma receita para este utente ou seleciona outro utente.",
    noUtenteTitle: "Seleciona um utente.",
    noUtenteDescription:
      "Depois de selecionares um utente, as receitas disponíveis aparecem aqui.",
    loadingTitle: "A carregar receitas...",
    loadingDescription: "Aguarda enquanto as receitas são carregadas.",
    errorTitle: "Não foi possível carregar as receitas.",
    retryLabel: "Tentar novamente",

    deleteLabel: "Remover",
    deletingLabel: "A remover...",
    deleteSuccessMessage: "Linha de receita removida com sucesso.",

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
      total: "Total",
      dispensada: "Dispensada",
      usadaRegularizacao: "Usada em regularização",
      emPedido: "Em pedido",
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
    title: "Remover linha de receita?",
    description:
      "Esta ação pode ser bloqueada se a linha já tiver sido usada em pedidos, dispensas ou regularizações.",
    confirmLabel: "Remover linha",
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
