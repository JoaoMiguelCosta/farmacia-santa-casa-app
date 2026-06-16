// backend/tests/e2e/pedidos.e2e.test.js
const request = require("supertest");

const { getTestApp } = require("../helpers/app");
const {
  createFarmaciaAgent,
  createSantaCasaAgent,
} = require("../helpers/auth");
const { createUniqueUtentePayload } = require("../fixtures/utentes.fixture");

let numero19Counter = 0;

function createUniqueMedicamento(prefix = "Medicamento Pedido E2E") {
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

function createDateInput(year, month, day) {
  return [
    String(year).padStart(4, "0"),
    String(month).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");
}

function createFutureDate(year = 2099) {
  return `${year}-12-31`;
}

async function createUtente(agent, prefix = "Utente Pedido E2E") {
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

async function createSemReceita(agent, utenteId, payload = {}) {
  const response = await agent
    .post(`/api/santacasa/utentes/${utenteId}/sem-receita`)
    .send({
      medicamento: payload.medicamento || createUniqueMedicamento(),
      quantidade: payload.quantidade || 2,
    })
    .expect(201);

  return response.body.data;
}

async function createExtra(agent, utenteId, payload = {}) {
  const response = await agent
    .post(`/api/santacasa/utentes/${utenteId}/extras`)
    .send({
      medicamento: payload.medicamento || createUniqueMedicamento(),
      quantidadeSolicitada: payload.quantidadeSolicitada || 2,
    })
    .expect(201);

  return response.body.data;
}

async function createReceita(agent, utenteId, payload = {}) {
  const response = await agent
    .post(`/api/santacasa/utentes/${utenteId}/receitas`)
    .send({
      numero19: payload.numero19 || makeNumero19(),
      pinAcesso6: payload.pinAcesso6 || "123456",
      pinOpcao4: payload.pinOpcao4 || "1234",
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

function expectPedidoItemType(pedido, tipo) {
  expect(pedido.itens).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        tipo,
        status: "PENDENTE",
      }),
    ]),
  );
}

describe("Pedidos Santa Casa E2E", () => {
  const app = getTestApp();

  describe("Permissões", () => {
    it("deve bloquear criação de pedido sem sessão", async () => {
      const response = await request(app)
        .post("/api/santacasa/pedidos")
        .send({
          items: [],
        })
        .expect(401);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "UNAUTHORIZED",
        }),
      );
    });

    it("deve bloquear FARMACIA nas rotas de pedidos da Santa Casa", async () => {
      const agent = await createFarmaciaAgent(app);

      const response = await agent
        .get("/api/santacasa/pedidos/pendentes")
        .expect(403);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "FORBIDDEN",
          message: "Sem permissão para aceder a este recurso.",
        }),
      );
    });
  });

  describe("Criação e consulta", () => {
    it("deve criar pedido com Receita, medicamento não sujeito a receita médica e Venda Suspensa", async () => {
      const agent = await createSantaCasaAgent(app);
      const utente = await createUtente(agent, "Utente Pedido Misto");

      let pedidoId = null;

      try {
        const receita = await createReceita(agent, utente.id, {
          medicamento: createUniqueMedicamento("Pedido Receita Misto E2E"),
          quantidade: 2,
        });

        const semReceita = await createSemReceita(agent, utente.id, {
          medicamento: createUniqueMedicamento("Pedido Sem Receita Misto E2E"),
          quantidade: 2,
        });

        const extra = await createExtra(agent, utente.id, {
          medicamento: createUniqueMedicamento("Pedido Extra Misto E2E"),
          quantidadeSolicitada: 2,
        });

        const pedido = await createPedido(agent, [
          {
            utenteId: utente.id,
            tipo: "COM_RECEITA",
            id: receita.linhas[0].linhaId,
            quantidade: 1,
          },
          {
            utenteId: utente.id,
            tipo: "SEM_RECEITA",
            id: semReceita.id,
            quantidade: 1,
          },
          {
            utenteId: utente.id,
            tipo: "EXTRA",
            id: extra.id,
            quantidade: 1,
          },
        ]);

        pedidoId = pedido.id;

        expect(pedido).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            numero: expect.any(Number),
            status: "PENDENTE",
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          }),
        );

        expect(pedido.itens).toHaveLength(3);
        expectPedidoItemType(pedido, "COM_RECEITA");
        expectPedidoItemType(pedido, "SEM_RECEITA");
        expectPedidoItemType(pedido, "EXTRA");

        const detailResponse = await agent
          .get(`/api/santacasa/pedidos/${pedido.id}`)
          .expect(200);

        expect(detailResponse.body.data).toEqual(
          expect.objectContaining({
            id: pedido.id,
            numero: pedido.numero,
            status: "PENDENTE",
            itens: expect.any(Array),
          }),
        );

        const pendentesResponse = await agent
          .get(
            `/api/santacasa/pedidos/pendentes?search=${encodeURIComponent(
              utente.nome,
            )}`,
          )
          .expect(200);

        expect(pendentesResponse.body).toEqual(
          expect.objectContaining({
            rows: expect.arrayContaining([
              expect.objectContaining({
                id: pedido.id,
                status: "PENDENTE",
              }),
            ]),
            total: expect.any(Number),
            params: expect.objectContaining({
              status: "PENDENTE",
              search: utente.nome,
            }),
          }),
        );
      } finally {
        await cancelPedido(agent, pedidoId);
        await deleteUtente(agent, utente.id);
      }
    });

    it("deve juntar itens duplicados no mesmo pedido", async () => {
      const agent = await createSantaCasaAgent(app);
      const utente = await createUtente(agent, "Utente Pedido Duplicado");

      let pedidoId = null;

      try {
        const semReceita = await createSemReceita(agent, utente.id, {
          medicamento: createUniqueMedicamento("Pedido Duplicado E2E"),
          quantidade: 5,
        });

        const pedido = await createPedido(agent, [
          {
            utenteId: utente.id,
            tipo: "SEM_RECEITA",
            id: semReceita.id,
            quantidade: 1,
          },
          {
            utenteId: utente.id,
            tipo: "SEM_RECEITA",
            id: semReceita.id,
            quantidade: 2,
          },
        ]);

        pedidoId = pedido.id;

        expect(pedido.itens).toHaveLength(1);
        expect(pedido.itens[0]).toEqual(
          expect.objectContaining({
            tipo: "SEM_RECEITA",
            semReceitaId: semReceita.id,
            quantidade: 3,
            status: "PENDENTE",
          }),
        );
      } finally {
        await cancelPedido(agent, pedidoId);
        await deleteUtente(agent, utente.id);
      }
    });

    it("deve validar payload sem itens", async () => {
      const agent = await createSantaCasaAgent(app);

      const response = await agent
        .post("/api/santacasa/pedidos")
        .send({
          items: [],
        })
        .expect(400);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "BAD_REQUEST",
          message: "O pedido deve conter pelo menos um item.",
        }),
      );
    });
  });

  describe("Disponibilidade e FEFO", () => {
    it("deve bloquear novo pedido quando quantidade já está reservada em pedido pendente", async () => {
      const agent = await createSantaCasaAgent(app);
      const utente = await createUtente(agent, "Utente Pedido Reserva");

      let firstPedidoId = null;

      try {
        const semReceita = await createSemReceita(agent, utente.id, {
          medicamento: createUniqueMedicamento("Pedido Reserva E2E"),
          quantidade: 1,
        });

        const firstPedido = await createPedido(agent, [
          {
            utenteId: utente.id,
            tipo: "SEM_RECEITA",
            id: semReceita.id,
            quantidade: 1,
          },
        ]);

        firstPedidoId = firstPedido.id;

        const response = await agent
          .post("/api/santacasa/pedidos")
          .send({
            items: [
              {
                utenteId: utente.id,
                tipo: "SEM_RECEITA",
                id: semReceita.id,
                quantidade: 1,
              },
            ],
          })
          .expect(409);

        expect(response.body).toEqual(
          expect.objectContaining({
            error: "CONFLICT",
            message: expect.stringContaining("Disponível: 0"),
          }),
        );
      } finally {
        await cancelPedido(agent, firstPedidoId);
        await deleteUtente(agent, utente.id);
      }
    });

    it("deve aplicar FEFO e obrigar a usar primeiro a receita com validade mais próxima", async () => {
      const agent = await createSantaCasaAgent(app);
      const utente = await createUtente(agent, "Utente Pedido FEFO");
      const medicamento = createUniqueMedicamento("FEFO Pedido E2E");

      let pedidoId = null;

      try {
        const earlierReceita = await createReceita(agent, utente.id, {
          medicamento,
          quantidade: 1,
          validade: createDateInput(2099, 1, 1),
        });

        const laterReceita = await createReceita(agent, utente.id, {
          medicamento,
          quantidade: 1,
          validade: createDateInput(2100, 1, 1),
        });

        const laterLinhaId = laterReceita.linhas[0].linhaId;
        const earlierLinhaId = earlierReceita.linhas[0].linhaId;

        const blockedResponse = await agent
          .post("/api/santacasa/pedidos")
          .send({
            items: [
              {
                utenteId: utente.id,
                tipo: "COM_RECEITA",
                id: laterLinhaId,
                quantidade: 1,
              },
            ],
          })
          .expect(409);

        expect(blockedResponse.body).toEqual(
          expect.objectContaining({
            error: "CONFLICT",
            message: expect.stringContaining(
              "Usa primeiro a receita que expira mais cedo.",
            ),
          }),
        );

        const pedido = await createPedido(agent, [
          {
            utenteId: utente.id,
            tipo: "COM_RECEITA",
            id: earlierLinhaId,
            quantidade: 1,
          },
        ]);

        pedidoId = pedido.id;

        expect(pedido).toEqual(
          expect.objectContaining({
            status: "PENDENTE",
            itens: expect.arrayContaining([
              expect.objectContaining({
                tipo: "COM_RECEITA",
                receitaLinhaId: earlierLinhaId,
                quantidade: 1,
              }),
            ]),
          }),
        );
      } finally {
        await cancelPedido(agent, pedidoId);
        await deleteUtente(agent, utente.id);
      }
    });
  });

  describe("Cancelamento e histórico", () => {
    it("deve cancelar pedido pendente e mover para histórico de cancelados", async () => {
      const agent = await createSantaCasaAgent(app);
      const utente = await createUtente(agent, "Utente Pedido Cancelado");

      let pedidoId = null;

      try {
        const semReceita = await createSemReceita(agent, utente.id, {
          medicamento: createUniqueMedicamento("Pedido Cancelado E2E"),
          quantidade: 2,
        });

        const pedido = await createPedido(agent, [
          {
            utenteId: utente.id,
            tipo: "SEM_RECEITA",
            id: semReceita.id,
            quantidade: 1,
          },
        ]);

        pedidoId = pedido.id;

        const motivo = "Cancelado por teste E2E de pedidos.";

        const cancelResponse = await agent
          .post(`/api/santacasa/pedidos/${pedido.id}/cancelar`)
          .send({
            motivo,
          })
          .expect(200);

        expect(cancelResponse.body.data).toEqual(
          expect.objectContaining({
            id: pedido.id,
            status: "CANCELADO",
            closedReason: motivo,
            cancelReason: motivo,
            canceledById: expect.any(String),
            canceledBy: expect.objectContaining({
              role: "SANTACASA",
            }),
            itens: expect.arrayContaining([
              expect.objectContaining({
                status: "CANCELADO",
              }),
            ]),
          }),
        );

        pedidoId = null;

        const historicoResponse = await agent
          .get(
            `/api/santacasa/pedidos/historico?status=CANCELADO&search=${encodeURIComponent(
              motivo,
            )}`,
          )
          .expect(200);

        expect(historicoResponse.body).toEqual(
          expect.objectContaining({
            rows: expect.arrayContaining([
              expect.objectContaining({
                id: pedido.id,
                status: "CANCELADO",
                closedReason: motivo,
              }),
            ]),
            total: expect.any(Number),
            params: expect.objectContaining({
              status: "CANCELADO",
              search: motivo,
            }),
          }),
        );
      } finally {
        await cancelPedido(agent, pedidoId);
        await deleteUtente(agent, utente.id);
      }
    });

    it("deve bloquear cancelamento de pedido já validado pela Farmácia", async () => {
      const santaCasaAgent = await createSantaCasaAgent(app);
      const farmaciaAgent = await createFarmaciaAgent(app);

      const utente = await createUtente(
        santaCasaAgent,
        "Utente Pedido Validado",
      );

      try {
        const semReceita = await createSemReceita(santaCasaAgent, utente.id, {
          medicamento: createUniqueMedicamento("Pedido Validado E2E"),
          quantidade: 2,
        });

        const pedido = await createPedido(santaCasaAgent, [
          {
            utenteId: utente.id,
            tipo: "SEM_RECEITA",
            id: semReceita.id,
            quantidade: 1,
          },
        ]);

        await farmaciaAgent
          .post(`/api/farmacia/pedidos/${pedido.id}/validar`)
          .expect(200);

        const response = await santaCasaAgent
          .post(`/api/santacasa/pedidos/${pedido.id}/cancelar`)
          .send({
            motivo: "Tentativa inválida de cancelamento.",
          })
          .expect(409);

        expect(response.body).toEqual(
          expect.objectContaining({
            error: "CONFLICT",
            message: "Só é possível cancelar pedidos pendentes.",
          }),
        );
      } finally {
        await deleteUtente(santaCasaAgent, utente.id);
      }
    });
  });
});
