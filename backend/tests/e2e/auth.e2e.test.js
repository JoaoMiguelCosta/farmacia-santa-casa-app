// backend/tests/e2e/auth.e2e.test.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const request = require("supertest");

const { AUTH_CONFIG } = require("../../src/config/auth.config");
const { prisma } = require("../../src/db/prisma");

const { getTestApp } = require("../helpers/app");
const { TEST_USERS } = require("../fixtures/users.fixture");

function getSetCookieHeader(response) {
  return response.headers["set-cookie"] || [];
}

function getCookieHeaderString(response) {
  return getSetCookieHeader(response).join("; ");
}

function expectAuthCookie(response) {
  const cookies = getSetCookieHeader(response);
  const cookieString = getCookieHeaderString(response);

  expect(cookies.length).toBeGreaterThan(0);
  expect(cookieString).toContain(`${AUTH_CONFIG.cookie.name}=`);
  expect(cookieString).toContain("HttpOnly");
  expect(cookieString).toContain("Path=/");
}

function expectNoAuthCookie(response) {
  expect(response.headers["set-cookie"]).toBeUndefined();
}

function createAuthCookie(token) {
  return `${AUTH_CONFIG.cookie.name}=${token}`;
}

function signAuthToken(payload, options = {}) {
  return jwt.sign(payload, AUTH_CONFIG.jwt.secret, {
    expiresIn: AUTH_CONFIG.jwt.expiresIn,
    ...options,
  });
}

function createUniqueEmail(prefix = "auth-e2e") {
  const timestamp = Date.now();
  const random = Math.floor(1000 + Math.random() * 9000);

  return `${prefix}-${timestamp}-${random}@example.local`;
}

async function createInactiveUser() {
  const email = createUniqueEmail("inactive-auth-e2e");
  const password = "Inactive123!";
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name: "Utilizador Inativo Auth E2E",
      email,
      passwordHash,
      role: "SANTACASA",
      isActive: false,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  return {
    ...user,
    password,
  };
}

async function deleteUser(userId) {
  if (!userId) return;

  await prisma.user.deleteMany({
    where: {
      id: userId,
    },
  });
}

