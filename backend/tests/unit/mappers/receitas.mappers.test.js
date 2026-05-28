const {
  toReceitaLinhaDTO,
  toReceitaCreatedDTO,
} = require("../../../src/modules/receitas/receitas.mappers");

describe("receitas.mappers", () => {
  describe("toReceitaLinhaDTO", () => {
    it("deve devolver null quando row é null", () => {
      expect(toReceitaLinhaDTO(null)).toBeNull();
    });

    it("deve mapear linha de receita sem reservas", () => {
      const row = {
        id: "linha-1",
        receitaId: "receita-1",
        medicamentoId: null,
        nome: "Paracetamol 1000mg",
        quantidade: 5,
        quantidadeDispensada: 2,
        validade: new Date("2099-12-31T00:00:00.000Z"),
        status: "ATIVA",
        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
        receita: {
          id: "receita-1",
          utenteId: "utente-1",
          numero19: "1234567890123456789",
          pinAcesso6: "123456",
          pinOpcao4: "1234",
        },
        medicamentoRef: null,
        pedidoItens: [],
      };

      const result = toReceitaLinhaDTO(row);

      expect(result).toEqual({
        linhaId: "linha-1",
        receitaId: "receita-1",
        utenteId: "utente-1",

        numero19: "1234567890123456789",
        pinAcesso6: "123456",
        pinOpcao4: "1234",

        medicamentoId: null,
        medicamento: "Paracetamol 1000mg",

        quantidade: 5,
        quantidadeDispensada: 2,
        quantidadeReservadaPendente: 0,
        quantidadeRestante: 3,

        validade: row.validade,
        status: "ATIVA",

        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      });
    });

    it("deve preferir nome de medicamentoRef quando existir", () => {
      const row = {
        id: "linha-1",
        receitaId: "receita-1",
        medicamentoId: "med-1",
        nome: "Nome antigo",
        quantidade: 5,
        quantidadeDispensada: 0,
        validade: new Date("2099-12-31T00:00:00.000Z"),
        status: "ATIVA",
        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
        receita: {
          id: "receita-1",
          utenteId: "utente-1",
          numero19: "1234567890123456789",
          pinAcesso6: "123456",
          pinOpcao4: "1234",
        },
        medicamentoRef: {
          id: "med-1",
          nome: "Nome oficial",
        },
        pedidoItens: [],
      };

      const result = toReceitaLinhaDTO(row);

      expect(result.medicamentoId).toBe("med-1");
      expect(result.medicamento).toBe("Nome oficial");
    });

    it("deve descontar reservas pendentes", () => {
      const row = {
        id: "linha-1",
        receitaId: "receita-1",
        medicamentoId: null,
        nome: "Paracetamol",
        quantidade: 10,
        quantidadeDispensada: 3,
        validade: new Date("2099-12-31T00:00:00.000Z"),
        status: "ATIVA",
        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
        receita: {
          id: "receita-1",
          utenteId: "utente-1",
          numero19: "1234567890123456789",
          pinAcesso6: "123456",
          pinOpcao4: "1234",
        },
        medicamentoRef: null,
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

      const result = toReceitaLinhaDTO(row);

      expect(result.quantidadeReservadaPendente).toBe(3);
      expect(result.quantidadeRestante).toBe(4);
    });

    it("deve impedir quantidadeRestante negativa", () => {
      const row = {
        id: "linha-1",
        receitaId: "receita-1",
        medicamentoId: null,
        nome: "Paracetamol",
        quantidade: 2,
        quantidadeDispensada: 2,
        validade: new Date("2099-12-31T00:00:00.000Z"),
        status: "ATIVA",
        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
        receita: {
          id: "receita-1",
          utenteId: "utente-1",
          numero19: "1234567890123456789",
          pinAcesso6: "123456",
          pinOpcao4: "1234",
        },
        medicamentoRef: null,
        pedidoItens: [
          {
            id: "pedido-item-1",
            quantidade: 5,
          },
        ],
      };

      const result = toReceitaLinhaDTO(row);

      expect(result.quantidadeRestante).toBe(0);
    });

    it("deve tratar quantidades inválidas como 0", () => {
      const row = {
        id: "linha-1",
        receitaId: "receita-1",
        medicamentoId: null,
        nome: "Paracetamol",
        quantidade: null,
        quantidadeDispensada: "abc",
        validade: new Date("2099-12-31T00:00:00.000Z"),
        status: "ATIVA",
        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
        receita: {
          id: "receita-1",
          utenteId: "utente-1",
          numero19: "1234567890123456789",
          pinAcesso6: "123456",
          pinOpcao4: "1234",
        },
        medicamentoRef: null,
        pedidoItens: [
          {
            id: "pedido-item-1",
            quantidade: 2,
          },
        ],
      };

      const result = toReceitaLinhaDTO(row);

      expect(result.quantidade).toBe(0);
      expect(result.quantidadeDispensada).toBe(0);
      expect(result.quantidadeReservadaPendente).toBe(2);
      expect(result.quantidadeRestante).toBe(0);
    });

    it("deve funcionar sem pedidoItens", () => {
      const row = {
        id: "linha-1",
        receitaId: "receita-1",
        medicamentoId: null,
        nome: "Paracetamol",
        quantidade: 5,
        quantidadeDispensada: 1,
        validade: new Date("2099-12-31T00:00:00.000Z"),
        status: "ATIVA",
        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
        receita: {
          id: "receita-1",
          utenteId: "utente-1",
          numero19: "1234567890123456789",
          pinAcesso6: "123456",
          pinOpcao4: "1234",
        },
        medicamentoRef: null,
      };

      const result = toReceitaLinhaDTO(row);

      expect(result.quantidadeReservadaPendente).toBe(0);
      expect(result.quantidadeRestante).toBe(4);
    });

    it("deve devolver campos da receita como null quando receita não existe", () => {
      const row = {
        id: "linha-1",
        receitaId: "receita-1",
        medicamentoId: null,
        nome: "Paracetamol",
        quantidade: 5,
        quantidadeDispensada: 1,
        validade: new Date("2099-12-31T00:00:00.000Z"),
        status: "ATIVA",
        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
        receita: null,
        medicamentoRef: null,
        pedidoItens: [],
      };

      const result = toReceitaLinhaDTO(row);

      expect(result.utenteId).toBeNull();
      expect(result.numero19).toBeNull();
      expect(result.pinAcesso6).toBeNull();
      expect(result.pinOpcao4).toBeNull();
    });
  });

  describe("toReceitaCreatedDTO", () => {
    it("deve mapear receita criada com linhas e extras resolvidos", () => {
      const receita = {
        id: "receita-1",
        utenteId: "utente-1",
        numero19: "1234567890123456789",
        pinAcesso6: "123456",
        pinOpcao4: "1234",
        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
      };

      const linhas = [
        {
          id: "linha-1",
          receitaId: "receita-1",
          medicamentoId: null,
          nome: "Paracetamol",
          quantidade: 5,
          quantidadeDispensada: 1,
          validade: new Date("2099-12-31T00:00:00.000Z"),
          status: "ATIVA",
          createdAt: new Date("2026-01-01T10:00:00.000Z"),
          updatedAt: new Date("2026-01-02T10:00:00.000Z"),
          receita: {
            id: "receita-1",
            utenteId: "utente-1",
            numero19: "1234567890123456789",
            pinAcesso6: "123456",
            pinOpcao4: "1234",
          },
          medicamentoRef: null,
          pedidoItens: [],
        },
      ];

      const extrasResolvidos = [
        {
          id: "extra-1",
          utenteId: "utente-1",
          medicamento: "Paracetamol",
          action: "DELETED",
          quantidadeRemovida: 2,
          quantidadeSolicitada: 2,
          quantidadeRegularizada: 0,
          quantidadeCancelada: 0,
        },
      ];

      const result = toReceitaCreatedDTO(receita, linhas, extrasResolvidos);

      expect(result).toEqual({
        receitaId: "receita-1",
        utenteId: "utente-1",
        numero19: "1234567890123456789",
        pinAcesso6: "123456",
        pinOpcao4: "1234",
        linhas: [toReceitaLinhaDTO(linhas[0])],
        extrasResolvidos: [
          {
            id: "extra-1",
            utenteId: "utente-1",
            medicamento: "Paracetamol",
            action: "DELETED",
            quantidadeRemovida: 2,
            quantidadeSolicitada: 2,
            quantidadeRegularizada: 0,
            quantidadeCancelada: 0,
          },
        ],
        createdAt: receita.createdAt,
        updatedAt: receita.updatedAt,
      });
    });

    it("deve devolver arrays vazios quando linhas e extras não são enviados", () => {
      const receita = {
        id: "receita-1",
        utenteId: "utente-1",
        numero19: "1234567890123456789",
        pinAcesso6: "123456",
        pinOpcao4: "1234",
        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
      };

      const result = toReceitaCreatedDTO(receita);

      expect(result.linhas).toEqual([]);
      expect(result.extrasResolvidos).toEqual([]);
    });

    it("deve filtrar extrasResolvidos nulos", () => {
      const receita = {
        id: "receita-1",
        utenteId: "utente-1",
        numero19: "1234567890123456789",
        pinAcesso6: "123456",
        pinOpcao4: "1234",
        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
      };

      const result = toReceitaCreatedDTO(
        receita,
        [],
        [
          null,
          {
            id: "extra-1",
            utenteId: "utente-1",
            medicamento: "Paracetamol",
            action: "CANCELLED_REMAINING",
            quantidadeRemovida: 1,
            quantidadeSolicitada: 3,
            quantidadeRegularizada: 1,
            quantidadeCancelada: 1,
          },
        ],
      );

      expect(result.extrasResolvidos).toEqual([
        {
          id: "extra-1",
          utenteId: "utente-1",
          medicamento: "Paracetamol",
          action: "CANCELLED_REMAINING",
          quantidadeRemovida: 1,
          quantidadeSolicitada: 3,
          quantidadeRegularizada: 1,
          quantidadeCancelada: 1,
        },
      ]);
    });
  });
});
