const {
  toSemReceitaDTO,
} = require("../../../src/modules/sem-receita/semReceita.mappers");

describe("semReceita.mappers", () => {
  describe("toSemReceitaDTO", () => {
    it("deve devolver null quando row é null", () => {
      expect(toSemReceitaDTO(null)).toBeNull();
    });

    it("deve mapear medicamento não sujeito a receita médica sem pedidos pendentes", () => {
      const row = {
        id: "sem-1",
        utenteId: "utente-1",
        medicamento: "Ben-u-ron",
        quantidade: 5,
        pedidoItens: [],
        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
      };

      const result = toSemReceitaDTO(row);

      expect(result).toEqual({
        id: "sem-1",
        utenteId: "utente-1",
        medicamento: "Ben-u-ron",
        quantidade: 5,
        quantidadeReservadaPendente: 0,
        quantidadeRestante: 5,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      });
    });

    it("deve descontar quantidades reservadas em pedidos pendentes", () => {
      const row = {
        id: "sem-1",
        utenteId: "utente-1",
        medicamento: "Ben-u-ron",
        quantidade: 5,
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
        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
      };

      const result = toSemReceitaDTO(row);

      expect(result.quantidadeReservadaPendente).toBe(3);
      expect(result.quantidadeRestante).toBe(2);
    });

    it("deve impedir quantidadeRestante negativa", () => {
      const row = {
        id: "sem-1",
        utenteId: "utente-1",
        medicamento: "Ben-u-ron",
        quantidade: 2,
        pedidoItens: [
          {
            id: "pedido-item-1",
            quantidade: 5,
          },
        ],
        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
      };

      const result = toSemReceitaDTO(row);

      expect(result.quantidadeReservadaPendente).toBe(5);
      expect(result.quantidadeRestante).toBe(0);
    });

    it("deve tratar quantidade inválida como 0", () => {
      const row = {
        id: "sem-1",
        utenteId: "utente-1",
        medicamento: "Ben-u-ron",
        quantidade: null,
        pedidoItens: [],
        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
      };

      const result = toSemReceitaDTO(row);

      expect(result.quantidade).toBe(0);
      expect(result.quantidadeReservadaPendente).toBe(0);
      expect(result.quantidadeRestante).toBe(0);
    });

    it("deve tratar quantidade inválida em pedidoItens como 0", () => {
      const row = {
        id: "sem-1",
        utenteId: "utente-1",
        medicamento: "Ben-u-ron",
        quantidade: 5,
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
        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
      };

      const result = toSemReceitaDTO(row);

      expect(result.quantidadeReservadaPendente).toBe(2);
      expect(result.quantidadeRestante).toBe(3);
    });

    it("deve funcionar mesmo sem pedidoItens", () => {
      const row = {
        id: "sem-1",
        utenteId: "utente-1",
        medicamento: "Ben-u-ron",
        quantidade: 4,
        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
      };

      const result = toSemReceitaDTO(row);

      expect(result.quantidadeReservadaPendente).toBe(0);
      expect(result.quantidadeRestante).toBe(4);
    });
  });
});
