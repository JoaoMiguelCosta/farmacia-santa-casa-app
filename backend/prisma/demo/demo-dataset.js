const { normalizeText } = require("../../src/shared/utils/normalize");

const { buildDemoDates } = require("./demo-dates");

const DEMO_IDS = Object.freeze({
  utentes: Object.freeze({
    ana: "demo-utente-ana-martins-v1",
    manuel: "demo-utente-manuel-oliveira-v1",
    helena: "demo-utente-helena-costa-v1",
    joaquim: "demo-utente-joaquim-silva-v1",
    rosa: "demo-utente-rosa-almeida-v1",
    antonio: "demo-utente-antonio-ferreira-v1",
    luisa: "demo-utente-luisa-santos-v1",
  }),

  medicamentos: Object.freeze({
    atorvastatina: "demo-medicamento-atorvastatina-20-v1",
    metformina: "demo-medicamento-metformina-850-v1",
    ramipril: "demo-medicamento-ramipril-5-v1",
    sertralina: "demo-medicamento-sertralina-50-v1",
    amlodipina: "demo-medicamento-amlodipina-5-v1",
    levotiroxina: "demo-medicamento-levotiroxina-50-v1",
    omeprazol: "demo-medicamento-omeprazol-20-v1",
    paracetamol: "demo-medicamento-paracetamol-500-v1",
    ibuprofeno: "demo-medicamento-ibuprofeno-400-v1",
  }),

  medicacoesHabituais: Object.freeze({
    ana: "demo-medicacao-habitual-ana-v1",
    manuel: "demo-medicacao-habitual-manuel-v1",
    helena: "demo-medicacao-habitual-helena-v1",
    joaquim: "demo-medicacao-habitual-joaquim-v1",
    rosa: "demo-medicacao-habitual-rosa-v1",
    antonio: "demo-medicacao-habitual-antonio-v1",
    luisa: "demo-medicacao-habitual-luisa-v1",
  }),

  receitas: Object.freeze({
    ana: "demo-receita-ana-ativa-v1",
    manuel: "demo-receita-manuel-validada-v1",
    helena: "demo-receita-helena-rejeitada-v1",
    rosa: "demo-receita-rosa-regularizacao-v1",
    antonio: "demo-receita-antonio-regularizacao-v1",
    luisa: "demo-receita-luisa-expirada-v1",
  }),

  receitaLinhas: Object.freeze({
    ana: "demo-receita-linha-ana-atorvastatina-v1",
    manuel: "demo-receita-linha-manuel-metformina-v1",
    helena: "demo-receita-linha-helena-ramipril-v1",
    rosa: "demo-receita-linha-rosa-amlodipina-v1",
    antonio: "demo-receita-linha-antonio-levotiroxina-v1",
    luisa: "demo-receita-linha-luisa-omeprazol-v1",
  }),

  semReceita: Object.freeze({
    ana: "demo-sem-receita-ana-paracetamol-v1",
    manuel: "demo-sem-receita-manuel-ibuprofeno-v1",
  }),

  extras: Object.freeze({
    anaAberto: "demo-extra-ana-sertralina-aberto-v1",
    joaquim: "demo-extra-joaquim-sertralina-v1",
    rosa: "demo-extra-rosa-amlodipina-v1",
    antonio: "demo-extra-antonio-levotiroxina-v1",
  }),

  pedidos: Object.freeze({
    pendente: "demo-pedido-pendente-v1",
    validado: "demo-pedido-validado-v1",
    rejeitado: "demo-pedido-rejeitado-v1",
    regularizacaoPendente: "demo-pedido-regularizacao-pendente-v1",
    regularizacaoParcial: "demo-pedido-regularizacao-parcial-v1",
    regularizacaoTotal: "demo-pedido-regularizacao-total-v1",
    cancelado: "demo-pedido-cancelado-expiracao-v1",
  }),

  pedidoItens: Object.freeze({
    pendenteReceita: "demo-pedido-item-pendente-receita-v1",
    pendenteSemReceita: "demo-pedido-item-pendente-sem-receita-v1",

    validadoReceita: "demo-pedido-item-validado-receita-v1",
    validadoSemReceita: "demo-pedido-item-validado-sem-receita-v1",

    rejeitadoReceita: "demo-pedido-item-rejeitado-receita-v1",

    regularizacaoPendente: "demo-pedido-item-regularizacao-pendente-v1",
    regularizacaoParcial: "demo-pedido-item-regularizacao-parcial-v1",
    regularizacaoTotal: "demo-pedido-item-regularizacao-total-v1",

    canceladoReceita: "demo-pedido-item-cancelado-receita-v1",
  }),

  dispensas: Object.freeze({
    manuel: "demo-dispensa-manuel-metformina-v1",
  }),

  regularizacoes: Object.freeze({
    pendente: "demo-regularizacao-pendente-v1",
    parcial: "demo-regularizacao-parcial-v1",
    total: "demo-regularizacao-total-v1",
  }),

  regularizacaoEventos: Object.freeze({
    parcial: "demo-regularizacao-evento-parcial-v1",
    total: "demo-regularizacao-evento-total-v1",
  }),

  alertas: Object.freeze({
    pedidoPendente: "demo-alerta-pedido-pendente-v1",
    regularizacaoParcial: "demo-alerta-regularizacao-parcial-v1",
    regularizacaoTotal: "demo-alerta-regularizacao-total-v1",
  }),
});

const DEMO_MEDICAMENTOS = Object.freeze({
  atorvastatina: Object.freeze({
    id: DEMO_IDS.medicamentos.atorvastatina,
    nome: "Atorvastatina 20 mg",
    tipo: "COM_RECEITA",
  }),

  metformina: Object.freeze({
    id: DEMO_IDS.medicamentos.metformina,
    nome: "Metformina 850 mg",
    tipo: "COM_RECEITA",
  }),

  ramipril: Object.freeze({
    id: DEMO_IDS.medicamentos.ramipril,
    nome: "Ramipril 5 mg",
    tipo: "COM_RECEITA",
  }),

  sertralina: Object.freeze({
    id: DEMO_IDS.medicamentos.sertralina,
    nome: "Sertralina 50 mg",
    tipo: "COM_RECEITA",
  }),

  amlodipina: Object.freeze({
    id: DEMO_IDS.medicamentos.amlodipina,
    nome: "Amlodipina 5 mg",
    tipo: "COM_RECEITA",
  }),

  levotiroxina: Object.freeze({
    id: DEMO_IDS.medicamentos.levotiroxina,
    nome: "Levotiroxina 50 microgramas",
    tipo: "COM_RECEITA",
  }),

  omeprazol: Object.freeze({
    id: DEMO_IDS.medicamentos.omeprazol,
    nome: "Omeprazol 20 mg",
    tipo: "COM_RECEITA",
  }),

  paracetamol: Object.freeze({
    id: DEMO_IDS.medicamentos.paracetamol,
    nome: "Paracetamol 500 mg",
    tipo: "SEM_RECEITA",
  }),

  ibuprofeno: Object.freeze({
    id: DEMO_IDS.medicamentos.ibuprofeno,
    nome: "Ibuprofeno 400 mg",
    tipo: "SEM_RECEITA",
  }),
});

