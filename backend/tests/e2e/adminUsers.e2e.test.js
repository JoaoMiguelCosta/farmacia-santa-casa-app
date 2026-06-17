// backend/tests/e2e/adminUsers.e2e.test.js
const request = require("supertest");

const { getTestApp } = require("../helpers/app");
const {
  createAdminAgent,
  createFarmaciaAgent,
  createSantaCasaAgent,
} = require("../helpers/auth");

function createUniqueAdminUserPayload(prefix = "admin-users-e2e") {
  const timestamp = Date.now();
  const random = Math.floor(1000 + Math.random() * 9000);

  return {
    name: `Utilizador Teste ${timestamp} ${random}`,
    email: `${prefix}-${timestamp}-${random}@teste.local`,
    password: "Password123!",
    role: "SANTACASA",
  };
}

function getSeedAdminEmail() {
  return process.env.SEED_ADMIN_EMAIL || "admin@sistema.local";
}

async function findCurrentAdminUser(agent) {
  const adminEmail = getSeedAdminEmail();

  const response = await agent
    .get(`/api/admin/users?search=${encodeURIComponent(adminEmail)}`)
    .expect(200);

  return response.body.data.find((user) => user.email === adminEmail);
}

async function cleanupUser(agent, userId) {
  if (!userId) return;

  try {
    await agent.patch(`/api/admin/users/${userId}/status`).send({
      isActive: false,
    });
  } catch {
    // Cleanup best-effort.
  }

  try {
    await agent.delete(`/api/admin/users/${userId}`);
  } catch {
    // Cleanup best-effort.
  }
}

