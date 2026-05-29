const request = require("supertest");

const { getTestApp } = require("../helpers/app");
const {
  createFarmaciaAgent,
  createSantaCasaAgent,
} = require("../helpers/auth");
const { createUniqueUtentePayload } = require("../fixtures/utentes.fixture");

async function createUtente(agent, prefix = "Utente Medicação Habitual") {
  const payload = createUniqueUtentePayload(prefix);

  const response = await agent
    .post("/api/santacasa/utentes")
    .send(payload)
    .expect(201);

  return response.body.data;
}

async function clearMedicacaoHabitual(agent, utenteId) {
  await agent
    .delete(`/api/santacasa/utentes/${utenteId}/medicacao-habitual`)
    .expect(204);
}

async function deleteUtente(agent, utenteId) {
  await agent.delete(`/api/santacasa/utentes/${utenteId}`).expect(204);
}

async function cleanupUtente(agent, utenteId) {
  if (!utenteId) return;

  await clearMedicacaoHabitual(agent, utenteId);
  await deleteUtente(agent, utenteId);
}

describe("Medicação habitual E2E", () => {
  const app = getTestApp();

  describe("Permissões", () => {
    it("deve bloquear acesso sem autenticação", async () => {
      const response = await request(app)
        .get("/api/santacasa/utentes/utente-teste/medicacao-habitual")
        .expect(401);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "UNAUTHORIZED",
        }),
      );
    });

    it("deve bloquear FARMACIA nas rotas de medicação habitual da Santa Casa", async () => {
      const agent = await createFarmaciaAgent(app);

      const response = await agent
        .get("/api/santacasa/utentes/utente-teste/medicacao-habitual")
        .expect(403);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "FORBIDDEN",
          message: "Sem permissão para aceder a este recurso.",
        }),
      );
    });
  });

  describe("CRUD", () => {
    it("deve criar, listar e remover medicação habitual", async () => {
      const agent = await createSantaCasaAgent(app);
      const utente = await createUtente(agent);

      try {
        const createResponse = await agent
          .post(`/api/santacasa/utentes/${utente.id}/medicacao-habitual`)
          .send({
            medicamento: "Cipralex",
          })
          .expect(201);

        expect(createResponse.body.data).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            utenteId: utente.id,
            medicamento: "Cipralex",
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          }),
        );

        const medicacaoId = createResponse.body.data.id;

        const listResponse = await agent
          .get(`/api/santacasa/utentes/${utente.id}/medicacao-habitual`)
          .expect(200);

        expect(listResponse.body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: medicacaoId,
              utenteId: utente.id,
              medicamento: "Cipralex",
            }),
          ]),
        );

        await agent
          .delete(
            `/api/santacasa/utentes/${utente.id}/medicacao-habitual/${medicacaoId}`,
          )
          .expect(204);

        const afterDeleteResponse = await agent
          .get(`/api/santacasa/utentes/${utente.id}/medicacao-habitual`)
          .expect(200);

        expect(afterDeleteResponse.body.data).toEqual([]);
      } finally {
        await cleanupUtente(agent, utente.id);
      }
    });

    it("deve impedir medicamentos duplicados por utente", async () => {
      const agent = await createSantaCasaAgent(app);
      const utente = await createUtente(agent, "Utente Duplicado Medicação");

      try {
        await agent
          .post(`/api/santacasa/utentes/${utente.id}/medicacao-habitual`)
          .send({
            medicamento: "Elvanse",
          })
          .expect(201);

        const duplicateResponse = await agent
          .post(`/api/santacasa/utentes/${utente.id}/medicacao-habitual`)
          .send({
            medicamento: "elvanse",
          })
          .expect(409);

        expect(duplicateResponse.body).toEqual(
          expect.objectContaining({
            error: "CONFLICT",
            message: "Este medicamento já existe na medicação habitual.",
          }),
        );
      } finally {
        await cleanupUtente(agent, utente.id);
      }
    });

    it("deve validar medicamento obrigatório", async () => {
      const agent = await createSantaCasaAgent(app);
      const utente = await createUtente(agent, "Utente Validação Medicação");

      try {
        const response = await agent
          .post(`/api/santacasa/utentes/${utente.id}/medicacao-habitual`)
          .send({
            medicamento: "",
          })
          .expect(400);

        expect(response.body).toEqual(
          expect.objectContaining({
            error: "BAD_REQUEST",
            message: "O campo 'medicamento' é obrigatório.",
          }),
        );
      } finally {
        await cleanupUtente(agent, utente.id);
      }
    });

    it("deve apagar toda a medicação habitual do utente", async () => {
      const agent = await createSantaCasaAgent(app);
      const utente = await createUtente(agent, "Utente Limpar Medicação");

      try {
        await agent
          .post(`/api/santacasa/utentes/${utente.id}/medicacao-habitual`)
          .send({
            medicamento: "Paracetamol",
          })
          .expect(201);

        await agent
          .post(`/api/santacasa/utentes/${utente.id}/medicacao-habitual`)
          .send({
            medicamento: "Ibuprofeno",
          })
          .expect(201);

        await agent
          .delete(`/api/santacasa/utentes/${utente.id}/medicacao-habitual`)
          .expect(204);

        const listResponse = await agent
          .get(`/api/santacasa/utentes/${utente.id}/medicacao-habitual`)
          .expect(200);

        expect(listResponse.body.data).toEqual([]);
      } finally {
        await cleanupUtente(agent, utente.id);
      }
    });
  });
});
