// backend/tests/e2e/securityHeaders.e2e.test.js
const request = require("supertest");

const { getTestApp } = require("../helpers/app");

describe("Security headers E2E", () => {
  const app = getTestApp();

  it("deve aplicar headers de segurança nas respostas públicas", async () => {
    const response = await request(app).get("/api/health/live").expect(200);

    expect(response.headers["x-powered-by"]).toBeUndefined();

    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["referrer-policy"]).toEqual(expect.any(String));
    expect(response.headers["x-frame-options"]).toEqual(expect.any(String));
    expect(response.headers["cross-origin-resource-policy"]).toEqual(
      expect.any(String),
    );
    expect(response.headers["content-security-policy"]).toEqual(
      expect.any(String),
    );
  });

  it("deve manter CORS funcional para origins permitidas", async () => {
    const response = await request(app)
      .get("/api/health/live")
      .set("Origin", "http://localhost:5173")
      .expect(200);

    expect(response.headers["access-control-allow-origin"]).toBe(
      "http://localhost:5173",
    );
    expect(response.headers["access-control-allow-credentials"]).toBe("true");
    expect(response.headers.vary).toContain("Origin");
  });
});
