// backend/tests/e2e/utentes.e2e.test.js
const request = require("supertest");

const { getTestApp } = require("../helpers/app");
const {
  createFarmaciaAgent,
  createSantaCasaAgent,
} = require("../helpers/auth");
const { createUniqueUtentePayload } = require("../fixtures/utentes.fixture");

function createUniqueMedicamento(prefix = "Medicamento Utente E2E") {
  const timestamp = Date.now();
  const random = Math.floor(1000 + Math.random() * 9000);

  return `${prefix} ${timestamp} ${random}`;
}

async function createUtente(agent, prefix = "Utente E2E") {
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
      quantidade: payload.quantidade || 1,
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

describe("Utentes E2E reforçado", () => {
  const app = getTestApp();

  describe("Permissões", () => {
    it("deve bloquear listagem de utentes sem sessão", async () => {
      const response = await request(app)
        .get("/api/santacasa/utentes")
        .expect(401);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "UNAUTHORIZED",
        }),
      );
    });

    it("deve bloquear FARMACIA nas rotas de utentes da Santa Casa", async () => {
      const agent = await createFarmaciaAgent(app);

      const response = await agent.get("/api/santacasa/utentes").expect(403);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "FORBIDDEN",
          message: "Sem permissão para aceder a este recurso.",
        }),
      );
    });
  });

  describe("Arquivo e reativação", () => {
    it("deve arquivar com motivo, listar em arquivados, bloquear operação no utente arquivado e reativar", async () => {
      const agent = await createSantaCasaAgent(app);
      const utente = await createUtente(agent, "Utente Arquivo Reforçado");

      try {
        const archivedReason = "Arquivo E2E reforçado.";

        const archiveResponse = await agent
          .patch(`/api/santacasa/utentes/${utente.id}/archive`)
          .send({
            archivedReason,
          })
          .expect(200);

        expect(archiveResponse.body.data).toEqual(
          expect.objectContaining({
            id: utente.id,
            numero9: utente.numero9,
            nome: utente.nome,
            status: "ARQUIVADO",
            isArchived: true,
            archivedAt: expect.any(String),
            archivedReason,
            archivedById: expect.any(String),
            archivedBy: expect.objectContaining({
              role: "SANTACASA",
            }),
            isValid: true,
            deletedAt: null,
          }),
        );

        const archivedListResponse = await agent
          .get(
            `/api/santacasa/utentes?status=ARQUIVADO&search=${encodeURIComponent(
              utente.numero9,
            )}`,
          )
          .expect(200);

        expect(archivedListResponse.body.data.rows).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: utente.id,
              status: "ARQUIVADO",
              isArchived: true,
            }),
          ]),
        );

        const blockedResponse = await agent
          .post(`/api/santacasa/utentes/${utente.id}/sem-receita`)
          .send({
            medicamento: createUniqueMedicamento("Bloqueio Arquivado E2E"),
            quantidade: 1,
          })
          .expect(409);

        expect(blockedResponse.body).toEqual(
          expect.objectContaining({
            error: "CONFLICT",
            message:
              "Não é possível criar medicamento não sujeito a receita médica para este utente porque o utente está arquivado.",
          }),
        );

        const reactivateResponse = await agent
          .patch(`/api/santacasa/utentes/${utente.id}/reactivate`)
          .expect(200);

        expect(reactivateResponse.body.data).toEqual(
          expect.objectContaining({
            id: utente.id,
            status: "ATIVO",
            isArchived: false,
            archivedAt: null,
            archivedReason: null,
            archivedById: null,
            archivedBy: null,
          }),
        );
      } finally {
        await deleteUtente(agent, utente.id);
      }
    });

    it("deve bloquear arquivar utente já arquivado", async () => {
      const agent = await createSantaCasaAgent(app);
      const utente = await createUtente(agent, "Utente Arquivo Duplicado");

      try {
        await agent
          .patch(`/api/santacasa/utentes/${utente.id}/archive`)
          .send({
            archivedReason: "Primeiro arquivo.",
          })
          .expect(200);

        const response = await agent
          .patch(`/api/santacasa/utentes/${utente.id}/archive`)
          .send({
            archivedReason: "Segundo arquivo.",
          })
          .expect(409);

        expect(response.body).toEqual(
          expect.objectContaining({
            error: "CONFLICT",
            message: "Utente já se encontra arquivado.",
          }),
        );
      } finally {
        await deleteUtente(agent, utente.id);
      }
    });

    it("deve bloquear reativar utente já ativo", async () => {
      const agent = await createSantaCasaAgent(app);
      const utente = await createUtente(agent, "Utente Reativação Inválida");

      try {
        const response = await agent
          .patch(`/api/santacasa/utentes/${utente.id}/reactivate`)
          .expect(409);

        expect(response.body).toEqual(
          expect.objectContaining({
            error: "CONFLICT",
            message: "Utente já se encontra ativo.",
          }),
        );
      } finally {
        await deleteUtente(agent, utente.id);
      }
    });
  });

  describe("Bloqueios por pendências e dados associados", () => {
    it("deve bloquear arquivar utente com medicamento não sujeito a receita médica disponível", async () => {
      const agent = await createSantaCasaAgent(app);
      const utente = await createUtente(agent, "Utente Arquivo Sem Receita");

      let semReceitaId = null;

      try {
        const semReceita = await createSemReceita(agent, utente.id, {
          medicamento: createUniqueMedicamento("Arquivo Sem Receita E2E"),
          quantidade: 1,
        });

        semReceitaId = semReceita.id;

        const response = await agent
          .patch(`/api/santacasa/utentes/${utente.id}/archive`)
          .send({
            archivedReason: "Tentativa com pendências.",
          })
          .expect(409);

        expect(response.body).toEqual(
          expect.objectContaining({
            error: "CONFLICT",
            message: expect.stringContaining(
              "medicamento(s) não sujeito(s) a receita médica disponível(is)",
            ),
          }),
        );

        expect(response.body.message).toContain(
          "Não é possível arquivar este utente porque existem pendências em aberto",
        );
      } finally {
        await deleteSemReceita(agent, utente.id, semReceitaId);
        await deleteUtente(agent, utente.id);
      }
    });

    it("deve bloquear arquivar utente com pedido pendente", async () => {
      const agent = await createSantaCasaAgent(app);
      const utente = await createUtente(
        agent,
        "Utente Arquivo Pedido Pendente",
      );

      let semReceitaId = null;
      let pedidoId = null;

      try {
        const semReceita = await createSemReceita(agent, utente.id, {
          medicamento: createUniqueMedicamento("Arquivo Pedido Pendente E2E"),
          quantidade: 1,
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
          .patch(`/api/santacasa/utentes/${utente.id}/archive`)
          .send({
            archivedReason: "Tentativa com pedido pendente.",
          })
          .expect(409);

        expect(response.body).toEqual(
          expect.objectContaining({
            error: "CONFLICT",
            message: expect.stringContaining("item(ns) de pedido pendente"),
          }),
        );

        expect(response.body.message).toContain(
          "Resolve ou cancela as pendências antes de arquivar.",
        );
      } finally {
        await cancelPedido(agent, pedidoId);
        await deleteSemReceita(agent, utente.id, semReceitaId);
        await deleteUtente(agent, utente.id);
      }
    });

    it("deve bloquear remover utente com dados associados e recomendar arquivo", async () => {
      const agent = await createSantaCasaAgent(app);
      const utente = await createUtente(agent, "Utente Remoção Bloqueada");

      let semReceitaId = null;

      try {
        const semReceita = await createSemReceita(agent, utente.id, {
          medicamento: createUniqueMedicamento("Remoção Bloqueada E2E"),
          quantidade: 1,
        });

        semReceitaId = semReceita.id;

        const response = await agent
          .delete(`/api/santacasa/utentes/${utente.id}`)
          .expect(409);

        expect(response.body).toEqual(
          expect.objectContaining({
            error: "CONFLICT",
            message: expect.stringContaining(
              "Não é possível remover este utente porque já existem dados associados",
            ),
          }),
        );

        expect(response.body.message).toContain(
          "medicamento(s) não sujeito(s) a receita médica",
        );

        expect(response.body.message).toContain(
          "Mantém o utente arquivado para preservar o histórico.",
        );
      } finally {
        await deleteSemReceita(agent, utente.id, semReceitaId);
        await deleteUtente(agent, utente.id);
      }
    });
  });

  describe("Duplicados e remoção lógica", () => {
    it("deve impedir criar utente com número de utente já removido logicamente", async () => {
      const agent = await createSantaCasaAgent(app);
      const payload = createUniqueUtentePayload("Utente Numero Removido");

      const createdResponse = await agent
        .post("/api/santacasa/utentes")
        .send(payload)
        .expect(201);

      const utenteId = createdResponse.body.data.id;

      await agent.delete(`/api/santacasa/utentes/${utenteId}`).expect(204);

      const response = await agent
        .post("/api/santacasa/utentes")
        .send({
          numero9: payload.numero9,
          nome: `${payload.nome} Novo`,
        })
        .expect(409);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "CONFLICT",
          message:
            "Já existe um registo removido com esse número. Este número não pode ser reutilizado.",
        }),
      );
    });

    it("deve impedir criar novo utente com nome igual a utente arquivado", async () => {
      const agent = await createSantaCasaAgent(app);
      const archivedUtente = await createUtente(agent, "Utente Nome Arquivado");
      const newPayload = createUniqueUtentePayload("Utente Nome Novo");

      try {
        await agent
          .patch(`/api/santacasa/utentes/${archivedUtente.id}/archive`)
          .send({
            archivedReason: "Arquivo para teste de duplicado.",
          })
          .expect(200);

        const response = await agent
          .post("/api/santacasa/utentes")
          .send({
            numero9: newPayload.numero9,
            nome: archivedUtente.nome,
          })
          .expect(409);

        expect(response.body).toEqual(
          expect.objectContaining({
            error: "CONFLICT",
            message:
              "Já existe um utente arquivado com esse nome. Confirma se deves reativar o registo existente em vez de criar um novo.",
          }),
        );
      } finally {
        await deleteUtente(agent, archivedUtente.id);
      }
    });

    it("deve impedir criar novo utente com número igual a utente arquivado", async () => {
      const agent = await createSantaCasaAgent(app);
      const archivedUtente = await createUtente(
        agent,
        "Utente Numero Arquivado",
      );
      const newPayload = createUniqueUtentePayload("Utente Numero Novo");

      try {
        await agent
          .patch(`/api/santacasa/utentes/${archivedUtente.id}/archive`)
          .send({
            archivedReason: "Arquivo para teste de número duplicado.",
          })
          .expect(200);

        const response = await agent
          .post("/api/santacasa/utentes")
          .send({
            numero9: archivedUtente.numero9,
            nome: newPayload.nome,
          })
          .expect(409);

        expect(response.body).toEqual(
          expect.objectContaining({
            error: "CONFLICT",
            message:
              "Já existe um utente arquivado com esse número. Reativa o utente existente em vez de criar um novo registo.",
          }),
        );
      } finally {
        await deleteUtente(agent, archivedUtente.id);
      }
    });
  });
});
