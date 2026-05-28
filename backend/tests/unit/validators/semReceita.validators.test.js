const {
  validateCreateSemReceitaPayload,
} = require("../../../src/modules/sem-receita/semReceita.validators");

describe("semReceita.validators", () => {
  describe("validateCreateSemReceitaPayload", () => {
    it("deve aceitar medicamento não sujeito a receita médica válido", () => {
      const result = validateCreateSemReceitaPayload({
        medicamento: "Ben-u-ron",
        quantidade: 2,
      });

      expect(result).toEqual({
        medicamento: "Ben-u-ron",
        quantidade: 2,
      });
    });

    it("deve aceitar nome como alias de medicamento", () => {
      const result = validateCreateSemReceitaPayload({
        nome: "Ibuprofeno",
        quantidade: 1,
      });

      expect(result).toEqual({
        medicamento: "Ibuprofeno",
        quantidade: 1,
      });
    });

    it("deve remover espaços do medicamento", () => {
      const result = validateCreateSemReceitaPayload({
        medicamento: "  Paracetamol  ",
        quantidade: 3,
      });

      expect(result).toEqual({
        medicamento: "Paracetamol",
        quantidade: 3,
      });
    });

    it("deve converter quantidade decimal para inteiro por baixo", () => {
      const result = validateCreateSemReceitaPayload({
        medicamento: "Aspirina",
        quantidade: 2.9,
      });

      expect(result).toEqual({
        medicamento: "Aspirina",
        quantidade: 2,
      });
    });

    it("deve rejeitar medicamento vazio", () => {
      expect(() => {
        validateCreateSemReceitaPayload({
          medicamento: "",
          quantidade: 1,
        });
      }).toThrow("O campo 'medicamento' é obrigatório.");
    });

    it("deve rejeitar medicamento só com espaços", () => {
      expect(() => {
        validateCreateSemReceitaPayload({
          medicamento: "   ",
          quantidade: 1,
        });
      }).toThrow("O campo 'medicamento' é obrigatório.");
    });

    it("deve rejeitar quantidade zero", () => {
      expect(() => {
        validateCreateSemReceitaPayload({
          medicamento: "Ben-u-ron",
          quantidade: 0,
        });
      }).toThrow(
        "O campo 'quantidade' deve ser um número inteiro maior que 0.",
      );
    });

    it("deve rejeitar quantidade negativa", () => {
      expect(() => {
        validateCreateSemReceitaPayload({
          medicamento: "Ben-u-ron",
          quantidade: -1,
        });
      }).toThrow(
        "O campo 'quantidade' deve ser um número inteiro maior que 0.",
      );
    });

    it("deve rejeitar quantidade inválida", () => {
      expect(() => {
        validateCreateSemReceitaPayload({
          medicamento: "Ben-u-ron",
          quantidade: "abc",
        });
      }).toThrow(
        "O campo 'quantidade' deve ser um número inteiro maior que 0.",
      );
    });

    it("deve rejeitar quantidade em falta", () => {
      expect(() => {
        validateCreateSemReceitaPayload({
          medicamento: "Ben-u-ron",
        });
      }).toThrow(
        "O campo 'quantidade' deve ser um número inteiro maior que 0.",
      );
    });
  });
});
