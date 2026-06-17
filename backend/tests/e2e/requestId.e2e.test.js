// backend/tests/e2e/requestId.e2e.test.js
const request = require("supertest");

const { getTestApp } = require("../helpers/app");

describe("Request ID E2E", () => {
  const app = getTestApp();

  it("deve adicionar X-Request-Id quando o pedido não envia um identificador", async () => {
    const response = await request(app).get("/api/health/live").expect(200);

    expect(response.headers["x-request-id"]).toEqual(expect.any(String));
    expect(response.headers["x-request-id"].length).toBeGreaterThan(0);
  });

  it("deve preservar X-Request-Id válido enviado pelo cliente", async () => {
    const requestId = "test-request-id-123";

    const response = await request(app)
      .get("/api/health/live")
      .set("X-Request-Id", requestId)
      .expect(200);

    expect(response.headers["x-request-id"]).toBe(requestId);
  });

  it("deve expor X-Request-Id no CORS para origins permitidas", async () => {
    const response = await request(app)
      .get("/api/health/live")
      .set("Origin", "http://localhost:5173")
      .expect(200);

    expect(response.headers["access-control-expose-headers"]).toContain(
      "X-Request-Id",
    );
    expect(response.headers["x-request-id"]).toEqual(expect.any(String));
  });

  it("deve devolver X-Request-Id também em respostas de erro", async () => {
    const response = await request(app)
      .get("/api/rota-inexistente")
      .expect(404);

    expect(response.headers["x-request-id"]).toEqual(expect.any(String));

    expect(response.body).toEqual(
      expect.objectContaining({
        error: "ROUTE_NOT_FOUND",
        message: "Rota não encontrada.",
        path: "/api/rota-inexistente",
      }),
    );
  });
});
