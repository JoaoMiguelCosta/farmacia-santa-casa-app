const request = require("supertest");

const { getTestApp } = require("../helpers/app");
const {
  createAdminAgent,
  createFarmaciaAgent,
  createSantaCasaAgent,
} = require("../helpers/auth");

describe("Manutenção E2E", () => {
  const app = getTestApp();

  describe("Permissões", () => {
    it("deve bloquear acesso sem sessão", async () => {
      const response = await request(app)
        .get("/api/manutencao/jobs")
        .expect(401);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "UNAUTHORIZED",
        }),
      );
    });

    it("deve bloquear SANTACASA nas rotas de manutenção", async () => {
      const agent = await createSantaCasaAgent(app);

      const response = await agent.get("/api/manutencao/jobs").expect(403);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "FORBIDDEN",
          message: "Sem permissão para aceder a este recurso.",
        }),
      );
    });

    it("deve bloquear FARMACIA nas rotas de manutenção", async () => {
      const agent = await createFarmaciaAgent(app);

      const response = await agent.get("/api/manutencao/jobs").expect(403);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "FORBIDDEN",
          message: "Sem permissão para aceder a este recurso.",
        }),
      );
    });

    it("deve permitir ADMIN listar jobs de manutenção", async () => {
      const agent = await createAdminAgent(app);

      const response = await agent.get("/api/manutencao/jobs").expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({
              key: "receita-expiry",
              schedule: "daily",
              actions: expect.arrayContaining(["preview", "run"]),
            }),
            expect.objectContaining({
              key: "higiene",
              schedule: "monthly",
              actions: expect.arrayContaining(["preview", "run"]),
            }),
            expect.objectContaining({
              key: "purge-history",
              schedule: "monthly",
              actions: expect.arrayContaining(["preview", "run"]),
            }),
          ]),
        }),
      );
    });
  });

  describe("Previews dos jobs", () => {
    it("deve fazer preview do job receita-expiry", async () => {
      const agent = await createAdminAgent(app);

      const response = await agent
        .get("/api/manutencao/jobs/receita-expiry/preview")
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          job: "receita-expiry",
          mode: "preview",
          result: expect.objectContaining({
            checkedAt: expect.any(String),
            expiredLines: expect.any(Number),
            pendingItemsFromExpiredLines: expect.any(Number),
            affectedPedidos: expect.any(Number),
            pendingItemsFromAffectedPedidos: expect.any(Number),
          }),
        }),
      );
    });

    it("deve fazer preview do job higiene com offsetMonths", async () => {
      const agent = await createAdminAgent(app);

      const response = await agent
        .get("/api/manutencao/jobs/higiene/preview?offsetMonths=12")
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          job: "higiene",
          mode: "preview",
          options: expect.objectContaining({
            offsetMonths: 12,
          }),
          result: expect.objectContaining({
            cutoffDate: expect.any(String),
            offsetMonths: 12,
            candidatos: expect.any(Number),
          }),
        }),
      );
    });

    it("deve fazer preview do job purge-history com offsetMonths", async () => {
      const agent = await createAdminAgent(app);

      const response = await agent
        .get("/api/manutencao/jobs/purge-history/preview?offsetMonths=6")
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          job: "purge-history",
          mode: "preview",
          options: expect.objectContaining({
            offsetMonths: 6,
          }),
          result: expect.objectContaining({
            cutoffDate: expect.any(String),
            offsetMonths: 6,
            regularizacoes: expect.any(Number),
            eventos: expect.any(Number),
            pedidos: expect.any(Number),
            pedidoItens: expect.any(Number),
            dispensas: expect.any(Number),
          }),
        }),
      );
    });
  });

  describe("Validação de parâmetros", () => {
    it("deve rejeitar offsetMonths inválido no preview de higiene", async () => {
      const agent = await createAdminAgent(app);

      const response = await agent
        .get("/api/manutencao/jobs/higiene/preview?offsetMonths=abc")
        .expect(400);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "BAD_REQUEST",
          message: "O parâmetro 'offsetMonths' deve ser um número válido.",
        }),
      );
    });

    it("deve rejeitar offsetMonths inválido no preview de purge-history", async () => {
      const agent = await createAdminAgent(app);

      const response = await agent
        .get("/api/manutencao/jobs/purge-history/preview?offsetMonths=abc")
        .expect(400);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "BAD_REQUEST",
          message: "O parâmetro 'offsetMonths' deve ser um número válido.",
        }),
      );
    });
  });
});
