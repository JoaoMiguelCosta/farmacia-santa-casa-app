// backend/tests/e2e/receitas.e2e.test.js
const request = require("supertest");

const { getTestApp } = require("../helpers/app");
const {
  createFarmaciaAgent,
  createSantaCasaAgent,
} = require("../helpers/auth");
const { createUniqueUtentePayload } = require("../fixtures/utentes.fixture");

let numero19Counter = 0;

function createUniqueMedicamento(prefix = "Medicamento Receita E2E") {
  const timestamp = Date.now();
  const random = Math.floor(1000 + Math.random() * 9000);

  return `${prefix} ${timestamp} ${random}`;
}

function makeNumero19(seed = Date.now()) {
  numero19Counter += 1;

  const timestampPart = String(seed).replace(/\D/g, "").slice(-13);
  const randomPart = String(Math.floor(10000 + Math.random() * 90000));
  const counterPart = String(numero19Counter).padStart(2, "0");

  return `${timestampPart}${randomPart}${counterPart}`
    .padEnd(19, "0")
    .slice(0, 19);
}

function getTodayInput() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createFutureDate(year = 2099) {
  return `${year}-12-31`;
}

async function createUtente(agent, prefix = "Utente Receita E2E") {
  const payload = createUniqueUtentePayload(prefix);

  const response = await agent
    .post("/api/santacasa/utentes")
    .send(payload)
    .expect(201);

  return response.body.data;
}

async function deleteUtente(agent, utenteId) {
  if (!utenteId) return;

  try {
    await agent.delete(`/api/santacasa/utentes/${utenteId}`);
  } catch {
    // Cleanup best-effort.
  }
}

async function createReceita(agent, utenteId, payload = {}) {
  const response = await agent
    .post(`/api/santacasa/utentes/${utenteId}/receitas`)
    .send({
      numero19: payload.numero19 || makeNumero19(),
      pinAcesso6: payload.pinAcesso6 || "123456",
      pinOpcao4: payload.pinOpcao4 || "1234",
      confirmRegularizacao: payload.confirmRegularizacao,
      linhas: payload.linhas || [
        {
          medicamento: payload.medicamento || createUniqueMedicamento(),
          quantidade: payload.quantidade || 2,
          validade: payload.validade || createFutureDate(),
        },
      ],
    })
    .expect(201);

  return response.body.data;
}

async function deleteReceitaLinha(agent, utenteId, linhaId) {
  if (!utenteId || !linhaId) return;

  try {
    await agent.delete(
      `/api/santacasa/utentes/${utenteId}/receitas/linhas/${linhaId}`,
    );
  } catch {
    // Cleanup best-effort.
  }
}

async function createExtra(agent, utenteId, payload = {}) {
  const response = await agent
    .post(`/api/santacasa/utentes/${utenteId}/extras`)
    .send({
      medicamento: payload.medicamento || createUniqueMedicamento(),
      quantidadeSolicitada: payload.quantidadeSolicitada || 1,
    })
    .expect(201);

  return response.body.data;
}

async function createPedido(agent, items) {
  const response = await agent
    .post("/api/santacasa/pedidos")
    .send({ items })
    .expect(201);

  return response.body.data;
}

async function cancelPedido(agent, pedidoId) {
  if (!pedidoId) return;

  try {
    await agent.post(`/api/santacasa/pedidos/${pedidoId}/cancelar`).send({
      motivo: "Cleanup E2E.",
    });
  } catch {
    // Cleanup best-effort.
  }
}

