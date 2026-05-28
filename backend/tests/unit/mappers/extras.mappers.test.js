const {
  toExtraDTO,
  getReceitaLinhaRestanteDTO,
} = require("../../../src/modules/extras/extras.mappers");

describe("extras.mappers", () => {
  describe("toExtraDTO", () => {
    it("deve devolver null quando row é null", () => {
      expect(toExtraDTO(null)).toBeNull();
    });

    it("deve mapear Venda Suspensa sem reservas", () => {
      const row = {
        id: "extra-1",
        utenteId: "utente-1",
        medicamentoId: null,
        medicamento: "Medicamento Teste",
        medicamentoRef: null,
        quantidadeSolicitada: 5,
        quantidadeRegularizada: 1,
        quantidadeCancelada: 1,
        pedidoItens: [],
        status: "PENDENTE",
        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
      };

      const result = toExtraDTO(row);

      expect(result).toEqual({
        id: "extra-1",
        utenteId: "utente-1",

        medicamentoId: null,
        medicamento: "Medicamento Teste",

        quantidadeSolicitada: 5,
        quantidadeRegularizada: 1,
        quantidadeCancelada: 1,
        quantidadeReservadaPendente: 0,
        quantidadeRestante: 3,

        status: "PENDENTE",

        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      });
    });

    it("deve preferir nome de medicamentoRef quando existir", () => {
      const row = {
        id: "extra-1",
        utenteId: "utente-1",
        medicamentoId: "med-1",
        medicamento: "Nome antigo",
        medicamentoRef: {
          id: "med-1",
          nome: "Nome oficial",
        },
        quantidadeSolicitada: 2,
        quantidadeRegularizada: 0,
        quantidadeCancelada: 0,
        pedidoItens: [],
        status: "PENDENTE",
        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
      };

      const result = toExtraDTO(row);

      expect(result.medicamentoId).toBe("med-1");
      expect(result.medicamento).toBe("Nome oficial");
    });

    it("deve descontar quantidades regularizadas, canceladas e reservadas", () => {
      const row = {
        id: "extra-1",
        utenteId: "utente-1",
        medicamentoId: null,
        medicamento: "Medicamento Teste",
        medicamentoRef: null,
        quantidadeSolicitada: 10,
        quantidadeRegularizada: 2,
        quantidadeCancelada: 1,
        pedidoItens: [
          {
            id: "pedido-item-1",
            quantidade: 3,
          },
          {
            id: "pedido-item-2",
            quantidade: 1,
          },
        ],
        status: "PARCIALMENTE_REGULARIZADO",
        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
      };

      const result = toExtraDTO(row);

      expect(result.quantidadeReservadaPendente).toBe(4);
      expect(result.quantidadeRestante).toBe(3);
    });

    it("deve impedir quantidadeRestante negativa", () => {
      const row = {
        id: "extra-1",
        utenteId: "utente-1",
        medicamentoId: null,
        medicamento: "Medicamento Teste",
        medicamentoRef: null,
        quantidadeSolicitada: 2,
        quantidadeRegularizada: 2,
        quantidadeCancelada: 1,
        pedidoItens: [
          {
            id: "pedido-item-1",
            quantidade: 5,
          },
        ],
        status: "PENDENTE",
        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
      };

      const result = toExtraDTO(row);

      expect(result.quantidadeRestante).toBe(0);
    });

    it("deve tratar quantidades inválidas como 0", () => {
      const row = {
        id: "extra-1",
        utenteId: "utente-1",
        medicamentoId: null,
        medicamento: "Medicamento Teste",
        medicamentoRef: null,
        quantidadeSolicitada: null,
        quantidadeRegularizada: "abc",
        quantidadeCancelada: undefined,
        pedidoItens: [],
        status: "PENDENTE",
        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
      };

      const result = toExtraDTO(row);

      expect(result.quantidadeSolicitada).toBe(0);
      expect(result.quantidadeRegularizada).toBe(0);
      expect(result.quantidadeCancelada).toBe(0);
      expect(result.quantidadeReservadaPendente).toBe(0);
      expect(result.quantidadeRestante).toBe(0);
    });

    it("deve tratar quantidades inválidas em pedidoItens como 0", () => {
      const row = {
        id: "extra-1",
        utenteId: "utente-1",
        medicamentoId: null,
        medicamento: "Medicamento Teste",
        medicamentoRef: null,
        quantidadeSolicitada: 5,
        quantidadeRegularizada: 0,
        quantidadeCancelada: 0,
        pedidoItens: [
          {
            id: "pedido-item-1",
            quantidade: null,
          },
          {
            id: "pedido-item-2",
            quantidade: "abc",
          },
          {
            id: "pedido-item-3",
            quantidade: 2,
          },
        ],
        status: "PENDENTE",
        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
      };

      const result = toExtraDTO(row);

      expect(result.quantidadeReservadaPendente).toBe(2);
      expect(result.quantidadeRestante).toBe(3);
    });

    it("deve funcionar mesmo sem pedidoItens", () => {
      const row = {
        id: "extra-1",
        utenteId: "utente-1",
        medicamentoId: null,
        medicamento: "Medicamento Teste",
        medicamentoRef: null,
        quantidadeSolicitada: 5,
        quantidadeRegularizada: 1,
        quantidadeCancelada: 0,
        status: "PENDENTE",
        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
      };

      const result = toExtraDTO(row);

      expect(result.quantidadeReservadaPendente).toBe(0);
      expect(result.quantidadeRestante).toBe(4);
    });
  });

  describe("getReceitaLinhaRestanteDTO", () => {
    it("deve calcular quantidade restante sem reservas", () => {
      const row = {
        quantidade: 5,
        quantidadeDispensada: 2,
        pedidoItens: [],
      };

      const result = getReceitaLinhaRestanteDTO(row);

      expect(result).toBe(3);
    });

    it("deve descontar reservas pendentes", () => {
      const row = {
        quantidade: 10,
        quantidadeDispensada: 3,
        pedidoItens: [
          {
            id: "pedido-item-1",
            quantidade: 2,
          },
          {
            id: "pedido-item-2",
            quantidade: 1,
          },
        ],
      };

      const result = getReceitaLinhaRestanteDTO(row);

      expect(result).toBe(4);
    });

    it("deve impedir valor negativo", () => {
      const row = {
        quantidade: 2,
        quantidadeDispensada: 2,
        pedidoItens: [
          {
            id: "pedido-item-1",
            quantidade: 5,
          },
        ],
      };

      const result = getReceitaLinhaRestanteDTO(row);

      expect(result).toBe(0);
    });

    it("deve tratar quantidades inválidas como 0", () => {
      const row = {
        quantidade: null,
        quantidadeDispensada: "abc",
        pedidoItens: [
          {
            id: "pedido-item-1",
            quantidade: 2,
          },
        ],
      };

      const result = getReceitaLinhaRestanteDTO(row);

      expect(result).toBe(0);
    });

    it("deve funcionar sem pedidoItens", () => {
      const row = {
        quantidade: 5,
        quantidadeDispensada: 1,
      };

      const result = getReceitaLinhaRestanteDTO(row);

      expect(result).toBe(4);
    });
  });
});
