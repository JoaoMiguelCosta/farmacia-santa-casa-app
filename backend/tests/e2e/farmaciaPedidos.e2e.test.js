// backend/tests/e2e/farmaciaPedidos.e2e.test.js
const request = require("supertest");

const { prisma } = require("../../src/db/prisma");

const { getTestApp } = require("../helpers/app");
const {
  createFarmaciaAgent,
  createSantaCasaAgent,
} = require("../helpers/auth");
const { createUniqueUtentePayload } = require("../fixtures/utentes.fixture");

let numero19Counter = 0;

function createUniqueMedicamento(prefix = "Medicamento Farmácia Pedido E2E") {
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

function createFutureDate(year = 2099) {
  return `${year}-12-31`;
}

async function createUtente(agent, prefix = "Utente Farmácia Pedido E2E") {
  const payload = createUniqueUtentePayload(prefix);

  const response = await agent
    .post("/api/santacasa/utentes")
    .send(payload)
    .expect(201);

  return response.body.data;
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

async function cleanupPedidoScenario({
  pedidoId = null,
  semReceitaIds = [],
  receitaLinhaIds = [],
  receitaIds = [],
  utenteIds = [],
} = {}) {
  const pedidoItemIds = pedidoId
    ? (
        await prisma.pedidoItem.findMany({
          where: {
            pedidoId,
          },
          select: {
            id: true,
          },
        })
      ).map((item) => item.id)
    : [];

  if (pedidoItemIds.length > 0) {
    await prisma.dispensa.deleteMany({
      where: {
        pedidoItemId: {
          in: pedidoItemIds,
        },
      },
    });
  }

  if (pedidoId) {
    await prisma.pedidoItem.deleteMany({
      where: {
        pedidoId,
      },
    });

    await prisma.pedido.deleteMany({
      where: {
        id: pedidoId,
      },
    });
  }

  if (semReceitaIds.length > 0) {
    await prisma.semReceita.deleteMany({
      where: {
        id: {
          in: semReceitaIds,
        },
      },
    });
  }

  if (receitaLinhaIds.length > 0) {
    await prisma.receitaLinha.deleteMany({
      where: {
        id: {
          in: receitaLinhaIds,
        },
      },
    });
  }

  if (receitaIds.length > 0) {
    await prisma.receita.deleteMany({
      where: {
        id: {
          in: receitaIds,
        },
      },
    });
  }

  if (utenteIds.length > 0) {
    await prisma.utente.deleteMany({
      where: {
        id: {
          in: utenteIds,
        },
      },
    });
  }
}

async function createExpiredReceitaPedidoScenario() {
  const timestamp = Date.now();
  const medicamento = createUniqueMedicamento("Receita Expirada Farmácia E2E");

  const utente = await prisma.utente.create({
    data: {
      numero9: String(Math.floor(100000000 + Math.random() * 900000000)),
      nome: `Utente Receita Expirada Farmácia ${timestamp}`,
    },
    select: {
      id: true,
      numero9: true,
      nome: true,
    },
  });

  const receita = await prisma.receita.create({
    data: {
      utenteId: utente.id,
      numero19: makeNumero19(timestamp),
      pinAcesso6: "123456",
      pinOpcao4: "1234",
    },
    select: {
      id: true,
    },
  });

  const linha = await prisma.receitaLinha.create({
    data: {
      receitaId: receita.id,
      nome: medicamento,
      quantidade: 1,
      quantidadeDispensada: 0,
      validade: new Date("2020-01-01T00:00:00.000Z"),
      status: "ATIVA",
    },
    select: {
      id: true,
    },
  });

  const pedido = await prisma.pedido.create({
    data: {
      status: "PENDENTE",
      itens: {
        create: {
          utenteId: utente.id,
          tipo: "COM_RECEITA",
          status: "PENDENTE",
          medicamento,
          quantidade: 1,
          receitaLinhaId: linha.id,
        },
      },
    },
    select: {
      id: true,
      numero: true,
      itens: {
        select: {
          id: true,
        },
      },
    },
  });

  return {
    utente,
    receita,
    linha,
    pedido,
    medicamento,
  };
}

describe("Farmácia Pedidos E2E reforçado", () => {
  const app = getTestApp();

  describe("Consulta e filtros", () => {
    it("deve listar pedidos pendentes e consultar detalhe", async () => {
      const santaCasaAgent = await createSantaCasaAgent(app);
      const farmaciaAgent = await createFarmaciaAgent(app);

      const utente = await createUtente(
        santaCasaAgent,
        "Utente Farmácia Consulta",
      );

      let pedidoId = null;
      let semReceitaId = null;

      try {
        const semReceita = await createSemReceita(santaCasaAgent, utente.id, {
          medicamento: createUniqueMedicamento("Consulta Farmácia E2E"),
          quantidade: 2,
        });

        semReceitaId = semReceita.id;

        const pedido = await createPedido(santaCasaAgent, [
          {
            utenteId: utente.id,
            tipo: "SEM_RECEITA",
            id: semReceita.id,
            quantidade: 1,
          },
        ]);

        pedidoId = pedido.id;

        const listResponse = await farmaciaAgent
          .get(
            `/api/farmacia/pedidos?status=PENDENTE&search=${encodeURIComponent(
              utente.nome,
            )}&take=10`,
          )
          .expect(200);

        expect(listResponse.body).toEqual(
          expect.objectContaining({
            data: expect.arrayContaining([
              expect.objectContaining({
                id: pedido.id,
                numero: pedido.numero,
                status: "PENDENTE",
              }),
            ]),
            meta: expect.objectContaining({
              total: expect.any(Number),
              skip: 0,
              take: 10,
            }),
            params: expect.objectContaining({
              status: "PENDENTE",
              search: utente.nome,
            }),
          }),
        );

        const detailResponse = await farmaciaAgent
          .get(`/api/farmacia/pedidos/${pedido.id}`)
          .expect(200);

        expect(detailResponse.body.data).toEqual(
          expect.objectContaining({
            id: pedido.id,
            numero: pedido.numero,
            status: "PENDENTE",
            itens: expect.arrayContaining([
              expect.objectContaining({
                tipo: "SEM_RECEITA",
                status: "PENDENTE",
                medicamento: semReceita.medicamento,
                quantidade: 1,
                utente: expect.objectContaining({
                  id: utente.id,
                  numero9: utente.numero9,
                  nome: utente.nome,
                }),
              }),
            ]),
          }),
        );
      } finally {
        await cleanupPedidoScenario({
          pedidoId,
          semReceitaIds: [semReceitaId].filter(Boolean),
          utenteIds: [utente.id],
        });
      }
    });

    it("deve devolver 404 ao consultar pedido inexistente", async () => {
      const farmaciaAgent = await createFarmaciaAgent(app);

      const response = await farmaciaAgent
        .get("/api/farmacia/pedidos/pedido-inexistente")
        .expect(404);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "NOT_FOUND",
          message: "Pedido não encontrado.",
        }),
      );
    });

    it("deve validar query inválida na listagem de pedidos", async () => {
      const farmaciaAgent = await createFarmaciaAgent(app);

      const response = await farmaciaAgent
        .get("/api/farmacia/pedidos?status=ARQUIVADO")
        .expect(400);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "BAD_REQUEST",
          message:
            "O filtro 'status' deve ser TODOS, PENDENTE, VALIDADO, REJEITADO ou CANCELADO.",
        }),
      );
    });
  });

  describe("Validação e rejeição", () => {
    it("deve validar pedido e refletir em filtros de validados", async () => {
      const santaCasaAgent = await createSantaCasaAgent(app);
      const farmaciaAgent = await createFarmaciaAgent(app);

      const utente = await createUtente(
        santaCasaAgent,
        "Utente Farmácia Validação",
      );

      let pedidoId = null;
      let semReceitaId = null;

      try {
        const semReceita = await createSemReceita(santaCasaAgent, utente.id, {
          medicamento: createUniqueMedicamento("Validação Farmácia E2E"),
          quantidade: 3,
        });

        semReceitaId = semReceita.id;

        const pedido = await createPedido(santaCasaAgent, [
          {
            utenteId: utente.id,
            tipo: "SEM_RECEITA",
            id: semReceita.id,
            quantidade: 2,
          },
        ]);

        pedidoId = pedido.id;

        const validateResponse = await farmaciaAgent
          .post(`/api/farmacia/pedidos/${pedido.id}/validar`)
          .expect(200);

        expect(validateResponse.body.data).toEqual(
          expect.objectContaining({
            id: pedido.id,
            numero: pedido.numero,
            status: "VALIDADO",
            validatedAt: expect.any(String),
            validatedById: expect.any(String),
            validatedBy: expect.objectContaining({
              role: "FARMACIA",
            }),
            itens: expect.arrayContaining([
              expect.objectContaining({
                tipo: "SEM_RECEITA",
                status: "VALIDADO",
                quantidade: 2,
              }),
            ]),
          }),
        );

        const listResponse = await farmaciaAgent
          .get(
            `/api/farmacia/pedidos?status=VALIDADO&search=${encodeURIComponent(
              utente.nome,
            )}`,
          )
          .expect(200);

        expect(listResponse.body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: pedido.id,
              status: "VALIDADO",
            }),
          ]),
        );

        const semReceitaAfterValidation = await prisma.semReceita.findUnique({
          where: {
            id: semReceita.id,
          },
          select: {
            quantidade: true,
          },
        });

        expect(semReceitaAfterValidation).toEqual({
          quantidade: 1,
        });
      } finally {
        await cleanupPedidoScenario({
          pedidoId,
          semReceitaIds: [semReceitaId].filter(Boolean),
          utenteIds: [utente.id],
        });
      }
    });

    it("deve rejeitar pedido com motivo e refletir em filtros de rejeitados", async () => {
      const santaCasaAgent = await createSantaCasaAgent(app);
      const farmaciaAgent = await createFarmaciaAgent(app);

      const utente = await createUtente(
        santaCasaAgent,
        "Utente Farmácia Rejeição",
      );

      let pedidoId = null;
      let semReceitaId = null;

      try {
        const semReceita = await createSemReceita(santaCasaAgent, utente.id, {
          medicamento: createUniqueMedicamento("Rejeição Farmácia E2E"),
          quantidade: 1,
        });

        semReceitaId = semReceita.id;

        const pedido = await createPedido(santaCasaAgent, [
          {
            utenteId: utente.id,
            tipo: "SEM_RECEITA",
            id: semReceita.id,
            quantidade: 1,
          },
        ]);

        pedidoId = pedido.id;

        const motivo = "Pedido rejeitado no reforço E2E da Farmácia.";

        const rejectResponse = await farmaciaAgent
          .post(`/api/farmacia/pedidos/${pedido.id}/rejeitar`)
          .send({
            motivo,
          })
          .expect(200);

        expect(rejectResponse.body.data).toEqual(
          expect.objectContaining({
            id: pedido.id,
            numero: pedido.numero,
            status: "REJEITADO",
            rejectedAt: expect.any(String),
            rejectedById: expect.any(String),
            rejectedBy: expect.objectContaining({
              role: "FARMACIA",
            }),
            closedReason: motivo,
            itens: expect.arrayContaining([
              expect.objectContaining({
                tipo: "SEM_RECEITA",
                status: "REJEITADO",
                quantidade: 1,
              }),
            ]),
          }),
        );

        const listResponse = await farmaciaAgent
          .get(
            `/api/farmacia/pedidos?status=REJEITADO&search=${encodeURIComponent(
              motivo,
            )}`,
          )
          .expect(200);

        expect(listResponse.body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: pedido.id,
              status: "REJEITADO",
              closedReason: motivo,
            }),
          ]),
        );
      } finally {
        await cleanupPedidoScenario({
          pedidoId,
          semReceitaIds: [semReceitaId].filter(Boolean),
          utenteIds: [utente.id],
        });
      }
    });

    it("deve validar motivo de rejeição demasiado longo", async () => {
      const santaCasaAgent = await createSantaCasaAgent(app);
      const farmaciaAgent = await createFarmaciaAgent(app);

      const utente = await createUtente(
        santaCasaAgent,
        "Utente Farmácia Motivo Longo",
      );

      let pedidoId = null;
      let semReceitaId = null;

      try {
        const semReceita = await createSemReceita(santaCasaAgent, utente.id, {
          medicamento: createUniqueMedicamento("Motivo Longo Farmácia E2E"),
          quantidade: 1,
        });

        semReceitaId = semReceita.id;

        const pedido = await createPedido(santaCasaAgent, [
          {
            utenteId: utente.id,
            tipo: "SEM_RECEITA",
            id: semReceita.id,
            quantidade: 1,
          },
        ]);

        pedidoId = pedido.id;

        const response = await farmaciaAgent
          .post(`/api/farmacia/pedidos/${pedido.id}/rejeitar`)
          .send({
            motivo: "a".repeat(501),
          })
          .expect(400);

        expect(response.body).toEqual(
          expect.objectContaining({
            error: "BAD_REQUEST",
            message: "O motivo da rejeição não pode exceder 500 caracteres.",
          }),
        );
      } finally {
        await cleanupPedidoScenario({
          pedidoId,
          semReceitaIds: [semReceitaId].filter(Boolean),
          utenteIds: [utente.id],
        });
      }
    });
  });

  describe("Receitas expiradas", () => {
    it("deve cancelar automaticamente pedido quando todos os itens de receita estão expirados", async () => {
      const farmaciaAgent = await createFarmaciaAgent(app);
      const scenario = await createExpiredReceitaPedidoScenario();

      try {
        const validateResponse = await farmaciaAgent
          .post(`/api/farmacia/pedidos/${scenario.pedido.id}/validar`)
          .expect(200);

        expect(validateResponse.body.data).toEqual(
          expect.objectContaining({
            id: scenario.pedido.id,
            numero: scenario.pedido.numero,
            status: "CANCELADO",
            closedReason: "Cancelado automaticamente por expiração da receita.",
            itens: expect.arrayContaining([
              expect.objectContaining({
                tipo: "COM_RECEITA",
                status: "CANCELADO_POR_EXPIRACAO",
                receitaLinhaId: scenario.linha.id,
                medicamento: scenario.medicamento,
              }),
            ]),
          }),
        );

        const linha = await prisma.receitaLinha.findUnique({
          where: {
            id: scenario.linha.id,
          },
          select: {
            status: true,
          },
        });

        expect(linha).toEqual({
          status: "EXPIRADA",
        });

        const canceladosResponse = await farmaciaAgent
          .get(
            `/api/farmacia/pedidos?status=CANCELADO&search=${encodeURIComponent(
              scenario.medicamento,
            )}`,
          )
          .expect(200);

        expect(canceladosResponse.body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: scenario.pedido.id,
              status: "CANCELADO",
            }),
          ]),
        );
      } finally {
        await cleanupPedidoScenario({
          pedidoId: scenario.pedido.id,
          receitaLinhaIds: [scenario.linha.id],
          receitaIds: [scenario.receita.id],
          utenteIds: [scenario.utente.id],
        });
      }
    });
  });
});