describe("Receitas E2E", () => {
  const app = getTestApp();

  describe("Permissões", () => {
    it("deve bloquear acesso sem sessão", async () => {
      const response = await request(app)
        .get("/api/santacasa/utentes/utente-teste/receitas")
        .expect(401);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "UNAUTHORIZED",
        }),
      );
    });

    it("deve bloquear FARMACIA nas rotas de receitas da Santa Casa", async () => {
      const agent = await createFarmaciaAgent(app);

      const response = await agent
        .get("/api/santacasa/utentes/utente-teste/receitas")
        .expect(403);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "FORBIDDEN",
          message: "Sem permissão para aceder a este recurso.",
        }),
      );
    });
  });

  describe("CRUD e validações", () => {
    it("deve criar, listar e remover linha de receita sem dependências", async () => {
      const agent = await createSantaCasaAgent(app);
      const utente = await createUtente(agent);
      const medicamento = createUniqueMedicamento();

      let linhaId = null;

      try {
        const createResponse = await agent
          .post(`/api/santacasa/utentes/${utente.id}/receitas`)
          .send({
            numero19: makeNumero19(),
            pinAcesso6: "123456",
            pinOpcao4: "1234",
            linhas: [
              {
                medicamento,
                quantidade: 3,
                validade: createFutureDate(),
              },
            ],
          })
          .expect(201);

        expect(createResponse.body.data).toEqual(
          expect.objectContaining({
            receitaId: expect.any(String),
            utenteId: utente.id,
            numero19: expect.any(String),
            pinAcesso6: "123456",
            pinOpcao4: "1234",
            linhas: expect.arrayContaining([
              expect.objectContaining({
                linhaId: expect.any(String),
                utenteId: utente.id,
                medicamento,
                quantidade: 3,
                quantidadeDispensada: 0,
                quantidadeReservadaPendente: 0,
                quantidadeRestante: 3,
                status: "ATIVA",
              }),
            ]),
            extrasResolvidos: expect.any(Array),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          }),
        );

        linhaId = createResponse.body.data.linhas[0].linhaId;

        const listResponse = await agent
          .get(`/api/santacasa/utentes/${utente.id}/receitas`)
          .expect(200);

        expect(listResponse.body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              linhaId,
              utenteId: utente.id,
              medicamento,
              quantidadeRestante: 3,
              status: "ATIVA",
            }),
          ]),
        );

        await agent
          .delete(
            `/api/santacasa/utentes/${utente.id}/receitas/linhas/${linhaId}`,
          )
          .expect(204);

        linhaId = null;

        const afterDeleteResponse = await agent
          .get(`/api/santacasa/utentes/${utente.id}/receitas`)
          .expect(200);

        expect(afterDeleteResponse.body.data).not.toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              medicamento,
            }),
          ]),
        );
      } finally {
        await deleteReceitaLinha(agent, utente.id, linhaId);
        await deleteUtente(agent, utente.id);
      }
    });

    it("deve impedir criar receita com número duplicado", async () => {
      const agent = await createSantaCasaAgent(app);
      const utente = await createUtente(agent, "Utente Receita Duplicada");
      const numero19 = makeNumero19();

      let linhaId = null;

      try {
        const receita = await createReceita(agent, utente.id, {
          numero19,
          medicamento: createUniqueMedicamento("Duplicado Receita E2E"),
          quantidade: 1,
        });

        linhaId = receita.linhas[0].linhaId;

        const response = await agent
          .post(`/api/santacasa/utentes/${utente.id}/receitas`)
          .send({
            numero19,
            pinAcesso6: "123456",
            pinOpcao4: "1234",
            linhas: [
              {
                medicamento: createUniqueMedicamento("Duplicado Receita E2E 2"),
                quantidade: 1,
                validade: createFutureDate(),
              },
            ],
          })
          .expect(409);

        expect(response.body).toEqual(
          expect.objectContaining({
            error: "CONFLICT",
            message: "Já existe uma receita com esse número.",
          }),
        );
      } finally {
        await deleteReceitaLinha(agent, utente.id, linhaId);
        await deleteUtente(agent, utente.id);
      }
    });

    it("deve impedir medicamentos repetidos na mesma receita", async () => {
      const agent = await createSantaCasaAgent(app);
      const utente = await createUtente(
        agent,
        "Utente Receita Medicamento Duplicado",
      );
      const medicamento = createUniqueMedicamento(
        "Medicamento Repetido Receita E2E",
      );

      try {
        const response = await agent
          .post(`/api/santacasa/utentes/${utente.id}/receitas`)
          .send({
            numero19: makeNumero19(),
            pinAcesso6: "123456",
            pinOpcao4: "1234",
            linhas: [
              {
                medicamento,
                quantidade: 1,
                validade: createFutureDate(),
              },
              {
                medicamento: medicamento.toLowerCase(),
                quantidade: 1,
                validade: createFutureDate(),
              },
            ],
          })
          .expect(400);

        expect(response.body).toEqual(
          expect.objectContaining({
            error: "BAD_REQUEST",
            message:
              "Não é permitido repetir o mesmo medicamento na mesma receita.",
          }),
        );
      } finally {
        await deleteUtente(agent, utente.id);
      }
    });

    it("deve aceitar validade igual ao dia atual", async () => {
      const agent = await createSantaCasaAgent(app);
      const utente = await createUtente(agent, "Utente Receita Hoje");

      let linhaId = null;

      try {
        const receita = await createReceita(agent, utente.id, {
          medicamento: createUniqueMedicamento("Validade Hoje Receita E2E"),
          quantidade: 1,
          validade: getTodayInput(),
        });

        linhaId = receita.linhas[0].linhaId;

        expect(receita.linhas[0]).toEqual(
          expect.objectContaining({
            linhaId,
            quantidade: 1,
            quantidadeRestante: 1,
            status: "ATIVA",
            validade: expect.any(String),
          }),
        );
      } finally {
        await deleteReceitaLinha(agent, utente.id, linhaId);
        await deleteUtente(agent, utente.id);
      }
    });

    it("deve bloquear remoção de linha associada a pedido pendente", async () => {
      const agent = await createSantaCasaAgent(app);
      const utente = await createUtente(
        agent,
        "Utente Receita Pedido Pendente",
      );

      let linhaId = null;
      let pedidoId = null;

      try {
        const receita = await createReceita(agent, utente.id, {
          medicamento: createUniqueMedicamento("Linha Pedido Pendente E2E"),
          quantidade: 2,
        });

        linhaId = receita.linhas[0].linhaId;

        const pedido = await createPedido(agent, [
          {
            utenteId: utente.id,
            tipo: "COM_RECEITA",
            id: linhaId,
            quantidade: 1,
          },
        ]);

        pedidoId = pedido.id;

        const response = await agent
          .delete(
            `/api/santacasa/utentes/${utente.id}/receitas/linhas/${linhaId}`,
          )
          .expect(409);

        expect(response.body).toEqual(
          expect.objectContaining({
            error: "CONFLICT",
            message:
              "Não é possível remover: esta linha já está associada a pedidos.",
          }),
        );
      } finally {
        await cancelPedido(agent, pedidoId);
        await deleteReceitaLinha(agent, utente.id, linhaId);
        await deleteUtente(agent, utente.id);
      }
    });
  });

  describe("Regularizações ao criar receita", () => {
    it("deve exigir confirmação quando a receita regulariza Vendas Suspensas pendentes e depois criar com confirmação", async () => {
      const santaCasaAgent = await createSantaCasaAgent(app);
      const farmaciaAgent = await createFarmaciaAgent(app);

      const utente = await createUtente(
        santaCasaAgent,
        "Utente Receita Regularização",
      );

      const medicamento = createUniqueMedicamento("Regularização Receita E2E");

      try {
        const extra = await createExtra(santaCasaAgent, utente.id, {
          medicamento,
          quantidadeSolicitada: 1,
        });

        const pedido = await createPedido(santaCasaAgent, [
          {
            utenteId: utente.id,
            tipo: "EXTRA",
            id: extra.id,
            quantidade: 1,
          },
        ]);

        await farmaciaAgent
          .post(`/api/farmacia/pedidos/${pedido.id}/validar`)
          .expect(200);

        const receitaPayload = {
          numero19: makeNumero19(),
          pinAcesso6: "123456",
          pinOpcao4: "1234",
          linhas: [
            {
              medicamento,
              quantidade: 1,
              validade: createFutureDate(),
            },
          ],
        };

        const confirmationResponse = await santaCasaAgent
          .post(`/api/santacasa/utentes/${utente.id}/receitas`)
          .send(receitaPayload)
          .expect(409);

        expect(confirmationResponse.body).toEqual(
          expect.objectContaining({
            error: "REGULARIZACAO_CONFIRMATION_REQUIRED",
            message:
              "Esta receita vai regularizar vendas suspensas pendentes. Confirma antes de continuar.",
          }),
        );

        const createResponse = await santaCasaAgent
          .post(`/api/santacasa/utentes/${utente.id}/receitas`)
          .send({
            ...receitaPayload,
            confirmRegularizacao: true,
          })
          .expect(201);

        expect(createResponse.body.data).toEqual(
          expect.objectContaining({
            receitaId: expect.any(String),
            utenteId: utente.id,
            numero19: receitaPayload.numero19,
            linhas: expect.arrayContaining([
              expect.objectContaining({
                medicamento,
                quantidade: 1,
                quantidadeDispensada: 0,
                quantidadeUsadaRegularizacao: 1,
                quantidadeRestante: 0,
                status: "ATIVA",
              }),
            ]),
          }),
        );
      } finally {
        await deleteUtente(santaCasaAgent, utente.id);
      }
    });
  });
});
