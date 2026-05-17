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
    successMessage: "Receita criada com sucesso.",
    regularizationSuccessPrefix: "Regularização automática:",
    regularizationUsedSingular: "foi usada para regularização",
    regularizationUsedPlural: "foram usadas para regularização",
    regularizationRemainingSingular: "ficou disponível na linha de receita",
    regularizationRemainingPlural: "ficaram disponíveis na linha de receita",
    regularizationNoRemaining:
      "não ficou quantidade disponível na linha de receita",
  },

  list: {
    title: "Linhas de receita disponíveis",
    description:
      "Linhas ativas com quantidade restante para o utente selecionado.",
    emptyTitle: "Sem linhas de receita disponíveis.",
    emptyDescription:
      "Cria uma receita para este utente ou seleciona outro utente.",
    loadingTitle: "A carregar receitas...",
    errorTitle: "Não foi possível carregar as receitas.",
    deleteLabel: "Remover",
    deletingLabel: "A remover...",
    deleteSuccessMessage: "Linha de receita removida com sucesso.",
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
