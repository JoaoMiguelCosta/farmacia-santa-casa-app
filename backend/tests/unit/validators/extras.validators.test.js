const {
  validateCreateExtraPayload,
} = require("../../../src/modules/extras/extras.validators");

describe("extras.validators", () => {
  describe("validateCreateExtraPayload", () => {
    it("deve aceitar uma Venda Suspensa válida", () => {
      const result = validateCreateExtraPayload({
        medicamento: "Paracetamol 1000mg",
        quantidadeSolicitada: 2,
      });

      expect(result).toEqual({
        medicamento: "Paracetamol 1000mg",
        medicamentoNorm: "paracetamol 1000mg",
        quantidadeSolicitada: 2,
        receitaDraftItems: [],
      });
    });

    it("deve aceitar nome como alias de medicamento", () => {
      const result = validateCreateExtraPayload({
        nome: "Ibuprofeno 400mg",
        quantidadeSolicitada: 1,
      });

      expect(result.medicamento).toBe("Ibuprofeno 400mg");
      expect(result.medicamentoNorm).toBe("ibuprofeno 400mg");
    });

    it("deve aceitar quantidade como alias de quantidadeSolicitada", () => {
      const result = validateCreateExtraPayload({
        medicamento: "Aspirina",
        quantidade: 3,
      });

      expect(result.quantidadeSolicitada).toBe(3);
    });

    it("deve remover espaços do medicamento", () => {
      const result = validateCreateExtraPayload({
        medicamento: "  Ben-u-ron  ",
        quantidadeSolicitada: 1,
      });

      expect(result.medicamento).toBe("Ben-u-ron");
      expect(result.medicamentoNorm).toBe("ben-u-ron");
    });

    it("deve normalizar medicamentoNorm removendo acentos", () => {
      const result = validateCreateExtraPayload({
        medicamento: "Ácido Fólico",
        quantidadeSolicitada: 1,
      });

      expect(result.medicamentoNorm).toBe("acido folico");
    });

    it("deve converter quantidade decimal para inteiro por baixo", () => {
      const result = validateCreateExtraPayload({
        medicamento: "Paracetamol",
        quantidadeSolicitada: 2.9,
      });

      expect(result.quantidadeSolicitada).toBe(2);
    });

    it("deve rejeitar medicamento vazio", () => {
      expect(() => {
        validateCreateExtraPayload({
          medicamento: "",
          quantidadeSolicitada: 1,
        });
      }).toThrow("O campo 'medicamento' é obrigatório.");
    });

    it("deve rejeitar quantidade zero", () => {
      expect(() => {
        validateCreateExtraPayload({
          medicamento: "Paracetamol",
          quantidadeSolicitada: 0,
        });
      }).toThrow(
        "O campo 'quantidadeSolicitada' deve ser um número inteiro maior que 0.",
      );
    });

    it("deve rejeitar quantidade negativa", () => {
      expect(() => {
        validateCreateExtraPayload({
          medicamento: "Paracetamol",
          quantidadeSolicitada: -1,
        });
      }).toThrow(
        "O campo 'quantidadeSolicitada' deve ser um número inteiro maior que 0.",
      );
    });

    it("deve rejeitar quantidade inválida", () => {
      expect(() => {
        validateCreateExtraPayload({
          medicamento: "Paracetamol",
          quantidadeSolicitada: "abc",
        });
      }).toThrow(
        "O campo 'quantidadeSolicitada' deve ser um número inteiro maior que 0.",
      );
    });

    it("deve normalizar receitaDraftItems válidos", () => {
      const result = validateCreateExtraPayload({
        medicamento: "Paracetamol",
        quantidadeSolicitada: 1,
        receitaDraftItems: [
          {
            linhaId: "linha-1",
            quantidade: 2,
          },
          {
            linhaId: "linha-2",
            quantidade: 1,
          },
        ],
      });

      expect(result.receitaDraftItems).toEqual([
        {
          linhaId: "linha-1",
          quantidade: 2,
        },
        {
          linhaId: "linha-2",
          quantidade: 1,
        },
      ]);
    });

    it("deve aceitar id como alias de linhaId em receitaDraftItems", () => {
      const result = validateCreateExtraPayload({
        medicamento: "Paracetamol",
        quantidadeSolicitada: 1,
        receitaDraftItems: [
          {
            id: "linha-1",
            quantidade: 2,
          },
        ],
      });

      expect(result.receitaDraftItems).toEqual([
        {
          linhaId: "linha-1",
          quantidade: 2,
        },
      ]);
    });

    it("deve juntar receitaDraftItems duplicados", () => {
      const result = validateCreateExtraPayload({
        medicamento: "Paracetamol",
        quantidadeSolicitada: 1,
        receitaDraftItems: [
          {
            linhaId: "linha-1",
            quantidade: 1,
          },
          {
            linhaId: "linha-1",
            quantidade: 2,
          },
        ],
      });

      expect(result.receitaDraftItems).toEqual([
        {
          linhaId: "linha-1",
          quantidade: 3,
        },
      ]);
    });

    it("deve ignorar receitaDraftItems sem linhaId", () => {
      const result = validateCreateExtraPayload({
        medicamento: "Paracetamol",
        quantidadeSolicitada: 1,
        receitaDraftItems: [
          {
            quantidade: 2,
          },
        ],
      });

      expect(result.receitaDraftItems).toEqual([]);
    });

    it("deve ignorar receitaDraftItems com quantidade inválida", () => {
      const result = validateCreateExtraPayload({
        medicamento: "Paracetamol",
        quantidadeSolicitada: 1,
        receitaDraftItems: [
          {
            linhaId: "linha-1",
            quantidade: "abc",
          },
          {
            linhaId: "linha-2",
            quantidade: 0,
          },
          {
            linhaId: "linha-3",
            quantidade: -1,
          },
        ],
      });

      expect(result.receitaDraftItems).toEqual([]);
    });

    it("deve converter quantidade decimal em receitaDraftItems para inteiro por baixo", () => {
      const result = validateCreateExtraPayload({
        medicamento: "Paracetamol",
        quantidadeSolicitada: 1,
        receitaDraftItems: [
          {
            linhaId: "linha-1",
            quantidade: 2.9,
          },
        ],
      });

      expect(result.receitaDraftItems).toEqual([
        {
          linhaId: "linha-1",
          quantidade: 2,
        },
      ]);
    });

    it("deve devolver receitaDraftItems vazio quando não for array", () => {
      const result = validateCreateExtraPayload({
        medicamento: "Paracetamol",
        quantidadeSolicitada: 1,
        receitaDraftItems: "invalid",
      });

      expect(result.receitaDraftItems).toEqual([]);
    });
  });
});
