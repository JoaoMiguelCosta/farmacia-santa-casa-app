// backend/tests/e2e/semReceita.e2e.test.js
const request = require("supertest");

const { getTestApp } = require("../helpers/app");
const {
  createFarmaciaAgent,
  createSantaCasaAgent,
} = require("../helpers/auth");
const { createUniqueUtentePayload } = require("../fixtures/utentes.fixture");

function createUniqueMedicamento(prefix = "Medicamento Sem Receita E2E") {
  const timestamp = Date.now();
  const random = Math.floor(1000 + Math.random() * 9000);

  return `${prefix} ${timestamp} ${random}`;
}

async function createUtente(agent, prefix = "Utente Sem Receita E2E") {
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

async function deleteSemReceita(agent, utenteId, semReceitaId) {
  if (!utenteId || !semReceitaId) return;

  try {
    await agent.delete(
      `/api/santacasa/utentes/${utenteId}/sem-receita/${semReceitaId}`,
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

describe("Medicamentos não sujeitos a receita médica E2E", () => {
  const app = getTestApp();

  describe("Permissões", () => {
    it("deve bloquear acesso sem sessão", async () => {
      const response = await request(app)
        .get("/api/santacasa/utentes/utente-teste/sem-receita")
        .expect(401);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "UNAUTHORIZED",
        }),
      );
    });

    it("deve bloquear FARMACIA nas rotas de medicamentos não sujeitos a receita médica da Santa Casa", async () => {
      const agent = await createFarmaciaAgent(app);

      const response = await agent
        .get("/api/santacasa/utentes/utente-teste/sem-receita")
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
    it("deve criar, listar e remover medicamento não sujeito a receita médica", async () => {
      const agent = await createSantaCasaAgent(app);
      const utente = await createUtente(agent);
      const medicamento = createUniqueMedicamento();

      let semReceitaId = null;

      try {
        const createResponse = await agent
          .post(`/api/santacasa/utentes/${utente.id}/sem-receita`)
          .send({
            medicamento,
            quantidade: 3,
          })
          .expect(201);

        expect(createResponse.body.data).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            utenteId: utente.id,
            medicamento,
            quantidade: 3,
            quantidadeReservadaPendente: 0,
            quantidadeRestante: 3,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          }),
        );

        semReceitaId = createResponse.body.data.id;

        const listResponse = await agent
          .get(`/api/santacasa/utentes/${utente.id}/sem-receita`)
          .expect(200);

        expect(listResponse.body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: semReceitaId,
              utenteId: utente.id,
              medicamento,
              quantidade: 3,
              quantidadeRestante: 3,
            }),
          ]),
        );

        await agent
          .delete(
            `/api/santacasa/utentes/${utente.id}/sem-receita/${semReceitaId}`,
          )
          .expect(204);

        semReceitaId = null;

        const afterDeleteResponse = await agent
          .get(`/api/santacasa/utentes/${utente.id}/sem-receita`)
          .expect(200);

        expect(afterDeleteResponse.body.data).not.toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              medicamento,
            }),
          ]),
        );
      } finally {
        await deleteSemReceita(agent, utente.id, semReceitaId);
        await deleteUtente(agent, utente.id);
      }
    });

    it("deve juntar duplicados ativos do mesmo medicamento por utente", async () => {
      const agent = await createSantaCasaAgent(app);
      const utente = await createUtente(agent, "Utente Sem Receita Duplicado");
      const medicamento = createUniqueMedicamento("Duplicado Sem Receita E2E");

      let semReceitaId = null;

      try {
        const firstResponse = await agent
          .post(`/api/santacasa/utentes/${utente.id}/sem-receita`)
          .send({
            medicamento,
            quantidade: 2,
          })
          .expect(201);

        semReceitaId = firstResponse.body.data.id;

        const secondResponse = await agent
          .post(`/api/santacasa/utentes/${utente.id}/sem-receita`)
          .send({
            medicamento: medicamento.toLowerCase(),
            quantidade: 3,
          })
          .expect(201);

        expect(secondResponse.body.data).toEqual(
          expect.objectContaining({
            id: semReceitaId,
            utenteId: utente.id,
            quantidade: 5,
            quantidadeRestante: 5,
          }),
        );

        const listResponse = await agent
          .get(`/api/santacasa/utentes/${utente.id}/sem-receita`)
          .expect(200);

        const matches = listResponse.body.data.filter((item) => {
          return item.id === semReceitaId;
        });

        expect(matches).toHaveLength(1);
        expect(matches[0]).toEqual(
          expect.objectContaining({
            quantidade: 5,
            quantidadeRestante: 5,
          }),
        );
      } finally {
        await deleteSemReceita(agent, utente.id, semReceitaId);
        await deleteUtente(agent, utente.id);
      }
    });

    it("deve validar medicamento obrigatório", async () => {
      const agent = await createSantaCasaAgent(app);
      const utente = await createUtente(agent, "Utente Sem Receita Validação");

      try {
        const response = await agent
          .post(`/api/santacasa/utentes/${utente.id}/sem-receita`)
          .send({
            medicamento: "",
            quantidade: 1,
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

    it("deve validar quantidade obrigatória e maior que 0", async () => {
      const agent = await createSantaCasaAgent(app);
      const utente = await createUtente(agent, "Utente Sem Receita Quantidade");

      try {
        const response = await agent
          .post(`/api/santacasa/utentes/${utente.id}/sem-receita`)
          .send({
            medicamento: createUniqueMedicamento(),
            quantidade: 0,
          })
          .expect(400);

        expect(response.body).toEqual(
          expect.objectContaining({
            error: "BAD_REQUEST",
            message:
              "O campo 'quantidade' deve ser um número inteiro maior que 0.",
          }),
        );
      } finally {
        await deleteUtente(agent, utente.id);
      }
    });

    it("deve bloquear remoção quando o medicamento está associado a pedido pendente", async () => {
      const agent = await createSantaCasaAgent(app);
      const utente = await createUtente(agent, "Utente Sem Receita Pendente");

      let semReceitaId = null;
      let pedidoId = null;

      try {
        const semReceita = await createSemReceita(agent, utente.id, {
          medicamento: createUniqueMedicamento("Bloqueio Sem Receita E2E"),
          quantidade: 2,
        });

        semReceitaId = semReceita.id;

        const pedido = await createPedido(agent, [
          {
            utenteId: utente.id,
            tipo: "SEM_RECEITA",
            id: semReceita.id,
            quantidade: 1,
          },
        ]);

        pedidoId = pedido.id;

        const response = await agent
          .delete(
            `/api/santacasa/utentes/${utente.id}/sem-receita/${semReceita.id}`,
          )
          .expect(409);

        expect(response.body).toEqual(
          expect.objectContaining({
            error: "CONFLICT",
            message:
              "Não é possível remover: o medicamento ainda está associado a pedidos pendentes.",
          }),
        );
      } finally {
        await cancelPedido(agent, pedidoId);
        await deleteSemReceita(agent, utente.id, semReceitaId);
      }
    });

    it("deve permitir remover medicamento depois de cancelar o pedido pendente associado", async () => {
      const agent = await createSantaCasaAgent(app);
      const utente = await createUtente(
        agent,
        "Utente Sem Receita Cancelamento",
      );

      let semReceitaId = null;
      let pedidoId = null;

      try {
        const semReceita = await createSemReceita(agent, utente.id, {
          medicamento: createUniqueMedicamento("Cancelamento Sem Receita E2E"),
          quantidade: 2,
        });

        semReceitaId = semReceita.id;

        const pedido = await createPedido(agent, [
          {
            utenteId: utente.id,
            tipo: "SEM_RECEITA",
            id: semReceita.id,
            quantidade: 1,
          },
        ]);

        pedidoId = pedido.id;

        await agent
          .post(`/api/santacasa/pedidos/${pedido.id}/cancelar`)
          .send({
            motivo: "Pedido cancelado para permitir remover o medicamento.",
          })
          .expect(200);

        pedidoId = null;

        await agent
          .delete(
            `/api/santacasa/utentes/${utente.id}/sem-receita/${semReceita.id}`,
          )
          .expect(204);

        semReceitaId = null;

        const listResponse = await agent
          .get(`/api/santacasa/utentes/${utente.id}/sem-receita`)
          .expect(200);

        expect(listResponse.body.data).not.toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: semReceita.id,
            }),
          ]),
        );
      } finally {
        await cancelPedido(agent, pedidoId);
        await deleteSemReceita(agent, utente.id, semReceitaId);
      }
    });
  });
});
