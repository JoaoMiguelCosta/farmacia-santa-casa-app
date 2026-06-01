const {
  validateCreateReceitaPayload,
} = require("../../../src/modules/receitas/receitas.validators");

describe("receitas.validators", () => {
  describe("validateCreateReceitaPayload", () => {
    it("deve aceitar uma receita válida", () => {
      const result = validateCreateReceitaPayload({
        numero19: "1234567890123456789",
        pinAcesso6: "123456",
        pinOpcao4: "1234",
        linhas: [
          {
            medicamento: "Paracetamol 1000mg",
            quantidade: 2,
            validade: "2099-12-31",
          },
        ],
      });

      expect(result.numero19).toBe("1234567890123456789");
      expect(result.pinAcesso6).toBe("123456");
      expect(result.pinOpcao4).toBe("1234");
      expect(result.confirmRegularizacao).toBe(false);

      expect(result.linhas).toHaveLength(1);
      expect(result.linhas[0].nome).toBe("Paracetamol 1000mg");
      expect(result.linhas[0].quantidade).toBe(2);
      expect(result.linhas[0].validade).toBeInstanceOf(Date);
    });

    it("deve aceitar medicamento vindo no campo nome", () => {
      const result = validateCreateReceitaPayload({
        numero19: "1234567890123456789",
        pinAcesso6: "123456",
        pinOpcao4: "1234",
        linhas: [
          {
            nome: "Ibuprofeno 400mg",
            quantidade: 1,
            validade: "2099-12-31",
          },
        ],
      });

      expect(result.linhas[0].nome).toBe("Ibuprofeno 400mg");
    });

    it("deve remover espaços nos campos numéricos", () => {
      const result = validateCreateReceitaPayload({
        numero19: " 1234567890123456789 ",
        pinAcesso6: " 123456 ",
        pinOpcao4: " 1234 ",
        linhas: [
          {
            medicamento: "Paracetamol",
            quantidade: 1,
            validade: "2099-12-31",
          },
        ],
      });

      expect(result.numero19).toBe("1234567890123456789");
      expect(result.pinAcesso6).toBe("123456");
      expect(result.pinOpcao4).toBe("1234");
    });

    it("deve aceitar confirmRegularizacao boolean true", () => {
      const result = validateCreateReceitaPayload({
        numero19: "1234567890123456789",
        pinAcesso6: "123456",
        pinOpcao4: "1234",
        confirmRegularizacao: true,
        linhas: [
          {
            medicamento: "Paracetamol",
            quantidade: 1,
            validade: "2099-12-31",
          },
        ],
      });

      expect(result.confirmRegularizacao).toBe(true);
    });

    it("deve aceitar confirmRegularizacao como string true", () => {
      const result = validateCreateReceitaPayload({
        numero19: "1234567890123456789",
        pinAcesso6: "123456",
        pinOpcao4: "1234",
        confirmRegularizacao: "true",
        linhas: [
          {
            medicamento: "Paracetamol",
            quantidade: 1,
            validade: "2099-12-31",
          },
        ],
      });

      expect(result.confirmRegularizacao).toBe(true);
    });

    it("deve rejeitar numero19 com menos de 19 dígitos", () => {
      expect(() => {
        validateCreateReceitaPayload({
          numero19: "123",
          pinAcesso6: "123456",
          pinOpcao4: "1234",
          linhas: [
            {
              medicamento: "Paracetamol",
              quantidade: 1,
              validade: "2099-12-31",
            },
          ],
        });
      }).toThrow("O campo 'numero19' deve ter exatamente 19 dígitos.");
    });

    it("deve rejeitar numero19 com letras", () => {
      expect(() => {
        validateCreateReceitaPayload({
          numero19: "12345678901234567AB",
          pinAcesso6: "123456",
          pinOpcao4: "1234",
          linhas: [
            {
              medicamento: "Paracetamol",
              quantidade: 1,
              validade: "2099-12-31",
            },
          ],
        });
      }).toThrow("O campo 'numero19' deve ter exatamente 19 dígitos.");
    });

    it("deve rejeitar pinAcesso6 inválido", () => {
      expect(() => {
        validateCreateReceitaPayload({
          numero19: "1234567890123456789",
          pinAcesso6: "123",
          pinOpcao4: "1234",
          linhas: [
            {
              medicamento: "Paracetamol",
              quantidade: 1,
              validade: "2099-12-31",
            },
          ],
        });
      }).toThrow("O campo 'pinAcesso6' deve ter exatamente 6 dígitos.");
    });

    it("deve rejeitar pinOpcao4 inválido", () => {
      expect(() => {
        validateCreateReceitaPayload({
          numero19: "1234567890123456789",
          pinAcesso6: "123456",
          pinOpcao4: "12",
          linhas: [
            {
              medicamento: "Paracetamol",
              quantidade: 1,
              validade: "2099-12-31",
            },
          ],
        });
      }).toThrow("O campo 'pinOpcao4' deve ter exatamente 4 dígitos.");
    });

    it("deve rejeitar receita sem linhas", () => {
      expect(() => {
        validateCreateReceitaPayload({
          numero19: "1234567890123456789",
          pinAcesso6: "123456",
          pinOpcao4: "1234",
          linhas: [],
        });
      }).toThrow("Adicione pelo menos uma linha de medicamento.");
    });

    it("deve rejeitar linha sem medicamento", () => {
      expect(() => {
        validateCreateReceitaPayload({
          numero19: "1234567890123456789",
          pinAcesso6: "123456",
          pinOpcao4: "1234",
          linhas: [
            {
              medicamento: "",
              quantidade: 1,
              validade: "2099-12-31",
            },
          ],
        });
      }).toThrow("Medicamento 1: o medicamento é obrigatório.");
    });

    it("deve rejeitar quantidade zero", () => {
      expect(() => {
        validateCreateReceitaPayload({
          numero19: "1234567890123456789",
          pinAcesso6: "123456",
          pinOpcao4: "1234",
          linhas: [
            {
              medicamento: "Paracetamol",
              quantidade: 0,
              validade: "2099-12-31",
            },
          ],
        });
      }).toThrow("Medicamento 1: a quantidade deve ser maior que 0.");
    });

    it("deve rejeitar quantidade negativa", () => {
      expect(() => {
        validateCreateReceitaPayload({
          numero19: "1234567890123456789",
          pinAcesso6: "123456",
          pinOpcao4: "1234",
          linhas: [
            {
              medicamento: "Paracetamol",
              quantidade: -1,
              validade: "2099-12-31",
            },
          ],
        });
      }).toThrow("Medicamento 1: a quantidade deve ser maior que 0.");
    });

    it("deve rejeitar validade inválida", () => {
      expect(() => {
        validateCreateReceitaPayload({
          numero19: "1234567890123456789",
          pinAcesso6: "123456",
          pinOpcao4: "1234",
          linhas: [
            {
              medicamento: "Paracetamol",
              quantidade: 1,
              validade: "data-invalida",
            },
          ],
        });
      }).toThrow("Medicamento 1: a validade é inválida.");
    });

    it("deve rejeitar validade passada", () => {
      expect(() => {
        validateCreateReceitaPayload({
          numero19: "1234567890123456789",
          pinAcesso6: "123456",
          pinOpcao4: "1234",
          linhas: [
            {
              medicamento: "Paracetamol",
              quantidade: 1,
              validade: "2020-01-01",
            },
          ],
        });
      }).toThrow("Medicamento 1: a validade deve ser futura.");
    });

    it("deve rejeitar medicamentos repetidos na mesma receita", () => {
      expect(() => {
        validateCreateReceitaPayload({
          numero19: "1234567890123456789",
          pinAcesso6: "123456",
          pinOpcao4: "1234",
          linhas: [
            {
              medicamento: "Paracetamol",
              quantidade: 1,
              validade: "2099-12-31",
            },
            {
              medicamento: "paracetamol",
              quantidade: 2,
              validade: "2099-12-31",
            },
          ],
        });
      }).toThrow(
        "Não é permitido repetir o mesmo medicamento na mesma receita.",
      );
    });

    it("deve rejeitar medicamentos repetidos ignorando acentos", () => {
      expect(() => {
        validateCreateReceitaPayload({
          numero19: "1234567890123456789",
          pinAcesso6: "123456",
          pinOpcao4: "1234",
          linhas: [
            {
              medicamento: "Ácido Fólico",
              quantidade: 1,
              validade: "2099-12-31",
            },
            {
              medicamento: "Acido Folico",
              quantidade: 1,
              validade: "2099-12-31",
            },
          ],
        });
      }).toThrow(
        "Não é permitido repetir o mesmo medicamento na mesma receita.",
      );
    });
  });
});
