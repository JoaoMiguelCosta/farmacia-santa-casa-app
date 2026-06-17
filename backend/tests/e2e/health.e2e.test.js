// backend/tests/e2e/health.e2e.test.js
const request = require("supertest");

const { getTestApp } = require("../helpers/app");
const {
  createAdminAgent,
  createFarmaciaAgent,
  createSantaCasaAgent,
} = require("../helpers/auth");

describe("Health E2E", () => {
  const app = getTestApp();

  describe("GET /api/health/live", () => {
    it("deve permitir health live sem sessão", async () => {
      const response = await request(app).get("/api/health/live").expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          status: "ok",
          service: "farmacia-santacasa-api",
          check: "live",
          timestamp: expect.any(String),
        }),
      );
    });
  });

  describe("GET /api/health/ready", () => {
    it("deve permitir health ready sem sessão e confirmar base de dados", async () => {
      const response = await request(app).get("/api/health/ready").expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          status: "ok",
          service: "farmacia-santacasa-api",
          check: "ready",
          database: "ok",
          timestamp: expect.any(String),
        }),
      );
    });
  });

  describe("GET /api/health", () => {
    it("deve manter o health geral protegido sem sessão", async () => {
      const response = await request(app).get("/api/health").expect(401);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "UNAUTHORIZED",
        }),
      );
    });

    it("deve permitir health geral com ADMIN", async () => {
      const agent = await createAdminAgent(app);

      const response = await agent.get("/api/health").expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          status: "ok",
          service: "farmacia-santacasa-api",
          timestamp: expect.any(String),
        }),
      );
    });

    it("deve bloquear SANTACASA no health geral", async () => {
      const agent = await createSantaCasaAgent(app);

      const response = await agent.get("/api/health").expect(403);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "FORBIDDEN",
          message: "Sem permissão para aceder a este recurso.",
        }),
      );
    });

    it("deve bloquear FARMACIA no health geral", async () => {
      const agent = await createFarmaciaAgent(app);

      const response = await agent.get("/api/health").expect(403);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "FORBIDDEN",
          message: "Sem permissão para aceder a este recurso.",
        }),
      );
    });
  });
});
