// backend/tests/e2e/extras.e2e.test.js
const request = require("supertest");

const { getTestApp } = require("../helpers/app");
const {
  createFarmaciaAgent,
  createSantaCasaAgent,
} = require("../helpers/auth");
const { createUniqueUtentePayload } = require("../fixtures/utentes.fixture");

function createUniqueMedicamento(prefix = "Medicamento Venda Suspensa E2E") {
  const timestamp = Date.now();
  const random = Math.floor(1000 + Math.random() * 9000);

  return `${prefix} ${timestamp} ${random}`;
}

function makeNumero19(seed = Date.now()) {
  return String(seed).replace(/\D/g, "").padEnd(19, "0").slice(0, 19);
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

async function createUtente(agent, prefix = "Utente Venda Suspensa E2E") {
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
      quantidadeSolicitada: payload.quantidadeSolicitada || 2,
      receitaDraftItems: payload.receitaDraftItems,
    })
    .expect(201);

  return response.body.data;
}

async function deleteExtra(agent, utenteId, extraId) {
  if (!utenteId || !extraId) return;

  try {
    await agent.delete(`/api/santacasa/utentes/${utenteId}/extras/${extraId}`);
  } catch {
    // Cleanup best-effort.
  }
}

async function createReceita(agent, utenteId, payload = {}) {
  const response = await agent
    .post(`/api/santacasa/utentes/${utenteId}/receitas`)
    .send({
      numero19: payload.numero19 || makeNumero19(Date.now()),
      pinAcesso6: "123456",
      pinOpcao4: "1234",
      linhas: [
        {
          medicamento: payload.medicamento || createUniqueMedicamento(),
          quantidade: payload.quantidade || 2,
          validade: payload.validade || createFutureDate(),
        },
      ],
    })
    .expect(201);

  return response.body.data;
}

async function deleteReceitaLinha(agent, utenteId, linhaId) {
  if (!utenteId || !linhaId) return;

  try {
    await agent.delete(
      `/api/santacasa/utentes/${utenteId}/receitas/linhas/${linhaId}`,
    );
  } catch {
    // Cleanup best-effort.
  }
}

async function createPedido(agent, items) {
  const response = await agent
    .post("/api/santacasa/pedidos")
    .send({ items })
    .expect(201);

  return response.body.data;
}

async function cancelPedido(agent, pedidoId) {
  if (!pedidoId) return;

  try {
    await agent.post(`/api/santacasa/pedidos/${pedidoId}/cancelar`).send({
      motivo: "Cleanup E2E.",
    });
  } catch {
    // Cleanup best-effort.
  }
}