describe("Admin Users E2E", () => {
  const app = getTestApp();

  describe("Permissões", () => {
    it("deve bloquear acesso sem sessão", async () => {
      const response = await request(app).get("/api/admin/users").expect(401);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "UNAUTHORIZED",
        }),
      );
    });

    it("deve bloquear SANTACASA nas rotas de admin", async () => {
      const agent = await createSantaCasaAgent(app);

      const response = await agent.get("/api/admin/users").expect(403);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "FORBIDDEN",
          message: "Sem permissão para aceder a este recurso.",
        }),
      );
    });

    it("deve bloquear FARMACIA nas rotas de admin", async () => {
      const agent = await createFarmaciaAgent(app);

      const response = await agent.get("/api/admin/users").expect(403);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "FORBIDDEN",
          message: "Sem permissão para aceder a este recurso.",
        }),
      );
    });

    it("deve permitir ADMIN listar utilizadores", async () => {
      const agent = await createAdminAgent(app);

      const response = await agent.get("/api/admin/users").expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          data: expect.any(Array),
          meta: expect.objectContaining({
            total: expect.any(Number),
            skip: expect.any(Number),
            take: expect.any(Number),
          }),
          params: expect.objectContaining({
            search: expect.any(String),
            role: expect.any(String),
          }),
        }),
      );
    });
  });

  describe("CRUD de utilizadores", () => {
    it("deve criar, listar, atualizar, alterar password, desativar e remover utilizador", async () => {
      const adminAgent = await createAdminAgent(app);
      const payload = createUniqueAdminUserPayload();

      let createdUserId = null;

      try {
        const createResponse = await adminAgent
          .post("/api/admin/users")
          .send(payload)
          .expect(201);

        expect(createResponse.body.data).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            name: payload.name,
            email: payload.email,
            role: payload.role,
            isActive: true,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          }),
        );

        createdUserId = createResponse.body.data.id;

        const listResponse = await adminAgent
          .get(`/api/admin/users?search=${encodeURIComponent(payload.email)}`)
          .expect(200);

        expect(listResponse.body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: createdUserId,
              email: payload.email,
            }),
          ]),
        );

        const updatedName = `${payload.name} Atualizado`;
        const updatedEmail = `updated-${payload.email}`;

        const updateResponse = await adminAgent
          .patch(`/api/admin/users/${createdUserId}`)
          .send({
            name: updatedName,
            email: updatedEmail,
            role: "FARMACIA",
          })
          .expect(200);

        expect(updateResponse.body.data).toEqual(
          expect.objectContaining({
            id: createdUserId,
            name: updatedName,
            email: updatedEmail,
            role: "FARMACIA",
            isActive: true,
          }),
        );

        await adminAgent
          .patch(`/api/admin/users/${createdUserId}/password`)
          .send({
            password: "NovaPassword123!",
          })
          .expect(200);

        const loginResponse = await request(app)
          .post("/api/auth/login")
          .send({
            email: updatedEmail,
            password: "NovaPassword123!",
          })
          .expect(200);

        expect(loginResponse.body.user).toEqual(
          expect.objectContaining({
            id: createdUserId,
            email: updatedEmail,
            role: "FARMACIA",
            isActive: true,
          }),
        );

        const deactivateResponse = await adminAgent
          .patch(`/api/admin/users/${createdUserId}/status`)
          .send({
            isActive: false,
          })
          .expect(200);

        expect(deactivateResponse.body.data).toEqual(
          expect.objectContaining({
            id: createdUserId,
            isActive: false,
          }),
        );

        const deleteResponse = await adminAgent
          .delete(`/api/admin/users/${createdUserId}`)
          .expect(200);

        expect(deleteResponse.body.data).toEqual(
          expect.objectContaining({
            id: createdUserId,
            email: updatedEmail,
            isActive: false,
          }),
        );

        createdUserId = null;
      } finally {
        await cleanupUser(adminAgent, createdUserId);
      }
    });

    it("deve impedir criar utilizador com email duplicado", async () => {
      const agent = await createAdminAgent(app);
      const payload = createUniqueAdminUserPayload("duplicado-admin-users-e2e");

      let createdUserId = null;

      try {
        const createResponse = await agent
          .post("/api/admin/users")
          .send(payload)
          .expect(201);

        createdUserId = createResponse.body.data.id;

        const duplicateResponse = await agent
          .post("/api/admin/users")
          .send({
            ...payload,
            name: `${payload.name} Duplicado`,
          })
          .expect(409);

        expect(duplicateResponse.body).toEqual(
          expect.objectContaining({
            error: "CONFLICT",
            message: "Já existe um utilizador com este email.",
          }),
        );
      } finally {
        await cleanupUser(agent, createdUserId);
      }
    });

    it("deve impedir remover utilizador ativo", async () => {
      const agent = await createAdminAgent(app);
      const payload = createUniqueAdminUserPayload("ativo-admin-users-e2e");

      let createdUserId = null;

      try {
        const createResponse = await agent
          .post("/api/admin/users")
          .send(payload)
          .expect(201);

        createdUserId = createResponse.body.data.id;

        const deleteResponse = await agent
          .delete(`/api/admin/users/${createdUserId}`)
          .expect(409);

        expect(deleteResponse.body).toEqual(
          expect.objectContaining({
            error: "CONFLICT",
            message: "Só é possível remover utilizadores desativados.",
          }),
        );
      } finally {
        await cleanupUser(agent, createdUserId);
      }
    });

    it("deve impedir ADMIN alterar a própria role", async () => {
      const agent = await createAdminAgent(app);
      const adminUser = await findCurrentAdminUser(agent);

      expect(adminUser).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          email: getSeedAdminEmail(),
          role: "ADMIN",
        }),
      );

      const response = await agent
        .patch(`/api/admin/users/${adminUser.id}`)
        .send({
          name: adminUser.name,
          email: adminUser.email,
          role: "SANTACASA",
        })
        .expect(403);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "FORBIDDEN",
          message: "Não podes alterar a role da tua própria conta.",
        }),
      );
    });

    it("deve permitir ADMIN atualizar os próprios dados se mantiver a role", async () => {
      const agent = await createAdminAgent(app);
      const adminUser = await findCurrentAdminUser(agent);

      expect(adminUser).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          email: getSeedAdminEmail(),
          role: "ADMIN",
        }),
      );

      const response = await agent
        .patch(`/api/admin/users/${adminUser.id}`)
        .send({
          name: adminUser.name,
          email: adminUser.email,
          role: "ADMIN",
        })
        .expect(200);

      expect(response.body.data).toEqual(
        expect.objectContaining({
          id: adminUser.id,
          email: adminUser.email,
          role: "ADMIN",
        }),
      );
    });
  });
});