const DEMO_EXPECTED_TOTALS = Object.freeze({
  utentes: 7,

  utentesByStatus: Object.freeze({
    ATIVO: 6,
    ARQUIVADO: 1,
  }),

  pedidos: 7,

  pedidosByStatus: Object.freeze({
    PENDENTE: 1,
    VALIDADO: 4,
    REJEITADO: 1,
    CANCELADO: 1,
  }),

  regularizacoes: 3,

  regularizacoesByStatus: Object.freeze({
    PENDENTE: 1,
    PARCIALMENTE_REGULARIZADO: 1,
    REGULARIZADO: 1,
  }),

  regularizacaoEventos: 2,
  regularizacaoUnidades: 5,

  alertas: 3,
});

function buildDemoDataset(now = new Date()) {
  const dates = buildDemoDates(now);

  const utentes = [
    {
      id: DEMO_IDS.utentes.ana,
      numero9: "990000001",
      nome: "Ana Martins",
      isValid: true,
      invalidReason: null,
      deletedAt: null,
      status: "ATIVO",
      archivedAt: null,
      archivedReason: null,
      archivedByRole: null,
      createdAt: dates.utentes.anaCreatedAt,
      updatedAt: dates.utentes.anaCreatedAt,
    },
    {
      id: DEMO_IDS.utentes.manuel,
      numero9: "990000002",
      nome: "Manuel Oliveira",
      isValid: true,
      invalidReason: null,
      deletedAt: null,
      status: "ATIVO",
      archivedAt: null,
      archivedReason: null,
      archivedByRole: null,
      createdAt: dates.utentes.manuelCreatedAt,
      updatedAt: dates.utentes.manuelCreatedAt,
    },
    {
      id: DEMO_IDS.utentes.helena,
      numero9: "990000003",
      nome: "Helena Costa",
      isValid: true,
      invalidReason: null,
      deletedAt: null,
      status: "ARQUIVADO",
      archivedAt: dates.utentes.helenaArchivedAt,
      archivedReason: "Utente transferida para outra instituição.",
      archivedByRole: "ADMIN",
      createdAt: dates.utentes.helenaCreatedAt,
      updatedAt: dates.utentes.helenaArchivedAt,
    },
    {
      id: DEMO_IDS.utentes.joaquim,
      numero9: "990000004",
      nome: "Joaquim Silva",
      isValid: true,
      invalidReason: null,
      deletedAt: null,
      status: "ATIVO",
      archivedAt: null,
      archivedReason: null,
      archivedByRole: null,
      createdAt: dates.utentes.joaquimCreatedAt,
      updatedAt: dates.utentes.joaquimCreatedAt,
    },
    {
      id: DEMO_IDS.utentes.rosa,
      numero9: "990000005",
      nome: "Rosa Almeida",
      isValid: true,
      invalidReason: null,
      deletedAt: null,
      status: "ATIVO",
      archivedAt: null,
      archivedReason: null,
      archivedByRole: null,
      createdAt: dates.utentes.rosaCreatedAt,
      updatedAt: dates.utentes.rosaCreatedAt,
    },
    {
      id: DEMO_IDS.utentes.antonio,
      numero9: "990000006",
      nome: "António Ferreira",
      isValid: true,
      invalidReason: null,
      deletedAt: null,
      status: "ATIVO",
      archivedAt: null,
      archivedReason: null,
      archivedByRole: null,
      createdAt: dates.utentes.antonioCreatedAt,
      updatedAt: dates.utentes.antonioCreatedAt,
    },
    {
      id: DEMO_IDS.utentes.luisa,
      numero9: "990000007",
      nome: "Luísa Santos",
      isValid: true,
      invalidReason: null,
      deletedAt: null,
      status: "ATIVO",
      archivedAt: null,
      archivedReason: null,
      archivedByRole: null,
      createdAt: dates.utentes.luisaCreatedAt,
      updatedAt: dates.utentes.luisaCreatedAt,
    },
  ];

  const medicamentos = Object.values(DEMO_MEDICAMENTOS);

  const medicacoesHabituais = [
    {
      id: DEMO_IDS.medicacoesHabituais.ana,
      utenteId: DEMO_IDS.utentes.ana,
      medicamento: DEMO_MEDICAMENTOS.atorvastatina.nome,
      medicamentoNorm: normalizeText(DEMO_MEDICAMENTOS.atorvastatina.nome),
      createdAt: dates.utentes.anaCreatedAt,
      updatedAt: dates.utentes.anaCreatedAt,
    },
    {
      id: DEMO_IDS.medicacoesHabituais.manuel,
      utenteId: DEMO_IDS.utentes.manuel,
      medicamento: DEMO_MEDICAMENTOS.metformina.nome,
      medicamentoNorm: normalizeText(DEMO_MEDICAMENTOS.metformina.nome),
      createdAt: dates.utentes.manuelCreatedAt,
      updatedAt: dates.utentes.manuelCreatedAt,
    },
    {
      id: DEMO_IDS.medicacoesHabituais.helena,
      utenteId: DEMO_IDS.utentes.helena,
      medicamento: DEMO_MEDICAMENTOS.ramipril.nome,
      medicamentoNorm: normalizeText(DEMO_MEDICAMENTOS.ramipril.nome),
      createdAt: dates.utentes.helenaCreatedAt,
      updatedAt: dates.utentes.helenaCreatedAt,
    },
    {
      id: DEMO_IDS.medicacoesHabituais.joaquim,
      utenteId: DEMO_IDS.utentes.joaquim,
      medicamento: DEMO_MEDICAMENTOS.sertralina.nome,
      medicamentoNorm: normalizeText(DEMO_MEDICAMENTOS.sertralina.nome),
      createdAt: dates.utentes.joaquimCreatedAt,
      updatedAt: dates.utentes.joaquimCreatedAt,
    },
    {
      id: DEMO_IDS.medicacoesHabituais.rosa,
      utenteId: DEMO_IDS.utentes.rosa,
      medicamento: DEMO_MEDICAMENTOS.amlodipina.nome,
      medicamentoNorm: normalizeText(DEMO_MEDICAMENTOS.amlodipina.nome),
      createdAt: dates.utentes.rosaCreatedAt,
      updatedAt: dates.utentes.rosaCreatedAt,
    },
    {
      id: DEMO_IDS.medicacoesHabituais.antonio,
      utenteId: DEMO_IDS.utentes.antonio,
      medicamento: DEMO_MEDICAMENTOS.levotiroxina.nome,
      medicamentoNorm: normalizeText(DEMO_MEDICAMENTOS.levotiroxina.nome),
      createdAt: dates.utentes.antonioCreatedAt,
      updatedAt: dates.utentes.antonioCreatedAt,
    },
    {
      id: DEMO_IDS.medicacoesHabituais.luisa,
      utenteId: DEMO_IDS.utentes.luisa,
      medicamento: DEMO_MEDICAMENTOS.omeprazol.nome,
      medicamentoNorm: normalizeText(DEMO_MEDICAMENTOS.omeprazol.nome),
      createdAt: dates.utentes.luisaCreatedAt,
      updatedAt: dates.utentes.luisaCreatedAt,
    },
  ];

  const receitas = [
    {
      id: DEMO_IDS.receitas.ana,
      utenteId: DEMO_IDS.utentes.ana,
      numero19: "9900000000000000001",
      pinAcesso6: "910001",
      pinOpcao4: "9001",
      createdAt: dates.receitas.anaCreatedAt,
      updatedAt: dates.receitas.anaCreatedAt,
    },
    {
      id: DEMO_IDS.receitas.manuel,
      utenteId: DEMO_IDS.utentes.manuel,
      numero19: "9900000000000000002",
      pinAcesso6: "910002",
      pinOpcao4: "9002",
      createdAt: dates.receitas.manuelCreatedAt,
      updatedAt: dates.pedidos.validadoClosedAt,
    },
    {
      id: DEMO_IDS.receitas.helena,
      utenteId: DEMO_IDS.utentes.helena,
      numero19: "9900000000000000003",
      pinAcesso6: "910003",
      pinOpcao4: "9003",
      createdAt: dates.receitas.helenaCreatedAt,
      updatedAt: dates.receitas.helenaCreatedAt,
    },
    {
      id: DEMO_IDS.receitas.rosa,
      utenteId: DEMO_IDS.utentes.rosa,
      numero19: "9900000000000000004",
      pinAcesso6: "910004",
      pinOpcao4: "9004",
      createdAt: dates.receitas.rosaCreatedAt,
      updatedAt: dates.regularizacoes.parcialUpdatedAt,
    },
    {
      id: DEMO_IDS.receitas.antonio,
      utenteId: DEMO_IDS.utentes.antonio,
      numero19: "9900000000000000005",
      pinAcesso6: "910005",
      pinOpcao4: "9005",
      createdAt: dates.receitas.antonioCreatedAt,
      updatedAt: dates.regularizacoes.totalUpdatedAt,
    },
    {
      id: DEMO_IDS.receitas.luisa,
      utenteId: DEMO_IDS.utentes.luisa,
      numero19: "9900000000000000006",
      pinAcesso6: "910006",
      pinOpcao4: "9006",
      createdAt: dates.receitas.luisaCreatedAt,
      updatedAt: dates.pedidos.canceladoClosedAt,
    },
  ];

  const receitaLinhas = [
    {
      id: DEMO_IDS.receitaLinhas.ana,
      receitaId: DEMO_IDS.receitas.ana,
      medicamentoId: DEMO_MEDICAMENTOS.atorvastatina.id,
      nome: DEMO_MEDICAMENTOS.atorvastatina.nome,
      quantidade: 6,
      quantidadeDispensada: 0,
      validade: dates.receitas.anaValidade,
      status: "ATIVA",
      createdAt: dates.receitas.anaCreatedAt,
      updatedAt: dates.receitas.anaCreatedAt,
    },
    {
      id: DEMO_IDS.receitaLinhas.manuel,
      receitaId: DEMO_IDS.receitas.manuel,
      medicamentoId: DEMO_MEDICAMENTOS.metformina.id,
      nome: DEMO_MEDICAMENTOS.metformina.nome,
      quantidade: 4,
      quantidadeDispensada: 2,
      validade: dates.receitas.manuelValidade,
      status: "ATIVA",
      createdAt: dates.receitas.manuelCreatedAt,
      updatedAt: dates.pedidos.validadoClosedAt,
    },
    {
      id: DEMO_IDS.receitaLinhas.helena,
      receitaId: DEMO_IDS.receitas.helena,
      medicamentoId: DEMO_MEDICAMENTOS.ramipril.id,
      nome: DEMO_MEDICAMENTOS.ramipril.nome,
      quantidade: 2,
      quantidadeDispensada: 0,
      validade: dates.receitas.helenaValidade,
      status: "ATIVA",
      createdAt: dates.receitas.helenaCreatedAt,
      updatedAt: dates.receitas.helenaCreatedAt,
    },
    {
      id: DEMO_IDS.receitaLinhas.rosa,
      receitaId: DEMO_IDS.receitas.rosa,
      medicamentoId: DEMO_MEDICAMENTOS.amlodipina.id,
      nome: DEMO_MEDICAMENTOS.amlodipina.nome,
      quantidade: 5,
      quantidadeDispensada: 2,
      validade: dates.receitas.rosaValidade,
      status: "ATIVA",
      createdAt: dates.receitas.rosaCreatedAt,
      updatedAt: dates.regularizacoes.parcialUpdatedAt,
    },
    {
      id: DEMO_IDS.receitaLinhas.antonio,
      receitaId: DEMO_IDS.receitas.antonio,
      medicamentoId: DEMO_MEDICAMENTOS.levotiroxina.id,
      nome: DEMO_MEDICAMENTOS.levotiroxina.nome,
      quantidade: 3,
      quantidadeDispensada: 3,
      validade: dates.receitas.antonioValidade,
      status: "ATIVA",
      createdAt: dates.receitas.antonioCreatedAt,
      updatedAt: dates.regularizacoes.totalUpdatedAt,
    },
    {
      id: DEMO_IDS.receitaLinhas.luisa,
      receitaId: DEMO_IDS.receitas.luisa,
      medicamentoId: DEMO_MEDICAMENTOS.omeprazol.id,
      nome: DEMO_MEDICAMENTOS.omeprazol.nome,
      quantidade: 2,
      quantidadeDispensada: 0,
      validade: dates.receitas.luisaValidade,
      status: "EXPIRADA",
      createdAt: dates.receitas.luisaCreatedAt,
      updatedAt: dates.pedidos.canceladoClosedAt,
    },
  ];

  const semReceita = [
    {
      id: DEMO_IDS.semReceita.ana,
      utenteId: DEMO_IDS.utentes.ana,
      medicamento: DEMO_MEDICAMENTOS.paracetamol.nome,
      quantidade: 5,
      createdAt: dates.extras.abertoCreatedAt,
      updatedAt: dates.extras.abertoCreatedAt,
    },
    {
      id: DEMO_IDS.semReceita.manuel,
      utenteId: DEMO_IDS.utentes.manuel,
      medicamento: DEMO_MEDICAMENTOS.ibuprofeno.nome,
      quantidade: 2,
      createdAt: dates.receitas.manuelCreatedAt,
      updatedAt: dates.pedidos.validadoClosedAt,
    },
  ];

  const extras = [
    {
      id: DEMO_IDS.extras.anaAberto,
      utenteId: DEMO_IDS.utentes.ana,
      medicamentoId: DEMO_MEDICAMENTOS.sertralina.id,
      medicamento: DEMO_MEDICAMENTOS.sertralina.nome,
      medicamentoNorm: normalizeText(DEMO_MEDICAMENTOS.sertralina.nome),
      quantidadeSolicitada: 3,
      quantidadeRegularizada: 0,
      quantidadeCancelada: 0,
      status: "PENDENTE",
      createdAt: dates.extras.abertoCreatedAt,
      updatedAt: dates.extras.abertoCreatedAt,
    },
    {
      id: DEMO_IDS.extras.joaquim,
      utenteId: DEMO_IDS.utentes.joaquim,
      medicamentoId: DEMO_MEDICAMENTOS.sertralina.id,
      medicamento: DEMO_MEDICAMENTOS.sertralina.nome,
      medicamentoNorm: normalizeText(DEMO_MEDICAMENTOS.sertralina.nome),
      quantidadeSolicitada: 4,
      quantidadeRegularizada: 0,
      quantidadeCancelada: 0,
      status: "REGULARIZADO",
      createdAt: dates.extras.pendenteCreatedAt,
      updatedAt: dates.pedidos.regularizacaoPendenteClosedAt,
    },
    {
      id: DEMO_IDS.extras.rosa,
      utenteId: DEMO_IDS.utentes.rosa,
      medicamentoId: DEMO_MEDICAMENTOS.amlodipina.id,
      medicamento: DEMO_MEDICAMENTOS.amlodipina.nome,
      medicamentoNorm: normalizeText(DEMO_MEDICAMENTOS.amlodipina.nome),
      quantidadeSolicitada: 6,
      quantidadeRegularizada: 0,
      quantidadeCancelada: 0,
      status: "REGULARIZADO",
      createdAt: dates.extras.parcialCreatedAt,
      updatedAt: dates.pedidos.regularizacaoParcialClosedAt,
    },
    {
      id: DEMO_IDS.extras.antonio,
      utenteId: DEMO_IDS.utentes.antonio,
      medicamentoId: DEMO_MEDICAMENTOS.levotiroxina.id,
      medicamento: DEMO_MEDICAMENTOS.levotiroxina.nome,
      medicamentoNorm: normalizeText(DEMO_MEDICAMENTOS.levotiroxina.nome),
      quantidadeSolicitada: 3,
      quantidadeRegularizada: 0,
      quantidadeCancelada: 0,
      status: "REGULARIZADO",
      createdAt: dates.extras.totalCreatedAt,
      updatedAt: dates.pedidos.regularizacaoTotalClosedAt,
    },
  ];

  const pedidos = [
    {
      id: DEMO_IDS.pedidos.pendente,
      numero: 990001,
      status: "PENDENTE",
      validatedAt: null,
      validatedByRole: null,
      rejectedAt: null,
      rejectedByRole: null,
      canceledByRole: null,
      closedReason: null,
      createdAt: dates.pedidos.pendenteCreatedAt,
      updatedAt: dates.pedidos.pendenteCreatedAt,
    },
    {
      id: DEMO_IDS.pedidos.validado,
      numero: 990002,
      status: "VALIDADO",
      validatedAt: dates.pedidos.validadoClosedAt,
      validatedByRole: "FARMACIA",
      rejectedAt: null,
      rejectedByRole: null,
      canceledByRole: null,
      closedReason: null,
      createdAt: dates.pedidos.validadoCreatedAt,
      updatedAt: dates.pedidos.validadoClosedAt,
    },
    {
      id: DEMO_IDS.pedidos.rejeitado,
      numero: 990003,
      status: "REJEITADO",
      validatedAt: null,
      validatedByRole: null,
      rejectedAt: dates.pedidos.rejeitadoClosedAt,
      rejectedByRole: "FARMACIA",
      canceledByRole: null,
      closedReason: "Pedido rejeitado para demonstração do fluxo de histórico.",
      createdAt: dates.pedidos.rejeitadoCreatedAt,
      updatedAt: dates.pedidos.rejeitadoClosedAt,
    },
    {
      id: DEMO_IDS.pedidos.regularizacaoPendente,
      numero: 990004,
      status: "VALIDADO",
      validatedAt: dates.pedidos.regularizacaoPendenteClosedAt,
      validatedByRole: "FARMACIA",
      rejectedAt: null,
      rejectedByRole: null,
      canceledByRole: null,
      closedReason: null,
      createdAt: dates.pedidos.regularizacaoPendenteCreatedAt,
      updatedAt: dates.pedidos.regularizacaoPendenteClosedAt,
    },
    {
      id: DEMO_IDS.pedidos.regularizacaoParcial,
      numero: 990005,
      status: "VALIDADO",
      validatedAt: dates.pedidos.regularizacaoParcialClosedAt,
      validatedByRole: "FARMACIA",
      rejectedAt: null,
      rejectedByRole: null,
      canceledByRole: null,
      closedReason: null,
      createdAt: dates.pedidos.regularizacaoParcialCreatedAt,
      updatedAt: dates.pedidos.regularizacaoParcialClosedAt,
    },
    {
      id: DEMO_IDS.pedidos.regularizacaoTotal,
      numero: 990006,
      status: "VALIDADO",
      validatedAt: dates.pedidos.regularizacaoTotalClosedAt,
      validatedByRole: "FARMACIA",
      rejectedAt: null,
      rejectedByRole: null,
      canceledByRole: null,
      closedReason: null,
      createdAt: dates.pedidos.regularizacaoTotalCreatedAt,
      updatedAt: dates.pedidos.regularizacaoTotalClosedAt,
    },
    {
      id: DEMO_IDS.pedidos.cancelado,
      numero: 990007,
      status: "CANCELADO",
      validatedAt: null,
      validatedByRole: null,
      rejectedAt: null,
      rejectedByRole: null,
      canceledByRole: null,
      closedReason: "Cancelado automaticamente por expiração da receita.",
      createdAt: dates.pedidos.canceladoCreatedAt,
      updatedAt: dates.pedidos.canceladoClosedAt,
    },
  ];

  const pedidoItens = [
    {
      id: DEMO_IDS.pedidoItens.pendenteReceita,
      pedidoId: DEMO_IDS.pedidos.pendente,
      utenteId: DEMO_IDS.utentes.ana,
      tipo: "COM_RECEITA",
      status: "PENDENTE",
      medicamento: DEMO_MEDICAMENTOS.atorvastatina.nome,
      quantidade: 2,
      receitaLinhaId: DEMO_IDS.receitaLinhas.ana,
      semReceitaId: null,
      extraId: null,
      validatedAt: null,
      validatedByRole: null,
      rejectedAt: null,
      rejectedByRole: null,
      createdAt: dates.pedidos.pendenteCreatedAt,
      updatedAt: dates.pedidos.pendenteCreatedAt,
    },
    {
      id: DEMO_IDS.pedidoItens.pendenteSemReceita,
      pedidoId: DEMO_IDS.pedidos.pendente,
      utenteId: DEMO_IDS.utentes.ana,
      tipo: "SEM_RECEITA",
      status: "PENDENTE",
      medicamento: DEMO_MEDICAMENTOS.paracetamol.nome,
      quantidade: 2,
      receitaLinhaId: null,
      semReceitaId: DEMO_IDS.semReceita.ana,
      extraId: null,
      validatedAt: null,
      validatedByRole: null,
      rejectedAt: null,
      rejectedByRole: null,
      createdAt: dates.pedidos.pendenteCreatedAt,
      updatedAt: dates.pedidos.pendenteCreatedAt,
    },
    {
      id: DEMO_IDS.pedidoItens.validadoReceita,
      pedidoId: DEMO_IDS.pedidos.validado,
      utenteId: DEMO_IDS.utentes.manuel,
      tipo: "COM_RECEITA",
      status: "VALIDADO",
      medicamento: DEMO_MEDICAMENTOS.metformina.nome,
      quantidade: 2,
      receitaLinhaId: DEMO_IDS.receitaLinhas.manuel,
      semReceitaId: null,
      extraId: null,
      validatedAt: dates.pedidos.validadoClosedAt,
      validatedByRole: "FARMACIA",
      rejectedAt: null,
      rejectedByRole: null,
      createdAt: dates.pedidos.validadoCreatedAt,
      updatedAt: dates.pedidos.validadoClosedAt,
    },
    {
      id: DEMO_IDS.pedidoItens.validadoSemReceita,
      pedidoId: DEMO_IDS.pedidos.validado,
      utenteId: DEMO_IDS.utentes.manuel,
      tipo: "SEM_RECEITA",
      status: "VALIDADO",
      medicamento: DEMO_MEDICAMENTOS.ibuprofeno.nome,
      quantidade: 1,
      receitaLinhaId: null,
      semReceitaId: DEMO_IDS.semReceita.manuel,
      extraId: null,
      validatedAt: dates.pedidos.validadoClosedAt,
      validatedByRole: "FARMACIA",
      rejectedAt: null,
      rejectedByRole: null,
      createdAt: dates.pedidos.validadoCreatedAt,
      updatedAt: dates.pedidos.validadoClosedAt,
    },
    {
      id: DEMO_IDS.pedidoItens.rejeitadoReceita,
      pedidoId: DEMO_IDS.pedidos.rejeitado,
      utenteId: DEMO_IDS.utentes.helena,
      tipo: "COM_RECEITA",
      status: "REJEITADO",
      medicamento: DEMO_MEDICAMENTOS.ramipril.nome,
      quantidade: 1,
      receitaLinhaId: DEMO_IDS.receitaLinhas.helena,
      semReceitaId: null,
      extraId: null,
      validatedAt: null,
      validatedByRole: null,
      rejectedAt: dates.pedidos.rejeitadoClosedAt,
      rejectedByRole: "FARMACIA",
      createdAt: dates.pedidos.rejeitadoCreatedAt,
      updatedAt: dates.pedidos.rejeitadoClosedAt,
    },
    {
      id: DEMO_IDS.pedidoItens.regularizacaoPendente,
      pedidoId: DEMO_IDS.pedidos.regularizacaoPendente,
      utenteId: DEMO_IDS.utentes.joaquim,
      tipo: "EXTRA",
      status: "VALIDADO",
      medicamento: DEMO_MEDICAMENTOS.sertralina.nome,
      quantidade: 4,
      receitaLinhaId: null,
      semReceitaId: null,
      extraId: DEMO_IDS.extras.joaquim,
      validatedAt: dates.pedidos.regularizacaoPendenteClosedAt,
      validatedByRole: "FARMACIA",
      rejectedAt: null,
      rejectedByRole: null,
      createdAt: dates.pedidos.regularizacaoPendenteCreatedAt,
      updatedAt: dates.pedidos.regularizacaoPendenteClosedAt,
    },
    {
      id: DEMO_IDS.pedidoItens.regularizacaoParcial,
      pedidoId: DEMO_IDS.pedidos.regularizacaoParcial,
      utenteId: DEMO_IDS.utentes.rosa,
      tipo: "EXTRA",
      status: "VALIDADO",
      medicamento: DEMO_MEDICAMENTOS.amlodipina.nome,
      quantidade: 6,
      receitaLinhaId: null,
      semReceitaId: null,
      extraId: DEMO_IDS.extras.rosa,
      validatedAt: dates.pedidos.regularizacaoParcialClosedAt,
      validatedByRole: "FARMACIA",
      rejectedAt: null,
      rejectedByRole: null,
      createdAt: dates.pedidos.regularizacaoParcialCreatedAt,
      updatedAt: dates.pedidos.regularizacaoParcialClosedAt,
    },
    {
      id: DEMO_IDS.pedidoItens.regularizacaoTotal,
      pedidoId: DEMO_IDS.pedidos.regularizacaoTotal,
      utenteId: DEMO_IDS.utentes.antonio,
      tipo: "EXTRA",
      status: "VALIDADO",
      medicamento: DEMO_MEDICAMENTOS.levotiroxina.nome,
      quantidade: 3,
      receitaLinhaId: null,
      semReceitaId: null,
      extraId: DEMO_IDS.extras.antonio,
      validatedAt: dates.pedidos.regularizacaoTotalClosedAt,
      validatedByRole: "FARMACIA",
      rejectedAt: null,
      rejectedByRole: null,
      createdAt: dates.pedidos.regularizacaoTotalCreatedAt,
      updatedAt: dates.pedidos.regularizacaoTotalClosedAt,
    },
    {
      id: DEMO_IDS.pedidoItens.canceladoReceita,
      pedidoId: DEMO_IDS.pedidos.cancelado,
      utenteId: DEMO_IDS.utentes.luisa,
      tipo: "COM_RECEITA",
      status: "CANCELADO_POR_EXPIRACAO",
      medicamento: DEMO_MEDICAMENTOS.omeprazol.nome,
      quantidade: 2,
      receitaLinhaId: DEMO_IDS.receitaLinhas.luisa,
      semReceitaId: null,
      extraId: null,
      validatedAt: null,
      validatedByRole: null,
      rejectedAt: null,
      rejectedByRole: null,
      createdAt: dates.pedidos.canceladoCreatedAt,
      updatedAt: dates.pedidos.canceladoClosedAt,
    },
  ];

  const dispensas = [
    {
      id: DEMO_IDS.dispensas.manuel,
      receitaLinhaId: DEMO_IDS.receitaLinhas.manuel,
      pedidoItemId: DEMO_IDS.pedidoItens.validadoReceita,
      quantidade: 2,
      createdAt: dates.pedidos.validadoClosedAt,
    },
  ];

  const regularizacoes = [
    {
      id: DEMO_IDS.regularizacoes.pendente,
      utenteId: DEMO_IDS.utentes.joaquim,
      extraId: DEMO_IDS.extras.joaquim,
      pedidoId: DEMO_IDS.pedidos.regularizacaoPendente,
      pedidoNumero: 990004,
      medicamentoId: DEMO_MEDICAMENTOS.sertralina.id,
      medicamento: DEMO_MEDICAMENTOS.sertralina.nome,
      medicamentoNorm: normalizeText(DEMO_MEDICAMENTOS.sertralina.nome),
      quantidadeSolicitada: 4,
      quantidadeRegularizada: 0,
      status: "PENDENTE",
      createdAt: dates.regularizacoes.pendenteCreatedAt,
      updatedAt: dates.regularizacoes.pendenteCreatedAt,
    },
    {
      id: DEMO_IDS.regularizacoes.parcial,
      utenteId: DEMO_IDS.utentes.rosa,
      extraId: DEMO_IDS.extras.rosa,
      pedidoId: DEMO_IDS.pedidos.regularizacaoParcial,
      pedidoNumero: 990005,
      medicamentoId: DEMO_MEDICAMENTOS.amlodipina.id,
      medicamento: DEMO_MEDICAMENTOS.amlodipina.nome,
      medicamentoNorm: normalizeText(DEMO_MEDICAMENTOS.amlodipina.nome),
      quantidadeSolicitada: 6,
      quantidadeRegularizada: 2,
      status: "PARCIALMENTE_REGULARIZADO",
      createdAt: dates.regularizacoes.parcialCreatedAt,
      updatedAt: dates.regularizacoes.parcialUpdatedAt,
    },
    {
      id: DEMO_IDS.regularizacoes.total,
      utenteId: DEMO_IDS.utentes.antonio,
      extraId: DEMO_IDS.extras.antonio,
      pedidoId: DEMO_IDS.pedidos.regularizacaoTotal,
      pedidoNumero: 990006,
      medicamentoId: DEMO_MEDICAMENTOS.levotiroxina.id,
      medicamento: DEMO_MEDICAMENTOS.levotiroxina.nome,
      medicamentoNorm: normalizeText(DEMO_MEDICAMENTOS.levotiroxina.nome),
      quantidadeSolicitada: 3,
      quantidadeRegularizada: 3,
      status: "REGULARIZADO",
      createdAt: dates.regularizacoes.totalCreatedAt,
      updatedAt: dates.regularizacoes.totalUpdatedAt,
    },
  ];

  const regularizacaoEventos = [
    {
      id: DEMO_IDS.regularizacaoEventos.parcial,
      regularizacaoId: DEMO_IDS.regularizacoes.parcial,
      receitaLinhaId: DEMO_IDS.receitaLinhas.rosa,
      quantidade: 2,
      createdAt: dates.regularizacoes.parcialEventoAt,
    },
    {
      id: DEMO_IDS.regularizacaoEventos.total,
      regularizacaoId: DEMO_IDS.regularizacoes.total,
      receitaLinhaId: DEMO_IDS.receitaLinhas.antonio,
      quantidade: 3,
      createdAt: dates.regularizacoes.totalEventoAt,
    },
  ];

  const alertas = [
    {
      id: DEMO_IDS.alertas.pedidoPendente,
      tipo: "PEDIDO_ENVIADO",
      destino: "FARMACIA",
      titulo: "Novo pedido recebido",
      mensagem: "A Santa Casa enviou o pedido #990001 para validação.",
      pedidoId: DEMO_IDS.pedidos.pendente,
      regularizacaoId: null,
      utenteId: null,
      metadata: {
        pedidoNumero: 990001,
      },
      idempotencyKey: `PEDIDO_ENVIADO:${DEMO_IDS.pedidos.pendente}`,
      createdAt: dates.alertas.pedidoPendenteAt,
      updatedAt: dates.alertas.pedidoPendenteAt,
    },
    {
      id: DEMO_IDS.alertas.regularizacaoParcial,
      tipo: "REGULARIZACAO_PARCIAL",
      destino: "FARMACIA",
      titulo: "Regularização parcial efetuada",
      mensagem:
        "Amlodipina 5 mg foi parcialmente regularizado. Pedido #990005.",
      pedidoId: DEMO_IDS.pedidos.regularizacaoParcial,
      regularizacaoId: DEMO_IDS.regularizacoes.parcial,
      utenteId: DEMO_IDS.utentes.rosa,
      metadata: {
        medicamento: DEMO_MEDICAMENTOS.amlodipina.nome,
        pedidoNumero: 990005,
        quantidadeSolicitada: 6,
        quantidadeRegularizada: 2,
        status: "PARCIALMENTE_REGULARIZADO",
      },
      idempotencyKey:
        `REGULARIZACAO_STATUS:${DEMO_IDS.regularizacoes.parcial}:` +
        "PARCIALMENTE_REGULARIZADO",
      createdAt: dates.alertas.regularizacaoParcialAt,
      updatedAt: dates.alertas.regularizacaoParcialAt,
    },
    {
      id: DEMO_IDS.alertas.regularizacaoTotal,
      tipo: "REGULARIZACAO_TOTAL",
      destino: "FARMACIA",
      titulo: "Regularização concluída",
      mensagem:
        "Levotiroxina 50 microgramas foi totalmente regularizado. " +
        "Pedido #990006.",
      pedidoId: DEMO_IDS.pedidos.regularizacaoTotal,
      regularizacaoId: DEMO_IDS.regularizacoes.total,
      utenteId: DEMO_IDS.utentes.antonio,
      metadata: {
        medicamento: DEMO_MEDICAMENTOS.levotiroxina.nome,
        pedidoNumero: 990006,
        quantidadeSolicitada: 3,
        quantidadeRegularizada: 3,
        status: "REGULARIZADO",
      },
      idempotencyKey: `REGULARIZACAO_STATUS:${DEMO_IDS.regularizacoes.total}:REGULARIZADO`,
      createdAt: dates.alertas.regularizacaoTotalAt,
      updatedAt: dates.alertas.regularizacaoTotalAt,
    },
  ];

  return {
    utentes,
    medicamentos,
    medicacoesHabituais,
    receitas,
    receitaLinhas,
    semReceita,
    extras,
    pedidos,
    pedidoItens,
    dispensas,
    regularizacoes,
    regularizacaoEventos,
    alertas,
  };
}

