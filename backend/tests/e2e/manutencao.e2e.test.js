// backend/tests/e2e/manutencao.e2e.test.js
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

  describe("Execução dos jobs", () => {
    it("deve executar o job receita-expiry com confirmação", async () => {
      const agent = await createAdminAgent(app);

      const response = await agent
        .post("/api/manutencao/jobs/receita-expiry/run")
        .send({
          confirm: "RUN_RECEITA_EXPIRY",
        })
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          job: "receita-expiry",
          mode: "run",
          result: expect.objectContaining({
            checkedAt: expect.any(String),
            expiredLines: expect.any(Number),
            pendingItemsFromExpiredLines: expect.any(Number),
            affectedPedidos: expect.any(Number),
            pendingItemsFromAffectedPedidos: expect.any(Number),
            canceledPedidoItems: expect.any(Number),
            canceledPedidos: expect.any(Number),
          }),
        }),
      );
    });

    it("deve executar o job higiene com confirmação, offsetMonths e anonymize false", async () => {
      const agent = await createAdminAgent(app);

      const response = await agent
        .post("/api/manutencao/jobs/higiene/run")
        .send({
          confirm: "RUN_HIGIENE",
          offsetMonths: 9999,
          anonymize: false,
        })
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          job: "higiene",
          mode: "run",
          options: expect.objectContaining({
            offsetMonths: 9999,
            anonymize: false,
          }),
          result: expect.objectContaining({
            checkedAt: expect.any(String),
            cutoffDate: expect.any(String),
            offsetMonths: 9999,
            anonymizeRequested: false,
            anonymizeApplied: false,
            atualizados: expect.any(Number),
          }),
        }),
      );
    });

    it("deve executar o job purge-history com confirmação, backup confirmado e offsetMonths seguro", async () => {
      const agent = await createAdminAgent(app);

      const response = await agent
        .post("/api/manutencao/jobs/purge-history/run")
        .send({
          confirm: "RUN_PURGE_HISTORY",
          backupConfirmed: true,
          offsetMonths: 9999,
        })
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          job: "purge-history",
          mode: "run",
          options: expect.objectContaining({
            offsetMonths: 9999,
          }),
          result: expect.objectContaining({
            checkedAt: expect.any(String),
            cutoffDate: expect.any(String),
            offsetMonths: 9999,
            regularizacoes: expect.any(Number),
            eventos: expect.any(Number),
            pedidos: expect.any(Number),
            pedidoItens: expect.any(Number),
            dispensas: expect.any(Number),
            regularizacoesDesvinculadas: expect.any(Number),
          }),
        }),
      );
    });
  });

  describe("Validação de confirmações", () => {
    it("deve rejeitar execução de receita-expiry sem confirmação", async () => {
      const agent = await createAdminAgent(app);

      const response = await agent
        .post("/api/manutencao/jobs/receita-expiry/run")
        .send({})
        .expect(400);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "BAD_REQUEST",
          message: 'Confirmação inválida. Envia confirm="RUN_RECEITA_EXPIRY".',
        }),
      );
    });

    it("deve rejeitar execução de higiene sem confirmação", async () => {
      const agent = await createAdminAgent(app);

      const response = await agent
        .post("/api/manutencao/jobs/higiene/run")
        .send({
          offsetMonths: 9999,
          anonymize: false,
        })
        .expect(400);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "BAD_REQUEST",
          message: 'Confirmação inválida. Envia confirm="RUN_HIGIENE".',
        }),
      );
    });

    it("deve rejeitar execução de purge-history sem confirmação", async () => {
      const agent = await createAdminAgent(app);

      const response = await agent
        .post("/api/manutencao/jobs/purge-history/run")
        .send({
          backupConfirmed: true,
          offsetMonths: 9999,
        })
        .expect(400);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "BAD_REQUEST",
          message: 'Confirmação inválida. Envia confirm="RUN_PURGE_HISTORY".',
        }),
      );
    });

    it("deve rejeitar execução de purge-history sem backup confirmado", async () => {
      const agent = await createAdminAgent(app);

      const response = await agent
        .post("/api/manutencao/jobs/purge-history/run")
        .send({
          confirm: "RUN_PURGE_HISTORY",
          offsetMonths: 9999,
        })
        .expect(400);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "BAD_REQUEST",
          message:
            "Para executar purge-history, confirma backupConfirmed=true.",
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

    it("deve rejeitar offsetMonths inválido no run de higiene", async () => {
      const agent = await createAdminAgent(app);

      const response = await agent
        .post("/api/manutencao/jobs/higiene/run")
        .send({
          confirm: "RUN_HIGIENE",
          offsetMonths: "abc",
        })
        .expect(400);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "BAD_REQUEST",
          message: "O parâmetro 'offsetMonths' deve ser um número válido.",
        }),
      );
    });

    it("deve rejeitar offsetMonths inválido no run de purge-history", async () => {
      const agent = await createAdminAgent(app);

      const response = await agent
        .post("/api/manutencao/jobs/purge-history/run")
        .send({
          confirm: "RUN_PURGE_HISTORY",
          backupConfirmed: true,
          offsetMonths: "abc",
        })
        .expect(400);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "BAD_REQUEST",
          message: "O parâmetro 'offsetMonths' deve ser um número válido.",
        }),
      );
    });
  });

  describe("Rotas inválidas", () => {
    it("deve devolver 404 para job inexistente", async () => {
      const agent = await createAdminAgent(app);

      const response = await agent
        .get("/api/manutencao/jobs/job-inexistente/preview")
        .expect(404);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "ROUTE_NOT_FOUND",
          message: "Rota não encontrada.",
          path: "/api/manutencao/jobs/job-inexistente/preview",
        }),
      );
    });

    it("deve devolver 404 para ação inexistente de job válido", async () => {
      const agent = await createAdminAgent(app);

      const response = await agent
        .post("/api/manutencao/jobs/higiene/acao-inexistente")
        .expect(404);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "ROUTE_NOT_FOUND",
          message: "Rota não encontrada.",
          path: "/api/manutencao/jobs/higiene/acao-inexistente",
        }),
      );
    });
  });
});
