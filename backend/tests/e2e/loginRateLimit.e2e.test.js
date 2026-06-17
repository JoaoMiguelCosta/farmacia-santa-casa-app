// backend/tests/e2e/loginRateLimit.e2e.test.js
const request = require("supertest");

const { env } = require("../../src/config/env");
const { getTestApp } = require("../helpers/app");

function createUniqueEmail(prefix = "rate-limit-e2e") {
  const timestamp = Date.now();
  const random = Math.floor(1000 + Math.random() * 9000);

  return `${prefix}-${timestamp}-${random}@example.local`;
}

describe("Login rate limit E2E", () => {
  const app = getTestApp();

  it("deve limitar tentativas de login mesmo com x-forwarded-for manipulado quando trust proxy está inativo", async () => {
    const maxAttempts = env.AUTH_LOGIN_RATE_LIMIT_MAX;
    const email = createUniqueEmail();

    expect(maxAttempts).toBeGreaterThan(0);

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      await request(app)
        .post("/api/auth/login")
        .set("X-Forwarded-For", `203.0.113.${attempt + 1}`)
        .send({
          email,
          password: "PasswordErrada123!",
        })
        .expect(401);
    }

    const response = await request(app)
      .post("/api/auth/login")
      .set("X-Forwarded-For", "198.51.100.99")
      .send({
        email,
        password: "PasswordErrada123!",
      })
      .expect(429);

    expect(response.headers["retry-after"]).toEqual(expect.any(String));

    expect(response.body).toEqual(
      expect.objectContaining({
        error: "TOO_MANY_REQUESTS",
        message:
          "Demasiadas tentativas de login. Aguarda alguns minutos e tenta novamente.",
        retryAfter: expect.any(Number),
      }),
    );
  });
});
