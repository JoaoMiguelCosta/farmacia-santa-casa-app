const request = require("supertest");

const { getTestApp } = require("../helpers/app");
const { TEST_USERS } = require("../fixtures/users.fixture");

describe("Auth E2E", () => {
  const app = getTestApp();

  describe("POST /api/auth/login", () => {
    it("deve fazer login como ADMIN e devolver cookie HTTP-only", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: TEST_USERS.admin.email,
          password: TEST_USERS.admin.password,
        })
        .expect(200);

      expect(response.body).toEqual({
        user: expect.objectContaining({
          email: TEST_USERS.admin.email,
          role: "ADMIN",
          isActive: true,
        }),
      });

      const cookies = response.headers["set-cookie"];

      expect(cookies).toBeDefined();
      expect(cookies.join(";")).toContain("HttpOnly");
    });

    it("deve fazer login como SANTACASA", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: TEST_USERS.santacasa.email,
          password: TEST_USERS.santacasa.password,
        })
        .expect(200);

      expect(response.body.user).toEqual(
        expect.objectContaining({
          email: TEST_USERS.santacasa.email,
          role: "SANTACASA",
          isActive: true,
        }),
      );
    });

    it("deve fazer login como FARMACIA", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: TEST_USERS.farmacia.email,
          password: TEST_USERS.farmacia.password,
        })
        .expect(200);

      expect(response.body.user).toEqual(
        expect.objectContaining({
          email: TEST_USERS.farmacia.email,
          role: "FARMACIA",
          isActive: true,
        }),
      );
    });

    it("deve rejeitar credenciais inválidas", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: TEST_USERS.admin.email,
          password: "password-errada",
        })
        .expect(401);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "UNAUTHORIZED",
          message: "Credenciais inválidas.",
        }),
      );
    });

    it("deve rejeitar email inválido como credenciais inválidas", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "email-invalido",
          password: TEST_USERS.admin.password,
        })
        .expect(401);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "UNAUTHORIZED",
          message: "Credenciais inválidas.",
        }),
      );
    });
  });

  describe("GET /api/auth/me", () => {
    it("deve rejeitar pedido sem sessão", async () => {
      const response = await request(app).get("/api/auth/me").expect(401);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "UNAUTHORIZED",
          message: "Sessão em falta.",
        }),
      );
    });

    it("deve devolver utilizador autenticado com cookie válido", async () => {
      const agent = request.agent(app);

      await agent
        .post("/api/auth/login")
        .send({
          email: TEST_USERS.admin.email,
          password: TEST_USERS.admin.password,
        })
        .expect(200);

      const response = await agent.get("/api/auth/me").expect(200);

      expect(response.body.user).toEqual(
        expect.objectContaining({
          email: TEST_USERS.admin.email,
          role: "ADMIN",
          isActive: true,
        }),
      );
    });
  });

  describe("POST /api/auth/logout", () => {
    it("deve terminar sessão", async () => {
      const agent = request.agent(app);

      await agent
        .post("/api/auth/login")
        .send({
          email: TEST_USERS.admin.email,
          password: TEST_USERS.admin.password,
        })
        .expect(200);

      const response = await agent.post("/api/auth/logout").expect(200);

      expect(response.body).toEqual({
        message: "Sessão terminada com sucesso.",
      });

      const cookies = response.headers["set-cookie"];

      expect(cookies).toBeDefined();
    });
  });

  describe("Rotas protegidas", () => {
    it("deve bloquear /api/health sem sessão", async () => {
      const response = await request(app).get("/api/health").expect(401);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "UNAUTHORIZED",
        }),
      );
    });

    it("deve permitir /api/health com ADMIN", async () => {
      const agent = request.agent(app);

      await agent
        .post("/api/auth/login")
        .send({
          email: TEST_USERS.admin.email,
          password: TEST_USERS.admin.password,
        })
        .expect(200);

      const response = await agent.get("/api/health").expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          status: "ok",
          service: "farmacia-santacasa-api",
        }),
      );
    });

    it("deve bloquear FARMACIA ao aceder a /api/santacasa/health", async () => {
      const agent = request.agent(app);

      await agent
        .post("/api/auth/login")
        .send({
          email: TEST_USERS.farmacia.email,
          password: TEST_USERS.farmacia.password,
        })
        .expect(200);

      const response = await agent.get("/api/santacasa/health").expect(403);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "FORBIDDEN",
          message: "Sem permissão para aceder a este recurso.",
        }),
      );
    });

    it("deve bloquear SANTACASA ao aceder a /api/farmacia/health", async () => {
      const agent = request.agent(app);

      await agent
        .post("/api/auth/login")
        .send({
          email: TEST_USERS.santacasa.email,
          password: TEST_USERS.santacasa.password,
        })
        .expect(200);

      const response = await agent.get("/api/farmacia/health").expect(403);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "FORBIDDEN",
          message: "Sem permissão para aceder a este recurso.",
        }),
      );
    });
  });
});
