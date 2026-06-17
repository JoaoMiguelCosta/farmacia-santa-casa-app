const { getTestApp } = require("../helpers/app");
const {
  createFarmaciaAgent,
  createSantaCasaAgent,
} = require("../helpers/auth");
const { createUniqueUtentePayload } = require("../fixtures/utentes.fixture");

function makeNumero19(seed = Date.now()) {
  return String(seed).replace(/\D/g, "").padEnd(19, "0").slice(0, 19);
}

function createFutureDate(year = 2099) {
  return `${year}-12-31`;
}

async function createUtente(agent, prefix = "Utente Farmácia E2E") {
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
      medicamento: payload.medicamento || `Ben-u-ron ${Date.now()}`,
      quantidade: payload.quantidade || 2,
    })
    .expect(201);

  return response.body.data;
}

async function createReceita(agent, utenteId, payload = {}) {
  const response = await agent
    .post(`/api/santacasa/utentes/${utenteId}/receitas`)
    .send({
      numero19: payload.numero19 || makeNumero19(Date.now()),
      pinAcesso6: "123456",
      pinOpcao4: "1234",
      linhas: [
        {
          medicamento: payload.medicamento || `Paracetamol ${Date.now()}`,
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

describe("Farmácia E2E", () => {
  const app = getTestApp();

  describe("Permissões", () => {
    it("deve permitir FARMACIA aceder ao health da Farmácia", async () => {
      const agent = await createFarmaciaAgent(app);

      const response = await agent.get("/api/farmacia/health").expect(200);

      expect(response.body).toEqual({
        status: "ok",
        context: "farmacia",
      });
    });

    it("deve bloquear SANTACASA nas rotas da Farmácia", async () => {
      const agent = await createSantaCasaAgent(app);

      const response = await agent.get("/api/farmacia/pedidos").expect(403);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "FORBIDDEN",
          message: "Sem permissão para aceder a este recurso.",
        }),
      );
    });
  });

  describe("Pedidos", () => {
    it("deve listar e validar pedido pendente com medicamento não sujeito a receita médica", async () => {
      const santaCasaAgent = await createSantaCasaAgent(app);
      const farmaciaAgent = await createFarmaciaAgent(app);

      const utente = await createUtente(
        santaCasaAgent,
        "Utente Validação Farmácia",
      );

      const semReceita = await createSemReceita(santaCasaAgent, utente.id, {
        medicamento: `Medicamento Sem Receita ${Date.now()}`,
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

      expect(pedido).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          status: "PENDENTE",
        }),
      );

      const listResponse = await farmaciaAgent
        .get(`/api/farmacia/pedidos?search=${encodeURIComponent(utente.nome)}`)
        .expect(200);

      expect(listResponse.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: pedido.id,
            status: "PENDENTE",
          }),
        ]),
      );

      const validateResponse = await farmaciaAgent
        .post(`/api/farmacia/pedidos/${pedido.id}/validar`)
        .expect(200);

      expect(validateResponse.body.data).toEqual(
        expect.objectContaining({
          id: pedido.id,
          status: "VALIDADO",
          validatedAt: expect.any(String),
        }),
      );

      expect(validateResponse.body.data.itens).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            tipo: "SEM_RECEITA",
            status: "VALIDADO",
            quantidade: 1,
          }),
        ]),
      );
    });

    it("deve validar pedido com receita válida no próprio dia", async () => {
      const santaCasaAgent = await createSantaCasaAgent(app);
      const farmaciaAgent = await createFarmaciaAgent(app);

      const utente = await createUtente(
        santaCasaAgent,
        "Utente Receita Validade Hoje",
      );

      const receita = await createReceita(santaCasaAgent, utente.id, {
        medicamento: `Medicamento Validade Hoje ${Date.now()}`,
        quantidade: 1,
        validade: new Date().toISOString().slice(0, 10),
      });

      const linhaId = receita.linhas[0].linhaId;

      const pedido = await createPedido(santaCasaAgent, [
        {
          utenteId: utente.id,
          tipo: "COM_RECEITA",
          id: linhaId,
          quantidade: 1,
        },
      ]);

      const validateResponse = await farmaciaAgent
        .post(`/api/farmacia/pedidos/${pedido.id}/validar`)
        .expect(200);

      expect(validateResponse.body.data).toEqual(
        expect.objectContaining({
          id: pedido.id,
          status: "VALIDADO",
          validatedAt: expect.any(String),
        }),
      );

      expect(validateResponse.body.data.itens).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            tipo: "COM_RECEITA",
            status: "VALIDADO",
            quantidade: 1,
            receitaLinha: expect.objectContaining({
              validade: expect.any(String),
            }),
          }),
        ]),
      );
    });


    it("deve rejeitar pedido pendente com motivo", async () => {
      const santaCasaAgent = await createSantaCasaAgent(app);
      const farmaciaAgent = await createFarmaciaAgent(app);

      const utente = await createUtente(
        santaCasaAgent,
        "Utente Rejeição Farmácia",
      );

      const receita = await createReceita(santaCasaAgent, utente.id, {
        medicamento: `Medicamento Receita ${Date.now()}`,
        quantidade: 1,
      });

      const linhaId = receita.linhas[0].linhaId;

      const pedido = await createPedido(santaCasaAgent, [
        {
          utenteId: utente.id,
          tipo: "COM_RECEITA",
          id: linhaId,
          quantidade: 1,
        },
      ]);

      const rejectResponse = await farmaciaAgent
        .post(`/api/farmacia/pedidos/${pedido.id}/rejeitar`)
        .send({
          motivo: "Teste E2E de rejeição pela Farmácia.",
        })
        .expect(200);

      expect(rejectResponse.body.data).toEqual(
        expect.objectContaining({
          id: pedido.id,
          status: "REJEITADO",
          rejectedAt: expect.any(String),
          closedReason: "Teste E2E de rejeição pela Farmácia.",
        }),
      );

      expect(rejectResponse.body.data.itens).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            tipo: "COM_RECEITA",
            status: "REJEITADO",
            quantidade: 1,
          }),
        ]),
      );
    });

    it("deve bloquear validação de pedido já rejeitado", async () => {
      const santaCasaAgent = await createSantaCasaAgent(app);
      const farmaciaAgent = await createFarmaciaAgent(app);

      const utente = await createUtente(
        santaCasaAgent,
        "Utente Pedido Já Fechado",
      );

      const semReceita = await createSemReceita(santaCasaAgent, utente.id, {
        medicamento: `Medicamento Fechado ${Date.now()}`,
        quantidade: 1,
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
        .post(`/api/farmacia/pedidos/${pedido.id}/rejeitar`)
        .send({
          motivo: "Pedido rejeitado antes da tentativa de validação.",
        })
        .expect(200);

      const response = await farmaciaAgent
        .post(`/api/farmacia/pedidos/${pedido.id}/validar`)
        .expect(409);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "CONFLICT",
        }),
      );
    });
  });

  describe("Dashboard e sinais", () => {
   it("deve devolver sinais do dashboard da Farmácia", async () => {
     const agent = await createFarmaciaAgent(app);

     const response = await agent
       .get("/api/farmacia/dashboard/sinais")
       .expect(200);

     expect(response.body).toEqual(
       expect.objectContaining({
         pedidos: expect.objectContaining({
           pendentes: expect.any(Number),
           validados: expect.any(Number),
           rejeitados: expect.any(Number),
           cancelados: expect.any(Number),
         }),

         regularizacoes: expect.objectContaining({
           pendentes: expect.any(Number),
           historico: expect.any(Number),
           totalEventos: expect.any(Number),
           totalUnidades: expect.any(Number),
         }),
       }),
     );

     if (response.body.latestPedido !== null) {
       expect(response.body.latestPedido).toEqual(
         expect.objectContaining({
           id: expect.any(String),
           numero: expect.any(Number),
           status: expect.any(String),
           createdAt: expect.any(String),
         }),
       );
     }
   });

    it("deve devolver sinal de regularizações", async () => {
      const agent = await createFarmaciaAgent(app);

      const response = await agent
        .get("/api/farmacia/regularizacoes/sinal")
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          totalEventos: expect.any(Number),
          totalUnidades: expect.any(Number),
        }),
      );
    });
  });
});