async function login(agentOrRequest, user) {
  return agentOrRequest
    .post("/api/auth/login")
    .send({
      email: user.email,
      password: user.password,
    })
    .expect(200);
}

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
          id: expect.any(String),
          name: expect.any(String),
          email: TEST_USERS.admin.email,
          role: "ADMIN",
          isActive: true,
        }),
      });

      expect(response.body.user).not.toHaveProperty("passwordHash");
      expect(response.body.user).not.toHaveProperty("password");

      expectAuthCookie(response);
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
          id: expect.any(String),
          name: expect.any(String),
          email: TEST_USERS.santacasa.email,
          role: "SANTACASA",
          isActive: true,
        }),
      );

      expect(response.body.user).not.toHaveProperty("passwordHash");
      expectAuthCookie(response);
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
          id: expect.any(String),
          name: expect.any(String),
          email: TEST_USERS.farmacia.email,
          role: "FARMACIA",
          isActive: true,
        }),
      );

      expect(response.body.user).not.toHaveProperty("passwordHash");
      expectAuthCookie(response);
    });

    it("deve rejeitar credenciais inválidas sem devolver cookie", async () => {
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

      expectNoAuthCookie(response);
    });

    it("deve rejeitar email inválido como credenciais inválidas", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: createUniqueEmail("email-invalido-auth-e2e"),
          password: TEST_USERS.admin.password,
        })
        .expect(401);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "UNAUTHORIZED",
          message: "Credenciais inválidas.",
        }),
      );

      expectNoAuthCookie(response);
    });

    it("deve rejeitar utilizador inativo", async () => {
      const inactiveUser = await createInactiveUser();

      try {
        const response = await request(app)
          .post("/api/auth/login")
          .send({
            email: inactiveUser.email,
            password: inactiveUser.password,
          })
          .expect(401);

        expect(response.body).toEqual(
          expect.objectContaining({
            error: "UNAUTHORIZED",
            message: "Credenciais inválidas.",
          }),
        );

        expectNoAuthCookie(response);
      } finally {
        await deleteUser(inactiveUser.id);
      }
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

      await login(agent, TEST_USERS.admin);

      const response = await agent.get("/api/auth/me").expect(200);

      expect(response.body.user).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          email: TEST_USERS.admin.email,
          role: "ADMIN",
          isActive: true,
        }),
      );

      expect(response.body.user).not.toHaveProperty("passwordHash");
    });

    it("deve rejeitar cookie adulterado", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Cookie", [createAuthCookie("token-adulterado")])
        .expect(401);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "UNAUTHORIZED",
          message: "Sessão inválida ou expirada.",
        }),
      );
    });

    it("deve rejeitar token expirado", async () => {
      const expiredToken = signAuthToken(
        {
          sub: "user-id-expirado",
          role: "ADMIN",
        },
        {
          expiresIn: "-1s",
        },
      );

      const response = await request(app)
        .get("/api/auth/me")
        .set("Cookie", [createAuthCookie(expiredToken)])
        .expect(401);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "UNAUTHORIZED",
          message: "Sessão inválida ou expirada.",
        }),
      );
    });

    it("deve rejeitar token válido de utilizador inativo", async () => {
      const inactiveUser = await createInactiveUser();

      try {
        const token = signAuthToken({
          sub: inactiveUser.id,
          role: inactiveUser.role,
        });

        const response = await request(app)
          .get("/api/auth/me")
          .set("Cookie", [createAuthCookie(token)])
          .expect(401);

        expect(response.body).toEqual(
          expect.objectContaining({
            error: "UNAUTHORIZED",
            message: "Utilizador inválido ou inativo.",
          }),
        );
      } finally {
        await deleteUser(inactiveUser.id);
      }
    });
  });

  describe("POST /api/auth/logout", () => {
    it("deve terminar sessão e limpar cookie", async () => {
      const agent = request.agent(app);

      await login(agent, TEST_USERS.admin);

      const response = await agent.post("/api/auth/logout").expect(200);

      expect(response.body).toEqual({
        message: "Sessão terminada com sucesso.",
      });

      const cookieString = getCookieHeaderString(response);

      expect(cookieString).toContain(`${AUTH_CONFIG.cookie.name}=`);
      expect(cookieString).toContain("Expires=Thu, 01 Jan 1970");
      expect(cookieString).toContain("Path=/");
    });

    it("deve deixar de permitir /me depois do logout", async () => {
      const agent = request.agent(app);

      await login(agent, TEST_USERS.admin);

      await agent.post("/api/auth/logout").expect(200);

      const response = await agent.get("/api/auth/me").expect(401);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "UNAUTHORIZED",
          message: "Sessão em falta.",
        }),
      );
    });

    it("deve permitir logout mesmo sem sessão ativa", async () => {
      const response = await request(app).post("/api/auth/logout").expect(200);

      expect(response.body).toEqual({
        message: "Sessão terminada com sucesso.",
      });

      const cookieString = getCookieHeaderString(response);

      expect(cookieString).toContain(`${AUTH_CONFIG.cookie.name}=`);
      expect(cookieString).toContain("Expires=Thu, 01 Jan 1970");
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

      await login(agent, TEST_USERS.admin);

      const response = await agent.get("/api/health").expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          status: "ok",
          service: "farmacia-santacasa-api",
        }),
      );
    });

    it("deve permitir SANTACASA aceder ao health da Santa Casa", async () => {
      const agent = request.agent(app);

      await login(agent, TEST_USERS.santacasa);

      const response = await agent.get("/api/santacasa/health").expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          status: "ok",
          context: "santacasa",
        }),
      );
    });

    it("deve permitir FARMACIA aceder ao health da Farmácia", async () => {
      const agent = request.agent(app);

      await login(agent, TEST_USERS.farmacia);

      const response = await agent.get("/api/farmacia/health").expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          status: "ok",
          context: "farmacia",
        }),
      );
    });

    it("deve bloquear FARMACIA ao aceder a /api/santacasa/health", async () => {
      const agent = request.agent(app);

      await login(agent, TEST_USERS.farmacia);

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

      await login(agent, TEST_USERS.santacasa);

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
