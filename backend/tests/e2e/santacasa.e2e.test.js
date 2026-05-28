const { getTestApp } = require("../helpers/app");
const {
  createFarmaciaAgent,
  createSantaCasaAgent,
} = require("../helpers/auth");
const { createUniqueUtentePayload } = require("../fixtures/utentes.fixture");

describe("Santa Casa E2E", () => {
  const app = getTestApp();

  describe("Permissões", () => {
    it("deve permitir SANTACASA aceder ao health da Santa Casa", async () => {
      const agent = await createSantaCasaAgent(app);

      const response = await agent.get("/api/santacasa/health").expect(200);

      expect(response.body).toEqual({
        status: "ok",
        context: "santacasa",
      });
    });

    it("deve bloquear FARMACIA nas rotas da Santa Casa", async () => {
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

  describe("Utentes", () => {
    it("deve criar, listar, consultar, arquivar, reativar e remover utente", async () => {
      const agent = await createSantaCasaAgent(app);
      const payload = createUniqueUtentePayload();

      const createdResponse = await agent
        .post("/api/santacasa/utentes")
        .send(payload)
        .expect(201);

      expect(createdResponse.body.data).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          numero9: payload.numero9,
          nome: payload.nome,
          status: "ATIVO",
          isArchived: false,
          deletedAt: null,
        }),
      );

      const utenteId = createdResponse.body.data.id;

      const listResponse = await agent
        .get(
          `/api/santacasa/utentes?search=${encodeURIComponent(payload.nome)}`,
        )
        .expect(200);

      expect(listResponse.body.data.rows).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: utenteId,
            numero9: payload.numero9,
            nome: payload.nome,
          }),
        ]),
      );

      const getResponse = await agent
        .get(`/api/santacasa/utentes/${utenteId}`)
        .expect(200);

      expect(getResponse.body.data).toEqual(
        expect.objectContaining({
          id: utenteId,
          numero9: payload.numero9,
          nome: payload.nome,
          status: "ATIVO",
        }),
      );

      const archiveResponse = await agent
        .patch(`/api/santacasa/utentes/${utenteId}/archive`)
        .send({
          archivedReason: "Teste E2E de arquivo.",
        })
        .expect(200);

      expect(archiveResponse.body.data).toEqual(
        expect.objectContaining({
          id: utenteId,
          status: "ARQUIVADO",
          isArchived: true,
          archivedReason: "Teste E2E de arquivo.",
        }),
      );

      const reactivateResponse = await agent
        .patch(`/api/santacasa/utentes/${utenteId}/reactivate`)
        .expect(200);

      expect(reactivateResponse.body.data).toEqual(
        expect.objectContaining({
          id: utenteId,
          status: "ATIVO",
          isArchived: false,
          archivedAt: null,
          archivedReason: null,
        }),
      );

      await agent.delete(`/api/santacasa/utentes/${utenteId}`).expect(204);

      const afterDeleteResponse = await agent
        .get(`/api/santacasa/utentes/${utenteId}`)
        .expect(200);

      expect(afterDeleteResponse.body.data).toEqual(
        expect.objectContaining({
          id: utenteId,
          isValid: false,
          deletedAt: expect.any(String),
        }),
      );
    });

    it("deve rejeitar criação de utente com numero9 inválido", async () => {
      const agent = await createSantaCasaAgent(app);

      const response = await agent
        .post("/api/santacasa/utentes")
        .send({
          numero9: "123",
          nome: "Utente Inválido",
        })
        .expect(400);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "BAD_REQUEST",
          message: "O campo 'numero9' deve ter exatamente 9 dígitos.",
        }),
      );
    });

    it("deve rejeitar criação de utente duplicado por numero9", async () => {
      const agent = await createSantaCasaAgent(app);
      const payload = createUniqueUtentePayload("Utente Duplicado");

      await agent.post("/api/santacasa/utentes").send(payload).expect(201);

      const response = await agent
        .post("/api/santacasa/utentes")
        .send({
          numero9: payload.numero9,
          nome: `${payload.nome} Segundo`,
        })
        .expect(409);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "CONFLICT",
          message: "Já existe um utente ativo com esse número.",
        }),
      );
    });
  });

  describe("Dashboard Santa Casa", () => {
    it("deve devolver sinais do dashboard da Santa Casa", async () => {
      const agent = await createSantaCasaAgent(app);

      const response = await agent
        .get("/api/santacasa/dashboard/sinais")
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          utentes: expect.objectContaining({
            total: expect.any(Number),
          }),
          receitas: expect.objectContaining({
            total: expect.any(Number),
          }),
          pedidos: expect.objectContaining({
            pendentes: expect.any(Number),
            validados: expect.any(Number),
            rejeitados: expect.any(Number),
          }),
          regularizacoes: expect.objectContaining({
            pendentes: expect.any(Number),
            parcialmenteRegularizadas: expect.any(Number),
            regularizadas: expect.any(Number),
          }),
        }),
      );
    });
  });
});