function assertUniqueValues(rows, getValue, label) {
  const values = rows.map(getValue);
  const uniqueValues = new Set(values);

  if (uniqueValues.size !== values.length) {
    throw new Error(`Foram encontrados valores duplicados em ${label}.`);
  }
}

function countByStatus(rows) {
  return rows.reduce((totals, row) => {
    totals[row.status] = (totals[row.status] || 0) + 1;
    return totals;
  }, {});
}

function assertStatusTotals(actual, expected, label) {
  for (const [status, expectedTotal] of Object.entries(expected)) {
    const actualTotal = Number(actual[status] || 0);

    if (actualTotal !== expectedTotal) {
      throw new Error(
        `${label}: estado ${status} esperava ${expectedTotal}, ` +
          `mas encontrou ${actualTotal}.`,
      );
    }
  }
}

function assertReferencesExist(rows, getReference, validIds, label) {
  for (const row of rows) {
    const reference = getReference(row);

    if (reference && !validIds.has(reference)) {
      throw new Error(
        `${label}: referência inexistente "${reference}" no registo "${row.id}".`,
      );
    }
  }
}

function validateDemoDataset(dataset) {
  if (!dataset || typeof dataset !== "object") {
    throw new Error("Dataset demo inválido.");
  }

  assertUniqueValues(dataset.utentes, (row) => row.id, "IDs de utentes");
  assertUniqueValues(
    dataset.utentes,
    (row) => row.numero9,
    "números de utente",
  );

  assertUniqueValues(
    dataset.medicamentos,
    (row) => row.id,
    "IDs de medicamentos",
  );
  assertUniqueValues(
    dataset.medicamentos,
    (row) => row.nome,
    "nomes de medicamentos",
  );

  assertUniqueValues(dataset.receitas, (row) => row.id, "IDs de receitas");
  assertUniqueValues(
    dataset.receitas,
    (row) => row.numero19,
    "números de receita",
  );

  assertUniqueValues(dataset.pedidos, (row) => row.id, "IDs de pedidos");
  assertUniqueValues(dataset.pedidos, (row) => row.numero, "números de pedido");

  assertUniqueValues(
    dataset.pedidoItens,
    (row) => row.id,
    "IDs de itens de pedido",
  );

  assertUniqueValues(
    dataset.regularizacoes,
    (row) => row.id,
    "IDs de regularizações",
  );

  assertUniqueValues(dataset.alertas, (row) => row.id, "IDs de alertas");
  assertUniqueValues(
    dataset.alertas,
    (row) => row.idempotencyKey,
    "chaves de idempotência dos alertas",
  );

  for (const utente of dataset.utentes) {
    if (!/^\d{9}$/.test(utente.numero9)) {
      throw new Error(
        `Número de utente inválido no dataset demo: ${utente.numero9}.`,
      );
    }
  }

  for (const receita of dataset.receitas) {
    if (!/^\d{19}$/.test(receita.numero19)) {
      throw new Error(
        `Número de receita inválido no dataset demo: ${receita.numero19}.`,
      );
    }

    if (!/^\d{6}$/.test(receita.pinAcesso6)) {
      throw new Error(`PIN de acesso inválido na receita ${receita.id}.`);
    }

    if (!/^\d{4}$/.test(receita.pinOpcao4)) {
      throw new Error(`PIN de opção inválido na receita ${receita.id}.`);
    }
  }

  const utenteIds = new Set(dataset.utentes.map((row) => row.id));
  const medicamentoIds = new Set(dataset.medicamentos.map((row) => row.id));
  const receitaIds = new Set(dataset.receitas.map((row) => row.id));
  const receitaLinhaIds = new Set(dataset.receitaLinhas.map((row) => row.id));
  const semReceitaIds = new Set(dataset.semReceita.map((row) => row.id));
  const extraIds = new Set(dataset.extras.map((row) => row.id));
  const pedidoIds = new Set(dataset.pedidos.map((row) => row.id));
  const pedidoItemIds = new Set(dataset.pedidoItens.map((row) => row.id));
  const regularizacaoIds = new Set(dataset.regularizacoes.map((row) => row.id));

  assertReferencesExist(
    dataset.medicacoesHabituais,
    (row) => row.utenteId,
    utenteIds,
    "Medicação habitual",
  );

  assertReferencesExist(
    dataset.receitas,
    (row) => row.utenteId,
    utenteIds,
    "Receitas",
  );

  assertReferencesExist(
    dataset.receitaLinhas,
    (row) => row.receitaId,
    receitaIds,
    "Linhas de receita",
  );

  assertReferencesExist(
    dataset.receitaLinhas,
    (row) => row.medicamentoId,
    medicamentoIds,
    "Medicamentos das linhas de receita",
  );

  assertReferencesExist(
    dataset.semReceita,
    (row) => row.utenteId,
    utenteIds,
    "Medicamentos não sujeitos a receita",
  );

  assertReferencesExist(
    dataset.extras,
    (row) => row.utenteId,
    utenteIds,
    "Vendas Suspensas",
  );

  assertReferencesExist(
    dataset.extras,
    (row) => row.medicamentoId,
    medicamentoIds,
    "Medicamentos das Vendas Suspensas",
  );

  assertReferencesExist(
    dataset.pedidoItens,
    (row) => row.pedidoId,
    pedidoIds,
    "Itens de pedido",
  );

  assertReferencesExist(
    dataset.pedidoItens,
    (row) => row.utenteId,
    utenteIds,
    "Utentes dos itens de pedido",
  );

  assertReferencesExist(
    dataset.pedidoItens,
    (row) => row.receitaLinhaId,
    receitaLinhaIds,
    "Linhas de receita dos itens de pedido",
  );

  assertReferencesExist(
    dataset.pedidoItens,
    (row) => row.semReceitaId,
    semReceitaIds,
    "Medicamentos sem receita dos itens de pedido",
  );

  assertReferencesExist(
    dataset.pedidoItens,
    (row) => row.extraId,
    extraIds,
    "Vendas Suspensas dos itens de pedido",
  );

  assertReferencesExist(
    dataset.dispensas,
    (row) => row.receitaLinhaId,
    receitaLinhaIds,
    "Linhas de receita das dispensas",
  );

  assertReferencesExist(
    dataset.dispensas,
    (row) => row.pedidoItemId,
    pedidoItemIds,
    "Itens de pedido das dispensas",
  );

  assertReferencesExist(
    dataset.regularizacoes,
    (row) => row.utenteId,
    utenteIds,
    "Utentes das regularizações",
  );

  assertReferencesExist(
    dataset.regularizacoes,
    (row) => row.extraId,
    extraIds,
    "Vendas Suspensas das regularizações",
  );

  assertReferencesExist(
    dataset.regularizacoes,
    (row) => row.pedidoId,
    pedidoIds,
    "Pedidos das regularizações",
  );

  assertReferencesExist(
    dataset.regularizacaoEventos,
    (row) => row.regularizacaoId,
    regularizacaoIds,
    "Regularizações dos eventos",
  );

  assertReferencesExist(
    dataset.regularizacaoEventos,
    (row) => row.receitaLinhaId,
    receitaLinhaIds,
    "Linhas de receita dos eventos",
  );

  if (dataset.utentes.length !== DEMO_EXPECTED_TOTALS.utentes) {
    throw new Error(
      `Esperados ${DEMO_EXPECTED_TOTALS.utentes} utentes demo, ` +
        `encontrados ${dataset.utentes.length}.`,
    );
  }

  if (dataset.pedidos.length !== DEMO_EXPECTED_TOTALS.pedidos) {
    throw new Error(
      `Esperados ${DEMO_EXPECTED_TOTALS.pedidos} pedidos demo, ` +
        `encontrados ${dataset.pedidos.length}.`,
    );
  }

  if (dataset.regularizacoes.length !== DEMO_EXPECTED_TOTALS.regularizacoes) {
    throw new Error(
      `Esperadas ${DEMO_EXPECTED_TOTALS.regularizacoes} regularizações demo, ` +
        `encontradas ${dataset.regularizacoes.length}.`,
    );
  }

  assertStatusTotals(
    countByStatus(dataset.utentes),
    DEMO_EXPECTED_TOTALS.utentesByStatus,
    "Utentes demo",
  );

  assertStatusTotals(
    countByStatus(dataset.pedidos),
    DEMO_EXPECTED_TOTALS.pedidosByStatus,
    "Pedidos demo",
  );

  assertStatusTotals(
    countByStatus(dataset.regularizacoes),
    DEMO_EXPECTED_TOTALS.regularizacoesByStatus,
    "Regularizações demo",
  );

  const regularizacaoUnidades = dataset.regularizacaoEventos.reduce(
    (total, evento) => total + Number(evento.quantidade || 0),
    0,
  );

  if (
    dataset.regularizacaoEventos.length !==
    DEMO_EXPECTED_TOTALS.regularizacaoEventos
  ) {
    throw new Error(
      `Esperados ${DEMO_EXPECTED_TOTALS.regularizacaoEventos} eventos ` +
        `de regularização.`,
    );
  }

  if (regularizacaoUnidades !== DEMO_EXPECTED_TOTALS.regularizacaoUnidades) {
    throw new Error(
      `Esperadas ${DEMO_EXPECTED_TOTALS.regularizacaoUnidades} unidades ` +
        `regularizadas, encontradas ${regularizacaoUnidades}.`,
    );
  }

  if (dataset.alertas.length !== DEMO_EXPECTED_TOTALS.alertas) {
    throw new Error(
      `Esperados ${DEMO_EXPECTED_TOTALS.alertas} alertas demo, ` +
        `encontrados ${dataset.alertas.length}.`,
    );
  }

  return dataset;
}

function getDemoIdLists() {
  return {
    utenteIds: Object.values(DEMO_IDS.utentes),
    medicamentoIds: Object.values(DEMO_IDS.medicamentos),
    medicacaoHabitualIds: Object.values(DEMO_IDS.medicacoesHabituais),
    receitaIds: Object.values(DEMO_IDS.receitas),
    receitaLinhaIds: Object.values(DEMO_IDS.receitaLinhas),
    semReceitaIds: Object.values(DEMO_IDS.semReceita),
    extraIds: Object.values(DEMO_IDS.extras),
    pedidoIds: Object.values(DEMO_IDS.pedidos),
    pedidoItemIds: Object.values(DEMO_IDS.pedidoItens),
    dispensaIds: Object.values(DEMO_IDS.dispensas),
    regularizacaoIds: Object.values(DEMO_IDS.regularizacoes),
    regularizacaoEventoIds: Object.values(DEMO_IDS.regularizacaoEventos),
    alertaIds: Object.values(DEMO_IDS.alertas),
  };
}

module.exports = {
  DEMO_EXPECTED_TOTALS,
  DEMO_IDS,
  DEMO_MEDICAMENTOS,

  buildDemoDataset,
  getDemoIdLists,
  validateDemoDataset,
};
