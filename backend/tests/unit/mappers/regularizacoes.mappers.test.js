const {
  toRegularizacaoDTO,
  toRegularizacoesPageDTO,
} = require("../../../src/modules/regularizacoes/regularizacoes.mappers");

describe("regularizacoes.mappers", () => {
  describe("toRegularizacaoDTO", () => {
    it("deve devolver null quando row é null", () => {
      expect(toRegularizacaoDTO(null)).toBeNull();
    });

    it("deve mapear regularização sem eventos", () => {
      const row = {
        id: "reg-1",
        utenteId: "utente-1",
        extraId: "extra-1",
        pedidoId: "pedido-1",
        pedidoNumero: 10,

        medicamentoId: null,
        medicamento: "Paracetamol",
        medicamentoNorm: "paracetamol",

        quantidadeSolicitada: 5,
        quantidadeRegularizada: 2,
        status: "PARCIALMENTE_REGULARIZADO",

        utente: null,
        pedido: null,
        eventos: [],

        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
      };

      const result = toRegularizacaoDTO(row);

      expect(result).toEqual({
        id: "reg-1",
        utenteId: "utente-1",
        extraId: "extra-1",
        pedidoId: "pedido-1",
        pedidoNumero: 10,

        medicamentoId: null,
        medicamento: "Paracetamol",
        medicamentoNorm: "paracetamol",

        quantidadeSolicitada: 5,
        quantidadeRegularizada: 2,
        quantidadeRestante: 3,

        status: "PARCIALMENTE_REGULARIZADO",

        utente: null,
        pedido: null,
        eventos: [],

        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      });
    });

    it("deve preferir nome de medicamentoRef quando existir", () => {
      const row = {
        id: "reg-1",
        utenteId: "utente-1",
        extraId: "extra-1",
        pedidoId: "pedido-1",
        pedidoNumero: 10,

        medicamentoId: "med-1",
        medicamento: "Nome antigo",
        medicamentoNorm: "nome antigo",
        medicamentoRef: {
          id: "med-1",
          nome: "Nome oficial",
          tipo: "COM_RECEITA",
        },

        quantidadeSolicitada: 5,
        quantidadeRegularizada: 2,
        status: "PENDENTE",

        utente: null,
        pedido: null,
        eventos: [],

        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
      };

      const result = toRegularizacaoDTO(row);

      expect(result.medicamentoId).toBe("med-1");
      expect(result.medicamento).toBe("Nome oficial");
    });

    it("deve impedir quantidadeRestante negativa", () => {
      const row = {
        id: "reg-1",
        utenteId: "utente-1",
        extraId: "extra-1",
        pedidoId: "pedido-1",
        pedidoNumero: 10,

        medicamentoId: null,
        medicamento: "Paracetamol",
        medicamentoNorm: "paracetamol",

        quantidadeSolicitada: 2,
        quantidadeRegularizada: 5,
        status: "REGULARIZADO",

        utente: null,
        pedido: null,
        eventos: [],

        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
      };

      const result = toRegularizacaoDTO(row);

      expect(result.quantidadeRestante).toBe(0);
    });

    it("deve tratar quantidades null/undefined como 0", () => {
      const row = {
        id: "reg-1",
        utenteId: "utente-1",
        extraId: "extra-1",
        pedidoId: "pedido-1",
        pedidoNumero: 10,

        medicamentoId: null,
        medicamento: "Paracetamol",
        medicamentoNorm: "paracetamol",

        quantidadeSolicitada: null,
        quantidadeRegularizada: undefined,
        status: "PENDENTE",

        utente: null,
        pedido: null,
        eventos: [],

        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
      };

      const result = toRegularizacaoDTO(row);

      expect(result.quantidadeSolicitada).toBe(0);
      expect(result.quantidadeRegularizada).toBe(0);
      expect(result.quantidadeRestante).toBe(0);
    });

    it("deve mapear utente associado", () => {
      const row = {
        id: "reg-1",
        utenteId: "utente-1",
        extraId: "extra-1",
        pedidoId: "pedido-1",
        pedidoNumero: 10,

        medicamentoId: null,
        medicamento: "Paracetamol",
        medicamentoNorm: "paracetamol",

        quantidadeSolicitada: 5,
        quantidadeRegularizada: 2,
        status: "PENDENTE",

        utente: {
          id: "utente-1",
          numero9: "123456789",
          nome: "João Costa",
        },

        pedido: null,
        eventos: [],

        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
      };

      const result = toRegularizacaoDTO(row);

      expect(result.utente).toEqual({
        id: "utente-1",
        numero9: "123456789",
        nome: "João Costa",
      });
    });

    it("deve mapear pedido associado", () => {
      const row = {
        id: "reg-1",
        utenteId: "utente-1",
        extraId: "extra-1",
        pedidoId: "pedido-1",
        pedidoNumero: 10,

        medicamentoId: null,
        medicamento: "Paracetamol",
        medicamentoNorm: "paracetamol",

        quantidadeSolicitada: 5,
        quantidadeRegularizada: 2,
        status: "PENDENTE",

        utente: null,

        pedido: {
          id: "pedido-1",
          numero: 10,
          status: "VALIDADO",
        },

        eventos: [],

        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
      };

      const result = toRegularizacaoDTO(row);

      expect(result.pedido).toEqual({
        id: "pedido-1",
        numero: 10,
        status: "VALIDADO",
      });
    });

    it("deve mapear eventos com receitaLinha", () => {
      const createdAt = new Date("2026-01-01T10:00:00.000Z");
      const validade = new Date("2099-12-31T00:00:00.000Z");

      const row = {
        id: "reg-1",
        utenteId: "utente-1",
        extraId: "extra-1",
        pedidoId: "pedido-1",
        pedidoNumero: 10,

        medicamentoId: null,
        medicamento: "Paracetamol",
        medicamentoNorm: "paracetamol",

        quantidadeSolicitada: 5,
        quantidadeRegularizada: 2,
        status: "PENDENTE",

        utente: null,
        pedido: null,

        eventos: [
          {
            id: "evento-1",
            regularizacaoId: "reg-1",
            receitaLinhaId: "linha-1",
            quantidade: 2,
            createdAt,
            receitaLinha: {
              id: "linha-1",
              nome: "Paracetamol",
              validade,
              receita: {
                id: "receita-1",
                numero19: "1234567890123456789",
                pinAcesso6: "123456",
                pinOpcao4: "1234",
              },
            },
          },
        ],

        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
      };

      const result = toRegularizacaoDTO(row);

      expect(result.eventos).toEqual([
        {
          id: "evento-1",
          regularizacaoId: "reg-1",
          receitaLinhaId: "linha-1",
          quantidade: 2,
          createdAt,
          receitaLinha: {
            id: "linha-1",
            nome: "Paracetamol",
            validade,
            receita: {
              id: "receita-1",
              numero19: "1234567890123456789",
              pinAcesso6: "123456",
              pinOpcao4: "1234",
            },
          },
        },
      ]);
    });

    it("deve mapear evento com receitaLinha null", () => {
      const row = {
        id: "reg-1",
        utenteId: "utente-1",
        extraId: "extra-1",
        pedidoId: "pedido-1",
        pedidoNumero: 10,

        medicamentoId: null,
        medicamento: "Paracetamol",
        medicamentoNorm: "paracetamol",

        quantidadeSolicitada: 5,
        quantidadeRegularizada: 2,
        status: "PENDENTE",

        utente: null,
        pedido: null,

        eventos: [
          {
            id: "evento-1",
            regularizacaoId: "reg-1",
            receitaLinhaId: "linha-1",
            quantidade: 2,
            createdAt: new Date("2026-01-01T10:00:00.000Z"),
            receitaLinha: null,
          },
        ],

        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
      };

      const result = toRegularizacaoDTO(row);

      expect(result.eventos[0].receitaLinha).toBeNull();
    });

    it("deve devolver eventos vazio quando eventos não é array", () => {
      const row = {
        id: "reg-1",
        utenteId: "utente-1",
        extraId: "extra-1",
        pedidoId: "pedido-1",
        pedidoNumero: 10,

        medicamentoId: null,
        medicamento: "Paracetamol",
        medicamentoNorm: "paracetamol",

        quantidadeSolicitada: 5,
        quantidadeRegularizada: 2,
        status: "PENDENTE",

        utente: null,
        pedido: null,
        eventos: null,

        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
      };

      const result = toRegularizacaoDTO(row);

      expect(result.eventos).toEqual([]);
    });
  });

  describe("toRegularizacoesPageDTO", () => {
    it("deve mapear página de regularizações", () => {
      const row = {
        id: "reg-1",
        utenteId: "utente-1",
        extraId: "extra-1",
        pedidoId: "pedido-1",
        pedidoNumero: 10,

        medicamentoId: null,
        medicamento: "Paracetamol",
        medicamentoNorm: "paracetamol",

        quantidadeSolicitada: 5,
        quantidadeRegularizada: 2,
        status: "PENDENTE",

        utente: null,
        pedido: null,
        eventos: [],

        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
      };

      const from = new Date("2026-01-01T00:00:00.000Z");
      const to = new Date("2026-01-31T23:59:59.999Z");

      const result = toRegularizacoesPageDTO({
        rows: [row],
        total: 1,
        skip: 0,
        take: 50,
        utenteId: "utente-1",
        medicamento: "Paracetamol",
        search: "João",
        from,
        to,
      });

      expect(result).toEqual({
        data: [toRegularizacaoDTO(row)],
        meta: {
          total: 1,
          skip: 0,
          take: 50,
        },
        params: {
          utenteId: "utente-1",
          medicamento: "Paracetamol",
          search: "João",
          from,
          to,
        },
      });
    });

    it("deve aplicar defaults nos params opcionais", () => {
      const result = toRegularizacoesPageDTO({
        rows: [],
        total: 0,
        skip: 0,
        take: 50,
      });

      expect(result).toEqual({
        data: [],
        meta: {
          total: 0,
          skip: 0,
          take: 50,
        },
        params: {
          utenteId: null,
          medicamento: "",
          search: "",
          from: null,
          to: null,
        },
      });
    });
  });
});
