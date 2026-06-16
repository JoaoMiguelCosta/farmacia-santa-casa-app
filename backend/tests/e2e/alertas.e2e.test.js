// backend/tests/e2e/alertas.e2e.test.js
const request = require("supertest");

const { getTestApp } = require("../helpers/app");
const {
  createAdminAgent,
  createFarmaciaAgent,
  createSantaCasaAgent,
} = require("../helpers/auth");
const { createUniqueUtentePayload } = require("../fixtures/utentes.fixture");

let numero19Counter = 0;

function createUniqueMedicamento(prefix = "Medicamento Alerta E2E") {
  const timestamp = Date.now();
  const random = Math.floor(1000 + Math.random() * 9000);

  return `${prefix} ${timestamp} ${random}`;
}

function makeNumero19(seed = Date.now()) {
  numero19Counter += 1;

  const timestampPart = String(seed).replace(/\D/g, "").slice(-13);
  const randomPart = String(Math.floor(10000 + Math.random() * 90000));
  const counterPart = String(numero19Counter).padStart(2, "0");

  return `${timestampPart}${randomPart}${counterPart}`
    .padEnd(19, "0")
    .slice(0, 19);
}

function createFutureDate(year = 2099) {
  return `${year}-12-31`;
}

async function createUtente(agent, prefix = "Utente Alerta E2E") {
  const payload = createUniqueUtentePayload(prefix);

  const response = await agent
    .post("/api/santacasa/utentes")
    .send(payload)
    .expect(201);

  return response.body.data;
}

async function createSemReceita(agent, utenteId, payload = {}) {
  const response = await agent
    .post(`/api/santacasa/utentes/${utenteId}/sem-receita`)
    .send({
      medicamento: payload.medicamento || createUniqueMedicamento(),
      quantidade: payload.quantidade || 2,
    })
    .expect(201);

  return response.body.data;
}

async function createExtra(agent, utenteId, payload = {}) {
  const response = await agent
    .post(`/api/santacasa/utentes/${utenteId}/extras`)
    .send({
      medicamento: payload.medicamento || createUniqueMedicamento(),
      quantidadeSolicitada: payload.quantidadeSolicitada || 1,
    })
    .expect(201);

  return response.body.data;
}

async function createReceita(agent, utenteId, payload = {}) {
  const response = await agent
    .post(`/api/santacasa/utentes/${utenteId}/receitas`)
    .send({
      numero19: payload.numero19 || makeNumero19(),
      pinAcesso6: payload.pinAcesso6 || "123456",
      pinOpcao4: payload.pinOpcao4 || "1234",
      confirmRegularizacao: payload.confirmRegularizacao,
      linhas: payload.linhas || [
        {
          medicamento: payload.medicamento || createUniqueMedicamento(),
          quantidade: payload.quantidade || 1,
          validade: payload.validade || createFutureDate(),
        },
      ],
    })
    .expect(201);

  return response.body.data;
}

async function createPedido(agent, items) {
  const response = await agent
    .post("/api/santacasa/pedidos")
    .send({ items })
    .expect(201);

  return response.body.data;
}

async function validatePedido(agent, pedidoId) {
  const response = await agent
    .post(`/api/farmacia/pedidos/${pedidoId}/validar`)
    .expect(200);

  return response.body.data;
}

async function createPedidoComSemReceita(santaCasaAgent) {
  const utente = await createUtente(santaCasaAgent);
  const semReceita = await createSemReceita(santaCasaAgent, utente.id);

  const pedido = await createPedido(santaCasaAgent, [
    {
      utenteId: utente.id,
      tipo: "SEM_RECEITA",
      id: semReceita.id,
      quantidade: 1,
    },
  ]);

  return {
    utente,
    semReceita,
    pedido,
  };
}

async function createRegularizacaoScenario({
  santaCasaAgent,
  farmaciaAgent,
  prefix,
  quantidadeSolicitada,
  quantidadeReceita,
}) {
  const utente = await createUtente(santaCasaAgent, prefix);
  const medicamento = createUniqueMedicamento(prefix);

  const extra = await createExtra(santaCasaAgent, utente.id, {
    medicamento,
    quantidadeSolicitada,
  });

  const pedido = await createPedido(santaCasaAgent, [
    {
      utenteId: utente.id,
      tipo: "EXTRA",
      id: extra.id,
      quantidade: quantidadeSolicitada,
    },
  ]);

  await validatePedido(farmaciaAgent, pedido.id);

  const receita = await createReceita(santaCasaAgent, utente.id, {
    medicamento,
    quantidade: quantidadeReceita,
    confirmRegularizacao: true,
  });

  return {
    utente,
    medicamento,
    extra,
    pedido,
    receita,
  };
}