describe("Vendas Suspensas E2E", () => {
  const app = getTestApp();

  describe("Permissões", () => {
    it("deve bloquear acesso sem sessão", async () => {
      const response = await request(app)
        .get("/api/santacasa/utentes/utente-teste/extras")
        .expect(401);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "UNAUTHORIZED",
        }),
      );
    });

    it("deve bloquear FARMACIA nas rotas de Vendas Suspensas da Santa Casa", async () => {
      const agent = await createFarmaciaAgent(app);

      const response = await agent
        .get("/api/santacasa/utentes/utente-teste/extras")
        .expect(403);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "FORBIDDEN",
          message: "Sem permissão para aceder a este recurso.",
        }),
      );
    });
  });

  describe("CRUD", () => {
    it("deve criar, listar e remover Venda Suspensa", async () => {
      const agent = await createSantaCasaAgent(app);
      const utente = await createUtente(agent);
      const medicamento = createUniqueMedicamento();

      let extraId = null;

      try {
        const createResponse = await agent
          .post(`/api/santacasa/utentes/${utente.id}/extras`)
          .send({
            medicamento,
            quantidadeSolicitada: 3,
          })
          .expect(201);

        expect(createResponse.body.data).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            utenteId: utente.id,
            medicamento,
            quantidadeSolicitada: 3,
            quantidadeRegularizada: 0,
            quantidadeCancelada: 0,
            quantidadeReservadaPendente: 0,
            quantidadeRestante: 3,
            status: "PENDENTE",
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          }),
        );

        extraId = createResponse.body.data.id;

        const listResponse = await agent
          .get(`/api/santacasa/utentes/${utente.id}/extras`)
          .expect(200);

        expect(listResponse.body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: extraId,
              utenteId: utente.id,
              medicamento,
              quantidadeSolicitada: 3,
              quantidadeRestante: 3,
              status: "PENDENTE",
            }),
          ]),
        );

        await agent
          .delete(`/api/santacasa/utentes/${utente.id}/extras/${extraId}`)
          .expect(204);

        extraId = null;

        const afterDeleteResponse = await agent
          .get(`/api/santacasa/utentes/${utente.id}/extras`)
          .expect(200);

        expect(afterDeleteResponse.body.data).not.toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              medicamento,
            }),
          ]),
        );
      } finally {
        await deleteExtra(agent, utente.id, extraId);
        await deleteUtente(agent, utente.id);
      }
    });

    it("deve impedir Venda Suspensa duplicada em aberto para o mesmo medicamento", async () => {
      const agent = await createSantaCasaAgent(app);
      const utente = await createUtente(
        agent,
        "Utente Venda Suspensa Duplicada",
      );
      const medicamento = createUniqueMedicamento(
        "Duplicado Venda Suspensa E2E",
      );

      let extraId = null;

      try {
        const firstResponse = await agent
          .post(`/api/santacasa/utentes/${utente.id}/extras`)
          .send({
            medicamento,
            quantidadeSolicitada: 2,
          })
          .expect(201);

        extraId = firstResponse.body.data.id;

        const duplicateResponse = await agent
          .post(`/api/santacasa/utentes/${utente.id}/extras`)
          .send({
            medicamento: medicamento.toLowerCase(),
            quantidadeSolicitada: 1,
          })
          .expect(409);

        expect(duplicateResponse.body).toEqual(
          expect.objectContaining({
            error: "CONFLICT",
            message:
              "Já existe uma Venda Suspensa em aberto para este medicamento.",
          }),
        );
      } finally {
        await deleteExtra(agent, utente.id, extraId);
        await deleteUtente(agent, utente.id);
      }
    });

    it("deve validar medicamento obrigatório", async () => {
      const agent = await createSantaCasaAgent(app);
      const utente = await createUtente(
        agent,
        "Utente Venda Suspensa Validação",
      );

      try {
        const response = await agent
          .post(`/api/santacasa/utentes/${utente.id}/extras`)
          .send({
            medicamento: "",
            quantidadeSolicitada: 1,
          })
          .expect(400);

        expect(response.body).toEqual(
          expect.objectContaining({
            error: "BAD_REQUEST",
            message: "O campo 'medicamento' é obrigatório.",
          }),
        );
      } finally {
        await deleteUtente(agent, utente.id);
      }
    });

    it("deve validar quantidade solicitada obrigatória e maior que 0", async () => {
      const agent = await createSantaCasaAgent(app);
      const utente = await createUtente(
        agent,
        "Utente Venda Suspensa Quantidade",
      );

      try {
        const response = await agent
          .post(`/api/santacasa/utentes/${utente.id}/extras`)
          .send({
            medicamento: createUniqueMedicamento(),
            quantidadeSolicitada: 0,
          })
          .expect(400);

        expect(response.body).toEqual(
          expect.objectContaining({
            error: "BAD_REQUEST",
            message:
              "O campo 'quantidadeSolicitada' deve ser um número inteiro maior que 0.",
          }),
        );
      } finally {
        await deleteUtente(agent, utente.id);
      }
    });

    it("deve impedir criar Venda Suspensa quando já existe receita ativa disponível para o medicamento", async () => {
      const agent = await createSantaCasaAgent(app);
      const utente = await createUtente(agent, "Utente Receita Ativa Extra");
      const medicamento = createUniqueMedicamento("Receita Ativa Extra E2E");

      let linhaId = null;

      try {
        const receita = await createReceita(agent, utente.id, {
          medicamento,
          quantidade: 2,
        });

        linhaId = receita.linhas[0].linhaId;

        const response = await agent
          .post(`/api/santacasa/utentes/${utente.id}/extras`)
          .send({
            medicamento,
            quantidadeSolicitada: 1,
          })
          .expect(409);

        expect(response.body).toEqual(
          expect.objectContaining({
            error: "CONFLICT",
            message:
              "Já existe receita ativa com quantidade disponível para este medicamento.",
          }),
        );
      } finally {
        await deleteReceitaLinha(agent, utente.id, linhaId);
        await deleteUtente(agent, utente.id);
      }
    });

    it("deve impedir criar Venda Suspensa quando existe receita com validade igual ao dia atual", async () => {
      const agent = await createSantaCasaAgent(app);
      const utente = await createUtente(agent, "Utente Receita Hoje Extra");
      const medicamento = createUniqueMedicamento("Receita Hoje Extra E2E");

      let linhaId = null;

      try {
        const receita = await createReceita(agent, utente.id, {
          medicamento,
          quantidade: 2,
          validade: createTodayDate(),
        });

        linhaId = receita.linhas[0].linhaId;

        const response = await agent
          .post(`/api/santacasa/utentes/${utente.id}/extras`)
          .send({
            medicamento,
            quantidadeSolicitada: 1,
          })
          .expect(409);

        expect(response.body).toEqual(
          expect.objectContaining({
            error: "CONFLICT",
            message:
              "Já existe receita ativa com quantidade disponível para este medicamento.",
          }),
        );
      } finally {
        await deleteReceitaLinha(agent, utente.id, linhaId);
        await deleteUtente(agent, utente.id);
      }
    });

    it("deve bloquear remoção quando a Venda Suspensa está associada a pedido pendente", async () => {
      const agent = await createSantaCasaAgent(app);
      const utente = await createUtente(agent, "Utente Extra Pendente");

      let extraId = null;
      let pedidoId = null;

      try {
        const extra = await createExtra(agent, utente.id, {
          medicamento: createUniqueMedicamento("Bloqueio Extra E2E"),
          quantidadeSolicitada: 2,
        });

        extraId = extra.id;

        const pedido = await createPedido(agent, [
          {
            utenteId: utente.id,
            tipo: "EXTRA",
            id: extra.id,
            quantidade: 1,
          },
        ]);

        pedidoId = pedido.id;

        const response = await agent
          .delete(`/api/santacasa/utentes/${utente.id}/extras/${extra.id}`)
          .expect(409);

        expect(response.body).toEqual(
          expect.objectContaining({
            error: "CONFLICT",
            message:
              "Não é possível remover: a Venda Suspensa ainda está associada a pedidos pendentes.",
          }),
        );
      } finally {
        await cancelPedido(agent, pedidoId);
        await deleteExtra(agent, utente.id, extraId);
      }
    });

    it("deve permitir remover Venda Suspensa depois de cancelar o pedido pendente associado", async () => {
      const agent = await createSantaCasaAgent(app);
      const utente = await createUtente(agent, "Utente Extra Cancelamento");

      let extraId = null;
      let pedidoId = null;

      try {
        const extra = await createExtra(agent, utente.id, {
          medicamento: createUniqueMedicamento("Cancelamento Extra E2E"),
          quantidadeSolicitada: 2,
        });

        extraId = extra.id;

        const pedido = await createPedido(agent, [
          {
            utenteId: utente.id,
            tipo: "EXTRA",
            id: extra.id,
            quantidade: 1,
          },
        ]);

        pedidoId = pedido.id;

        await agent
          .post(`/api/santacasa/pedidos/${pedido.id}/cancelar`)
          .send({
            motivo: "Pedido cancelado para permitir remover a Venda Suspensa.",
          })
          .expect(200);

        pedidoId = null;

        await agent
          .delete(`/api/santacasa/utentes/${utente.id}/extras/${extra.id}`)
          .expect(204);

        extraId = null;

        const listResponse = await agent
          .get(`/api/santacasa/utentes/${utente.id}/extras`)
          .expect(200);

        expect(listResponse.body.data).not.toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: extra.id,
            }),
          ]),
        );
      } finally {
        await cancelPedido(agent, pedidoId);
        await deleteExtra(agent, utente.id, extraId);
      }
    });
  });
});
