// backend/tests/e2e/regularizacoes.e2e.test.js
const request = require("supertest");

const { getTestApp } = require("../helpers/app");
const {
  createFarmaciaAgent,
  createSantaCasaAgent,
} = require("../helpers/auth");
const { createUniqueUtentePayload } = require("../fixtures/utentes.fixture");

let numero19Counter = 0;

function createUniqueMedicamento(prefix = "Medicamento Regularização E2E") {
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

function createTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function createUtente(agent, prefix = "Utente Regularização E2E") {
  const payload = createUniqueUtentePayload(prefix);

  const response = await agent
    .post("/api/santacasa/utentes")
    .send(payload)
    .expect(201);

  return response.body.data;
}

async function deleteUtente(agent, utenteId) {
  if (!utenteId) return;

  try {
    await agent.delete(`/api/santacasa/utentes/${utenteId}`);
  } catch {
    // Cleanup best-effort.
  }
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

async function createPedido(agent, items) {
  const response = await agent
    .post("/api/santacasa/pedidos")
    .send({ items })
    .expect(201);

  return response.body.data;
}

async function validatePedido(farmaciaAgent, pedidoId) {
  const response = await farmaciaAgent
    .post(`/api/farmacia/pedidos/${pedidoId}/validar`)
    .expect(200);

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

async function createPendingRegularizacao({
  santaCasaAgent,
  farmaciaAgent,
  utente,
  medicamento,
  quantidade = 1,
}) {
  const extra = await createExtra(santaCasaAgent, utente.id, {
    medicamento,
    quantidadeSolicitada: quantidade,
  });

  const pedido = await createPedido(santaCasaAgent, [
    {
      utenteId: utente.id,
      tipo: "EXTRA",
      id: extra.id,
      quantidade,
    },
  ]);

  await validatePedido(farmaciaAgent, pedido.id);

  return {
    extra,
    pedido,
  };
}

function findRegularizacaoByPedido(data = [], pedidoId) {
  return data.find((regularizacao) => {
    return regularizacao.pedidoId === pedidoId;
  });
}

describe("Regularizações E2E", () => {
  const app = getTestApp();

  describe("Permissões", () => {
    it("deve bloquear acesso sem sessão", async () => {
      const response = await request(app)
        .get("/api/farmacia/regularizacoes/pendentes")
        .expect(401);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "UNAUTHORIZED",
        }),
      );
    });

    it("deve bloquear SANTACASA nas rotas de regularizações da Farmácia", async () => {
      const agent = await createSantaCasaAgent(app);

      const response = await agent
        .get("/api/farmacia/regularizacoes/pendentes")
        .expect(403);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "FORBIDDEN",
          message: "Sem permissão para aceder a este recurso.",
        }),
      );
    });

    it("deve permitir FARMACIA consultar sinal de regularizações", async () => {
      const agent = await createFarmaciaAgent(app);

      const response = await agent
        .get("/api/farmacia/regularizacoes/sinal")
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          totalEventos: expect.any(Number),
          totalUnidades: expect.any(Number),
        }),
      );

      expect(response.body).toHaveProperty("latestEventoAt");
    });
  });

  describe("Pendentes", () => {
    it("deve listar regularização pendente criada a partir de Venda Suspensa validada pela Farmácia", async () => {
      const santaCasaAgent = await createSantaCasaAgent(app);
      const farmaciaAgent = await createFarmaciaAgent(app);

      const utente = await createUtente(
        santaCasaAgent,
        "Utente Regularização Pendente",
      );

      const medicamento = createUniqueMedicamento("Pendente Regularização E2E");

      try {
        const { pedido } = await createPendingRegularizacao({
          santaCasaAgent,
          farmaciaAgent,
          utente,
          medicamento,
          quantidade: 1,
        });

        const response = await farmaciaAgent
          .get(
            `/api/farmacia/regularizacoes/pendentes?utenteId=${
              utente.id
            }&medicamento=${encodeURIComponent(
              medicamento,
            )}&search=${encodeURIComponent(utente.nome)}`,
          )
          .expect(200);

        const regularizacao = findRegularizacaoByPedido(
          response.body.data,
          pedido.id,
        );

        expect(response.body).toEqual(
          expect.objectContaining({
            data: expect.any(Array),
            meta: expect.objectContaining({
              total: expect.any(Number),
              skip: 0,
              take: 50,
            }),
            params: expect.objectContaining({
              utenteId: utente.id,
              medicamento,
              search: utente.nome,
            }),
          }),
        );

        expect(regularizacao).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            utenteId: utente.id,
            extraId: expect.any(String),
            pedidoId: pedido.id,
            pedidoNumero: pedido.numero,
            medicamento,
            quantidadeSolicitada: 1,
            quantidadeRegularizada: 0,
            quantidadeRestante: 1,
            status: "PENDENTE",
            utente: expect.objectContaining({
              id: utente.id,
              numero9: utente.numero9,
              nome: utente.nome,
            }),
            pedido: expect.objectContaining({
              id: pedido.id,
              numero: pedido.numero,
              status: "VALIDADO",
            }),
            eventos: [],
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          }),
        );
      } finally {
        await deleteUtente(santaCasaAgent, utente.id);
      }
    });

    it("deve devolver erro de validação para query inválida", async () => {
      const farmaciaAgent = await createFarmaciaAgent(app);

      const response = await farmaciaAgent
        .get("/api/farmacia/regularizacoes/pendentes?take=abc")
        .expect(400);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "BAD_REQUEST",
          message: "O parâmetro 'take' deve ser um número válido.",
        }),
      );
    });
  });

  describe("Histórico", () => {
    it("deve mover regularização para histórico depois de criar receita com confirmação", async () => {
      const santaCasaAgent = await createSantaCasaAgent(app);
      const farmaciaAgent = await createFarmaciaAgent(app);

      const utente = await createUtente(
        santaCasaAgent,
        "Utente Regularização Histórico",
      );

      const medicamento = createUniqueMedicamento(
        "Histórico Regularização E2E",
      );

      try {
        const { pedido } = await createPendingRegularizacao({
          santaCasaAgent,
          farmaciaAgent,
          utente,
          medicamento,
          quantidade: 1,
        });

        const receita = await createReceita(santaCasaAgent, utente.id, {
          medicamento,
          quantidade: 1,
          confirmRegularizacao: true,
        });

        expect(receita.linhas).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              medicamento,
              quantidade: 1,
              quantidadeUsadaRegularizacao: 1,
              quantidadeRestante: 0,
            }),
          ]),
        );

        const pendentesResponse = await farmaciaAgent
          .get(
            `/api/farmacia/regularizacoes/pendentes?utenteId=${
              utente.id
            }&search=${encodeURIComponent(medicamento)}`,
          )
          .expect(200);

        expect(
          findRegularizacaoByPedido(pendentesResponse.body.data, pedido.id),
        ).toBe(undefined);

        const historicoResponse = await farmaciaAgent
          .get(
            `/api/farmacia/regularizacoes/historico?utenteId=${
              utente.id
            }&search=${encodeURIComponent(medicamento)}`,
          )
          .expect(200);

        const regularizacao = findRegularizacaoByPedido(
          historicoResponse.body.data,
          pedido.id,
        );

        expect(regularizacao).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            utenteId: utente.id,
            pedidoId: pedido.id,
            pedidoNumero: pedido.numero,
            medicamento,
            quantidadeSolicitada: 1,
            quantidadeRegularizada: 1,
            quantidadeRestante: 0,
            status: "REGULARIZADO",
            eventos: expect.arrayContaining([
              expect.objectContaining({
                id: expect.any(String),
                quantidade: 1,
                receitaLinhaId: receita.linhas[0].linhaId,
                receitaLinha: expect.objectContaining({
                  id: receita.linhas[0].linhaId,
                  nome: medicamento,
                  validade: expect.any(String),
                  receita: expect.objectContaining({
                    numero19: receita.numero19,
                    pinAcesso6: "123456",
                    pinOpcao4: "1234",
                  }),
                }),
              }),
            ]),
          }),
        );
      } finally {
        await deleteUtente(santaCasaAgent, utente.id);
      }
    });

    it("deve manter regularização pendente como parcialmente regularizada quando a receita só cobre parte da quantidade", async () => {
      const santaCasaAgent = await createSantaCasaAgent(app);
      const farmaciaAgent = await createFarmaciaAgent(app);

      const utente = await createUtente(
        santaCasaAgent,
        "Utente Regularização Parcial",
      );

      const medicamento = createUniqueMedicamento("Parcial Regularização E2E");

      try {
        const { pedido } = await createPendingRegularizacao({
          santaCasaAgent,
          farmaciaAgent,
          utente,
          medicamento,
          quantidade: 2,
        });

        const receita = await createReceita(santaCasaAgent, utente.id, {
          medicamento,
          quantidade: 1,
          confirmRegularizacao: true,
        });

        expect(receita.linhas).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              medicamento,
              quantidade: 1,
              quantidadeUsadaRegularizacao: 1,
              quantidadeRestante: 0,
            }),
          ]),
        );

        const pendentesResponse = await farmaciaAgent
          .get(
            `/api/farmacia/regularizacoes/pendentes?utenteId=${
              utente.id
            }&search=${encodeURIComponent(medicamento)}`,
          )
          .expect(200);

        const regularizacao = findRegularizacaoByPedido(
          pendentesResponse.body.data,
          pedido.id,
        );

        expect(regularizacao).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            utenteId: utente.id,
            pedidoId: pedido.id,
            pedidoNumero: pedido.numero,
            medicamento,
            quantidadeSolicitada: 2,
            quantidadeRegularizada: 1,
            quantidadeRestante: 1,
            status: "PARCIALMENTE_REGULARIZADO",
            eventos: expect.arrayContaining([
              expect.objectContaining({
                quantidade: 1,
                receitaLinhaId: receita.linhas[0].linhaId,
              }),
            ]),
          }),
        );

        const historicoResponse = await farmaciaAgent
          .get(
            `/api/farmacia/regularizacoes/historico?utenteId=${
              utente.id
            }&search=${encodeURIComponent(medicamento)}`,
          )
          .expect(200);

        expect(
          findRegularizacaoByPedido(historicoResponse.body.data, pedido.id),
        ).toBe(undefined);
      } finally {
        await deleteUtente(santaCasaAgent, utente.id);
      }
    });
  });

  describe("Boundary de validade", () => {
    it("deve aplicar regularização pendente a linha de receita com validade igual ao dia atual", async () => {
      const santaCasaAgent = await createSantaCasaAgent(app);
      const farmaciaAgent = await createFarmaciaAgent(app);

      const utente = await createUtente(
        santaCasaAgent,
        "Utente Regularização Hoje",
      );

      const medicamento = createUniqueMedicamento("Regularização Hoje E2E");

      try {
        const { pedido } = await createPendingRegularizacao({
          santaCasaAgent,
          farmaciaAgent,
          utente,
          medicamento,
          quantidade: 1,
        });

        const receita = await createReceita(santaCasaAgent, utente.id, {
          medicamento,
          quantidade: 1,
          validade: createTodayDate(),
          confirmRegularizacao: true,
        });

        expect(receita.linhas).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              medicamento,
              quantidade: 1,
              quantidadeUsadaRegularizacao: 1,
              quantidadeRestante: 0,
            }),
          ]),
        );

        const historicoResponse = await farmaciaAgent
          .get(
            `/api/farmacia/regularizacoes/historico?utenteId=${
              utente.id
            }&search=${encodeURIComponent(medicamento)}`,
          )
          .expect(200);

        const regularizacao = findRegularizacaoByPedido(
          historicoResponse.body.data,
          pedido.id,
        );

        expect(regularizacao).toEqual(
          expect.objectContaining({
            utenteId: utente.id,
            pedidoId: pedido.id,
            medicamento,
            quantidadeSolicitada: 1,
            quantidadeRegularizada: 1,
            quantidadeRestante: 0,
            status: "REGULARIZADO",
          }),
        );
      } finally {
        await deleteUtente(santaCasaAgent, utente.id);
      }
    });
  });

  describe("Regularizações na área Santa Casa", () => {
    it("deve permitir SANTACASA consultar regularizações pendentes", async () => {
      const agent = await createSantaCasaAgent(app);

      const response = await agent
        .get("/api/santacasa/regularizacoes/pendentes")
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          data: expect.any(Array),
          meta: expect.objectContaining({
            total: expect.any(Number),
            skip: 0,
            take: 50,
          }),
          params: expect.objectContaining({
            utenteId: null,
            medicamento: "",
            search: "",
            from: null,
            to: null,
          }),
        }),
      );
    });

    it("deve permitir SANTACASA consultar histórico de regularizações", async () => {
      const agent = await createSantaCasaAgent(app);

      const response = await agent
        .get("/api/santacasa/regularizacoes/historico")
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          data: expect.any(Array),
          meta: expect.objectContaining({
            total: expect.any(Number),
            skip: 0,
            take: 50,
          }),
          params: expect.objectContaining({
            utenteId: null,
            medicamento: "",
            search: "",
            from: null,
            to: null,
          }),
        }),
      );
    });

    it("deve permitir SANTACASA consultar sinal de regularizações", async () => {
      const agent = await createSantaCasaAgent(app);

      const response = await agent
        .get("/api/santacasa/regularizacoes/sinal")
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          totalEventos: expect.any(Number),
          totalUnidades: expect.any(Number),
        }),
      );

      expect(response.body).toHaveProperty("latestEventoAt");
    });

    it("deve bloquear FARMACIA nas rotas de regularizações da Santa Casa", async () => {
      const agent = await createFarmaciaAgent(app);

      const paths = [
        "/api/santacasa/regularizacoes/pendentes",
        "/api/santacasa/regularizacoes/historico",
        "/api/santacasa/regularizacoes/sinal",
      ];

      for (const path of paths) {
        const response = await agent.get(path).expect(403);

        expect(response.body).toEqual(
          expect.objectContaining({
            error: "FORBIDDEN",
            message: "Sem permissão para aceder a este recurso.",
          }),
        );
      }
    });
  });
});