function findPedidoAlerta(alertas = [], pedidoId) {
  return alertas.find((alerta) => {
    return alerta.tipo === "PEDIDO_ENVIADO" && alerta.pedidoId === pedidoId;
  });
}

function findRegularizacaoAlerta({
  alertas = [],
  tipo,
  pedidoId,
  utenteId,
  medicamento,
}) {
  return alertas.find((alerta) => {
    return (
      alerta.tipo === tipo &&
      alerta.pedidoId === pedidoId &&
      alerta.utenteId === utenteId &&
      alerta.metadata?.medicamento === medicamento
    );
  });
}

describe("Alertas Farmácia E2E", () => {
  const app = getTestApp();

  describe("Permissões", () => {
    it("deve bloquear acesso sem sessão", async () => {
      const response = await request(app)
        .get("/api/farmacia/alertas")
        .expect(401);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "UNAUTHORIZED",
        }),
      );
    });

    it("deve bloquear SANTACASA nos alertas da Farmácia", async () => {
      const agent = await createSantaCasaAgent(app);

      const response = await agent.get("/api/farmacia/alertas").expect(403);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "FORBIDDEN",
          message: "Sem permissão para aceder a este recurso.",
        }),
      );
    });

    it("deve permitir FARMACIA listar alertas", async () => {
      const agent = await createFarmaciaAgent(app);

      const response = await agent.get("/api/farmacia/alertas").expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          data: expect.any(Array),
        }),
      );
    });

    it("deve permitir ADMIN listar alertas da Farmácia", async () => {
      const agent = await createAdminAgent(app);

      const response = await agent.get("/api/farmacia/alertas").expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          data: expect.any(Array),
        }),
      );
    });
  });

  describe("Alertas de pedidos", () => {
    it("deve criar alerta quando a Santa Casa envia um pedido", async () => {
      const santaCasaAgent = await createSantaCasaAgent(app);
      const farmaciaAgent = await createFarmaciaAgent(app);

      const { pedido } = await createPedidoComSemReceita(santaCasaAgent);

      const response = await farmaciaAgent
        .get("/api/farmacia/alertas")
        .expect(200);

      const alerta = findPedidoAlerta(response.body.data, pedido.id);

      expect(alerta).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          tipo: "PEDIDO_ENVIADO",
          destino: "FARMACIA",
          titulo: "Novo pedido recebido",
          pedidoId: pedido.id,
          regularizacaoId: null,
          utenteId: null,
          metadata: expect.objectContaining({
            pedidoNumero: pedido.numero,
          }),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      );

      expect(alerta.mensagem).toContain(`pedido #${pedido.numero}`);
    });

    it("deve fechar um alerta individual para o utilizador atual", async () => {
      const santaCasaAgent = await createSantaCasaAgent(app);
      const farmaciaAgent = await createFarmaciaAgent(app);

      const { pedido } = await createPedidoComSemReceita(santaCasaAgent);

      const beforeDismissResponse = await farmaciaAgent
        .get("/api/farmacia/alertas")
        .expect(200);

      const alerta = findPedidoAlerta(
        beforeDismissResponse.body.data,
        pedido.id,
      );

      expect(alerta).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          pedidoId: pedido.id,
        }),
      );

      const dismissResponse = await farmaciaAgent
        .post(`/api/farmacia/alertas/${alerta.id}/dismiss`)
        .expect(200);

      expect(dismissResponse.body.data).toEqual(
        expect.objectContaining({
          dismissed: true,
          alerta: expect.objectContaining({
            id: alerta.id,
            pedidoId: pedido.id,
            tipo: "PEDIDO_ENVIADO",
          }),
        }),
      );

      const afterDismissResponse = await farmaciaAgent
        .get("/api/farmacia/alertas")
        .expect(200);

      expect(findPedidoAlerta(afterDismissResponse.body.data, pedido.id)).toBe(
        undefined,
      );
    });

    it("deve devolver 404 ao tentar fechar alerta inexistente", async () => {
      const farmaciaAgent = await createFarmaciaAgent(app);

      const response = await farmaciaAgent
        .post("/api/farmacia/alertas/alerta-inexistente/dismiss")
        .expect(404);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "NOT_FOUND",
          message: "Alerta não encontrado.",
        }),
      );
    });

    it("deve fechar todos os alertas ativos do utilizador atual", async () => {
      const santaCasaAgent = await createSantaCasaAgent(app);
      const farmaciaAgent = await createFarmaciaAgent(app);

      const first = await createPedidoComSemReceita(santaCasaAgent);
      const second = await createPedidoComSemReceita(santaCasaAgent);

      const beforeDismissResponse = await farmaciaAgent
        .get("/api/farmacia/alertas")
        .expect(200);

      expect(
        findPedidoAlerta(beforeDismissResponse.body.data, first.pedido.id),
      ).toEqual(
        expect.objectContaining({
          pedidoId: first.pedido.id,
        }),
      );

      expect(
        findPedidoAlerta(beforeDismissResponse.body.data, second.pedido.id),
      ).toEqual(
        expect.objectContaining({
          pedidoId: second.pedido.id,
        }),
      );

      const dismissAllResponse = await farmaciaAgent
        .post("/api/farmacia/alertas/dismiss-all")
        .expect(200);

      expect(dismissAllResponse.body.data).toEqual(
        expect.objectContaining({
          dismissed: expect.any(Number),
        }),
      );

      expect(dismissAllResponse.body.data.dismissed).toBeGreaterThanOrEqual(2);

      const afterDismissResponse = await farmaciaAgent
        .get("/api/farmacia/alertas")
        .expect(200);

      expect(
        findPedidoAlerta(afterDismissResponse.body.data, first.pedido.id),
      ).toBe(undefined);

      expect(
        findPedidoAlerta(afterDismissResponse.body.data, second.pedido.id),
      ).toBe(undefined);
    });
  });

  describe("Alertas de regularizações", () => {
    it("deve criar alerta quando uma regularização fica totalmente concluída", async () => {
      const santaCasaAgent = await createSantaCasaAgent(app);
      const farmaciaAgent = await createFarmaciaAgent(app);

      const scenario = await createRegularizacaoScenario({
        santaCasaAgent,
        farmaciaAgent,
        prefix: "Alerta Regularização Total E2E",
        quantidadeSolicitada: 1,
        quantidadeReceita: 1,
      });

      const response = await farmaciaAgent
        .get("/api/farmacia/alertas")
        .expect(200);

      const alerta = findRegularizacaoAlerta({
        alertas: response.body.data,
        tipo: "REGULARIZACAO_TOTAL",
        pedidoId: scenario.pedido.id,
        utenteId: scenario.utente.id,
        medicamento: scenario.medicamento,
      });

      expect(alerta).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          tipo: "REGULARIZACAO_TOTAL",
          destino: "FARMACIA",
          titulo: "Regularização concluída",
          pedidoId: scenario.pedido.id,
          regularizacaoId: expect.any(String),
          utenteId: scenario.utente.id,
          metadata: expect.objectContaining({
            medicamento: scenario.medicamento,
            pedidoNumero: scenario.pedido.numero,
            quantidadeSolicitada: 1,
            quantidadeRegularizada: 1,
            status: "REGULARIZADO",
          }),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      );

      expect(alerta.mensagem).toContain(scenario.medicamento);
      expect(alerta.mensagem).toContain("totalmente regularizado");
      expect(alerta.mensagem).toContain(`Pedido #${scenario.pedido.numero}`);
    });

    it("deve criar alerta quando uma regularização fica parcialmente regularizada", async () => {
      const santaCasaAgent = await createSantaCasaAgent(app);
      const farmaciaAgent = await createFarmaciaAgent(app);

      const scenario = await createRegularizacaoScenario({
        santaCasaAgent,
        farmaciaAgent,
        prefix: "Alerta Regularização Parcial E2E",
        quantidadeSolicitada: 2,
        quantidadeReceita: 1,
      });

      const response = await farmaciaAgent
        .get("/api/farmacia/alertas")
        .expect(200);

      const alerta = findRegularizacaoAlerta({
        alertas: response.body.data,
        tipo: "REGULARIZACAO_PARCIAL",
        pedidoId: scenario.pedido.id,
        utenteId: scenario.utente.id,
        medicamento: scenario.medicamento,
      });

      expect(alerta).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          tipo: "REGULARIZACAO_PARCIAL",
          destino: "FARMACIA",
          titulo: "Regularização parcial efetuada",
          pedidoId: scenario.pedido.id,
          regularizacaoId: expect.any(String),
          utenteId: scenario.utente.id,
          metadata: expect.objectContaining({
            medicamento: scenario.medicamento,
            pedidoNumero: scenario.pedido.numero,
            quantidadeSolicitada: 2,
            quantidadeRegularizada: 1,
            status: "PARCIALMENTE_REGULARIZADO",
          }),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      );

      expect(alerta.mensagem).toContain(scenario.medicamento);
      expect(alerta.mensagem).toContain("parcialmente regularizado");
      expect(alerta.mensagem).toContain(`Pedido #${scenario.pedido.numero}`);
    });
  });
});
