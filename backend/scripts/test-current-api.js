const BASE_URL = process.env.API_BASE || "http://localhost:3001/api";

function logStep(message) {
  console.log(`\n▶ ${message}`);
}

function logOk(message) {
  console.log(`✅ ${message}`);
}

function fail(message, details) {
  console.error(`❌ ${message}`);
  if (details) console.error(details);
  process.exit(1);
}

function assert(condition, message, details) {
  if (!condition) {
    fail(message, details);
  }
}

async function request(method, path, options = {}) {
  const url = `${BASE_URL}${path}`;

  const response = await fetch(url, {
    method,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();

  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  console.log(`${method} ${path} -> ${response.status}`);

  return {
    status: response.status,
    body,
  };
}

async function expectStatus(method, path, expectedStatus, options = {}) {
  const result = await request(method, path, options);

  assert(
    result.status === expectedStatus,
    `Esperava HTTP ${expectedStatus}, recebeu HTTP ${result.status}`,
    result.body,
  );

  return result.body;
}

function makeNumero19(seed) {
  return String(seed).replace(/\D/g, "").padEnd(19, "0").slice(0, 19);
}

function findLinhaByMedicamento(receita, medicamento) {
  return receita?.data?.linhas?.find(
    (linha) => linha.medicamento === medicamento,
  );
}

async function main() {
  const timestamp = Date.now();

  const numero9 = String(Math.floor(100000000 + Math.random() * 900000000));
  const nome = `Teste Automatizado ${timestamp}`;
  const numero19 = makeNumero19(timestamp);
  const numero19Regularizacao = makeNumero19(timestamp + 7);

  let utenteId = null;
  let semReceitaId = null;
  let linhaReceitaId = null;
  let secondLinhaReceitaId = null;
  let linhaRegularizacaoId = null;
  let extraId = null;
  let pedidoId = null;
  let regularizacaoId = null;

  logStep("Health checks");

  const health = await expectStatus("GET", "/health", 200);
  assert(health.status === "ok", "Health geral inválido", health);
  logOk("GET /api/health");

  const santacasaHealth = await expectStatus("GET", "/santacasa/health", 200);
  assert(
    santacasaHealth.status === "ok",
    "Health Santa Casa inválido",
    santacasaHealth,
  );
  logOk("GET /api/santacasa/health");

  const farmaciaHealth = await expectStatus("GET", "/farmacia/health", 200);
  assert(
    farmaciaHealth.status === "ok",
    "Health Farmácia inválido",
    farmaciaHealth,
  );
  logOk("GET /api/farmacia/health");

  logStep("Criar utente");

  const createdUtente = await expectStatus("POST", "/santacasa/utentes", 201, {
    body: { numero9, nome },
  });

  utenteId = createdUtente?.data?.id;

  assert(
    utenteId,
    "O backend não devolveu data.id ao criar utente",
    createdUtente,
  );

  logOk(`Utente criado: ${utenteId}`);

  logStep("Criar medicamento sem receita");

  const createdSemReceita = await expectStatus(
    "POST",
    `/santacasa/utentes/${utenteId}/sem-receita`,
    201,
    {
      body: {
        medicamento: "Ben-u-ron",
        quantidade: 2,
      },
    },
  );

  semReceitaId = createdSemReceita?.data?.id;

  assert(semReceitaId, "Sem Receita não devolveu data.id", createdSemReceita);
  logOk(`Sem Receita criado: ${semReceitaId}`);

  logStep("Criar receita com linhas");

  const createdReceita = await expectStatus(
    "POST",
    `/santacasa/utentes/${utenteId}/receitas`,
    201,
    {
      body: {
        numero19,
        pinAcesso6: "123456",
        pinOpcao4: "1234",
        linhas: [
          {
            medicamento: "Paracetamol 1000mg",
            quantidade: 2,
            validade: "2027-12-31",
          },
          {
            medicamento: "Ibuprofeno 400mg",
            quantidade: 1,
            validade: "2027-10-31",
          },
        ],
      },
    },
  );

  const linhaParacetamol = findLinhaByMedicamento(
    createdReceita,
    "Paracetamol 1000mg",
  );

  const linhaIbuprofeno = findLinhaByMedicamento(
    createdReceita,
    "Ibuprofeno 400mg",
  );

  linhaReceitaId = linhaParacetamol?.linhaId;
  secondLinhaReceitaId = linhaIbuprofeno?.linhaId;

  assert(
    linhaReceitaId,
    "Receita não devolveu linha do Paracetamol",
    createdReceita,
  );

  assert(
    secondLinhaReceitaId,
    "Receita não devolveu linha do Ibuprofeno",
    createdReceita,
  );

  logOk(`Receita criada. Linha teste: ${linhaReceitaId}`);

  logStep("Criar Extra");

  const createdExtra = await expectStatus(
    "POST",
    `/santacasa/utentes/${utenteId}/extras`,
    201,
    {
      body: {
        medicamento: "Medicamento Extra Teste",
        quantidadeSolicitada: 3,
      },
    },
  );

  extraId = createdExtra?.data?.id;

  assert(extraId, "Extra não devolveu data.id", createdExtra);
  logOk(`Extra criado: ${extraId}`);

  logStep("Criar pedido com receita, sem receita e extra");

  const createdPedido = await expectStatus("POST", "/santacasa/pedidos", 201, {
    body: {
      items: [
        {
          utenteId,
          tipo: "COM_RECEITA",
          id: linhaReceitaId,
          quantidade: 1,
        },
        {
          utenteId,
          tipo: "SEM_RECEITA",
          id: semReceitaId,
          quantidade: 1,
        },
        {
          utenteId,
          tipo: "EXTRA",
          id: extraId,
          quantidade: 1,
        },
      ],
    },
  });

  pedidoId = createdPedido?.data?.id;

  assert(pedidoId, "Pedido não devolveu data.id", createdPedido);
  assert(
    createdPedido.data.status === "PENDENTE",
    "Pedido devia estar PENDENTE",
    createdPedido,
  );
  assert(
    createdPedido.data.itens.length === 3,
    "Pedido devia ter 3 itens",
    createdPedido,
  );

  logOk(`Pedido criado: ${pedidoId}`);

  logStep("Listar pedidos pendentes na Farmácia");

  const pedidosPendentes = await expectStatus("GET", "/farmacia/pedidos", 200);

  assert(
    pedidosPendentes.data.some((pedido) => pedido.id === pedidoId),
    "Pedido pendente não apareceu na Farmácia",
    pedidosPendentes,
  );

  logOk("Pedido aparece na listagem da Farmácia");

  logStep("Validar pedido na Farmácia");

  const validatedPedido = await expectStatus(
    "POST",
    `/farmacia/pedidos/${pedidoId}/validar`,
    200,
  );

  assert(
    validatedPedido.data.status === "VALIDADO",
    "Pedido devia ficar VALIDADO",
    validatedPedido,
  );

  assert(
    validatedPedido.data.itens.every((item) => item.status === "VALIDADO"),
    "Todos os itens deviam ficar VALIDADO",
    validatedPedido,
  );

  logOk("Pedido validado com sucesso");

  logStep("Confirmar regularização pendente criada pelo Extra");

  const pendentesAntes = await expectStatus(
    "GET",
    `/farmacia/regularizacoes/pendentes?utenteId=${utenteId}`,
    200,
  );

  const regPendente = pendentesAntes.data.find(
    (reg) => reg.extraId === extraId,
  );

  assert(
    regPendente,
    "Regularização pendente do Extra não apareceu",
    pendentesAntes,
  );

  assert(
    regPendente.quantidadeRestante === 1,
    "Regularização pendente devia ter quantidadeRestante 1",
    regPendente,
  );

  regularizacaoId = regPendente.id;

  logOk(`Regularização pendente criada: ${regularizacaoId}`);

  logStep("Criar nova receita compatível para auto-regularizar Extra");

  const receitaRegularizacao = await expectStatus(
    "POST",
    `/santacasa/utentes/${utenteId}/receitas`,
    201,
    {
      body: {
        numero19: numero19Regularizacao,
        pinAcesso6: "654321",
        pinOpcao4: "4321",
        linhas: [
          {
            medicamento: "Medicamento Extra Teste",
            quantidade: 1,
            validade: "2028-12-31",
          },
        ],
      },
    },
  );

  linhaRegularizacaoId = receitaRegularizacao?.data?.linhas?.[0]?.linhaId;

  assert(
    linhaRegularizacaoId,
    "Receita de regularização não devolveu linhaId",
    receitaRegularizacao,
  );

  assert(
    receitaRegularizacao.data.linhas[0].quantidadeDispensada === 1,
    "Linha criada para regularização devia ficar com quantidadeDispensada 1",
    receitaRegularizacao,
  );

  assert(
    receitaRegularizacao.data.linhas[0].quantidadeRestante === 0,
    "Linha criada para regularização devia ficar sem quantidadeRestante",
    receitaRegularizacao,
  );

  logOk("Nova receita regularizou automaticamente o Extra");

  logStep("Confirmar que regularização saiu dos pendentes");

  const pendentesDepois = await expectStatus(
    "GET",
    `/farmacia/regularizacoes/pendentes?utenteId=${utenteId}`,
    200,
  );

  assert(
    !pendentesDepois.data.some((reg) => reg.id === regularizacaoId),
    "Regularização ainda aparece nos pendentes depois da auto-regularização",
    pendentesDepois,
  );

  logOk("Regularização deixou de estar pendente");

  logStep("Confirmar histórico de regularizações");

  const historicoRegularizacoes = await expectStatus(
    "GET",
    `/farmacia/regularizacoes/historico?utenteId=${utenteId}`,
    200,
  );

  const regHistorico = historicoRegularizacoes.data.find(
    (reg) => reg.id === regularizacaoId,
  );

  assert(
    regHistorico,
    "Regularização regularizada não apareceu no histórico",
    historicoRegularizacoes,
  );

  assert(
    regHistorico.status === "REGULARIZADO",
    "Regularização no histórico devia estar REGULARIZADO",
    regHistorico,
  );

  assert(
    regHistorico.eventos.length === 1,
    "Regularização devia ter 1 evento",
    regHistorico,
  );

  assert(
    regHistorico.eventos[0].quantidade === 1,
    "Evento de regularização devia ter quantidade 1",
    regHistorico,
  );

  logOk("Histórico de regularizações correto");

  logStep("Confirmar sinal de regularizações");

  const sinalRegularizacoes = await expectStatus(
    "GET",
    "/farmacia/regularizacoes/sinal",
    200,
  );

  assert(
    sinalRegularizacoes.totalEventos >= 1,
    "Sinal devia ter pelo menos 1 evento",
    sinalRegularizacoes,
  );

  assert(
    sinalRegularizacoes.totalUnidades >= 1,
    "Sinal devia ter pelo menos 1 unidade",
    sinalRegularizacoes,
  );

  logOk("Sinal de regularizações correto");

  logStep("Confirmar efeitos na receita original");

  const receitasAfterValidation = await expectStatus(
    "GET",
    `/santacasa/utentes/${utenteId}/receitas`,
    200,
  );

  const linhaAfterValidation = receitasAfterValidation.data.find(
    (linha) => linha.linhaId === linhaReceitaId,
  );

  assert(
    linhaAfterValidation,
    "Linha de receita validada devia continuar na listagem",
    receitasAfterValidation,
  );

  assert(
    linhaAfterValidation.quantidadeDispensada === 1,
    "quantidadeDispensada da receita devia ser 1",
    linhaAfterValidation,
  );

  assert(
    linhaAfterValidation.quantidadeRestante === 1,
    "quantidadeRestante da receita devia ser 1",
    linhaAfterValidation,
  );

  logOk("Receita original foi debitada corretamente");

  logStep("Confirmar efeitos em Sem Receita");

  const semReceitaAfterValidation = await expectStatus(
    "GET",
    `/santacasa/utentes/${utenteId}/sem-receita`,
    200,
  );

  const semReceitaAfter = semReceitaAfterValidation.data.find(
    (item) => item.id === semReceitaId,
  );

  assert(
    semReceitaAfter,
    "Sem Receita devia continuar com saldo restante",
    semReceitaAfterValidation,
  );

  assert(
    semReceitaAfter.quantidadeRestante === 1,
    "Sem Receita devia ter quantidadeRestante 1",
    semReceitaAfter,
  );

  logOk("Sem Receita foi debitado corretamente");

  logStep("Confirmar efeitos em Extra");

  const extrasAfterValidation = await expectStatus(
    "GET",
    `/santacasa/utentes/${utenteId}/extras`,
    200,
  );

  const extraAfter = extrasAfterValidation.data.find(
    (extra) => extra.id === extraId,
  );

  assert(
    extraAfter,
    "Extra devia continuar com saldo restante",
    extrasAfterValidation,
  );

  assert(
    extraAfter.quantidadeRestante === 2,
    "Extra devia ter quantidadeRestante 2",
    extraAfter,
  );

  logOk("Extra mantém saldo restante correto");

  logStep("Bloquear remoção de linha já associada a pedido/dispensa");

  const deleteLinhaWithHistory = await request(
    "DELETE",
    `/santacasa/utentes/${utenteId}/receitas/linhas/${linhaReceitaId}`,
  );

  assert(
    deleteLinhaWithHistory.status === 409,
    "Remover linha associada a pedido/dispensa devia devolver 409",
    deleteLinhaWithHistory.body,
  );

  logOk("Remoção de linha com histórico bloqueada");

  logStep("Bloquear remoção de sem-receita associado a pedido");

  const deleteSemReceitaWithHistory = await request(
    "DELETE",
    `/santacasa/utentes/${utenteId}/sem-receita/${semReceitaId}`,
  );

  assert(
    deleteSemReceitaWithHistory.status === 409,
    "Remover sem-receita associado a pedido devia devolver 409",
    deleteSemReceitaWithHistory.body,
  );

  logOk("Remoção de sem-receita com histórico bloqueada");

  logStep("Bloquear remoção de Extra associado a pedido");

  const deleteExtraWithHistory = await request(
    "DELETE",
    `/santacasa/utentes/${utenteId}/extras/${extraId}`,
  );

  assert(
    deleteExtraWithHistory.status === 409,
    "Remover Extra associado a pedido devia devolver 409",
    deleteExtraWithHistory.body,
  );

  logOk("Remoção de Extra com histórico bloqueada");

  logStep("Bloquear remoção de utente com Extra em aberto");

  const deleteUtenteWithOpenExtra = await request(
    "DELETE",
    `/santacasa/utentes/${utenteId}`,
  );

  assert(
    deleteUtenteWithOpenExtra.status === 409,
    "Remover utente com Extra em aberto devia devolver 409",
    deleteUtenteWithOpenExtra.body,
  );

  logOk("Remoção de utente com pendências bloqueada");

  logStep("Criar pedido simples para rejeição");

  const pedidoRejeicao = await expectStatus("POST", "/santacasa/pedidos", 201, {
    body: {
      items: [
        {
          utenteId,
          tipo: "COM_RECEITA",
          id: secondLinhaReceitaId,
          quantidade: 1,
        },
      ],
    },
  });

  const pedidoRejeicaoId = pedidoRejeicao?.data?.id;

  assert(
    pedidoRejeicaoId,
    "Pedido de rejeição não devolveu data.id",
    pedidoRejeicao,
  );

  logOk(`Pedido para rejeição criado: ${pedidoRejeicaoId}`);

  logStep("Rejeitar pedido na Farmácia");

  const rejectedPedido = await expectStatus(
    "POST",
    `/farmacia/pedidos/${pedidoRejeicaoId}/rejeitar`,
    200,
    {
      body: {
        motivo: "Teste automático de rejeição",
      },
    },
  );

  assert(
    rejectedPedido.data.status === "REJEITADO",
    "Pedido devia ficar REJEITADO",
    rejectedPedido,
  );

  assert(
    rejectedPedido.data.closedReason === "Teste automático de rejeição",
    "Motivo de rejeição não foi guardado corretamente",
    rejectedPedido,
  );

  logOk("Pedido rejeitado corretamente");

  logStep("Consultar histórico de pedidos");

  const historicoPedidos = await expectStatus(
    "GET",
    `/santacasa/pedidos/historico?search=${encodeURIComponent(nome)}`,
    200,
  );

  assert(
    Array.isArray(historicoPedidos.rows),
    "Histórico de pedidos devia devolver rows",
    historicoPedidos,
  );

  assert(
    historicoPedidos.rows.some((pedido) => pedido.id === pedidoId),
    "Pedido validado não apareceu no histórico",
    historicoPedidos,
  );

  assert(
    historicoPedidos.rows.some((pedido) => pedido.id === pedidoRejeicaoId),
    "Pedido rejeitado não apareceu no histórico",
    historicoPedidos,
  );

  logOk("Histórico de pedidos inclui validado e rejeitado");

  logStep("Consultar histórico filtrado por VALIDADO");

  const historicoValidados = await expectStatus(
    "GET",
    `/santacasa/pedidos/historico?status=VALIDADO&search=${encodeURIComponent(nome)}`,
    200,
  );

  assert(
    historicoValidados.rows.some((pedido) => pedido.id === pedidoId),
    "Pedido validado não apareceu no histórico VALIDADO",
    historicoValidados,
  );

  assert(
    !historicoValidados.rows.some((pedido) => pedido.id === pedidoRejeicaoId),
    "Pedido rejeitado não devia aparecer no histórico VALIDADO",
    historicoValidados,
  );

  logOk("Filtro VALIDADO funciona");

  logStep("Consultar histórico filtrado por REJEITADO");

  const historicoRejeitados = await expectStatus(
    "GET",
    `/santacasa/pedidos/historico?status=REJEITADO&search=${encodeURIComponent(nome)}`,
    200,
  );

  assert(
    historicoRejeitados.rows.some((pedido) => pedido.id === pedidoRejeicaoId),
    "Pedido rejeitado não apareceu no histórico REJEITADO",
    historicoRejeitados,
  );

  logOk("Filtro REJEITADO funciona");

  logStep("Consultar sinais/dashboard da Farmácia");

  const dashboard = await expectStatus(
    "GET",
    "/farmacia/dashboard/sinais",
    200,
  );

  assert(
    dashboard.pedidos.validados >= 1,
    "Dashboard devia ter pelo menos 1 pedido validado",
    dashboard,
  );

  assert(
    dashboard.pedidos.rejeitados >= 1,
    "Dashboard devia ter pelo menos 1 pedido rejeitado",
    dashboard,
  );

  assert(
    dashboard.regularizacoes.totalEventos >= 1,
    "Dashboard devia ter eventos de regularização",
    dashboard,
  );

  logOk("Dashboard da Farmácia devolve sinais corretos");

  console.log("\n✅ TODOS OS TESTES PASSARAM");
  console.log("\nResumo:");
  console.log({
    utenteId,
    semReceitaId,
    linhaReceitaId,
    secondLinhaReceitaId,
    linhaRegularizacaoId,
    extraId,
    pedidoId,
    regularizacaoId,
    numero9,
    numero19,
    numero19Regularizacao,
    nome,
  });
}

main().catch((error) => {
  fail("Erro inesperado durante os testes", {
    message: error.message,
    stack: error.stack,
  });
});
