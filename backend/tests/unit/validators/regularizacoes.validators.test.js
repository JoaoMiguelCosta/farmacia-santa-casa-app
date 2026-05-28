const {
  parseRegularizacoesQuery,
} = require("../../../src/modules/regularizacoes/regularizacoes.validators");

describe("regularizacoes.validators", () => {
  describe("parseRegularizacoesQuery", () => {
    it("deve aplicar valores padrão", () => {
      const result = parseRegularizacoesQuery({});

      expect(result).toEqual({
        skip: 0,
        take: 50,
        utenteId: null,
        medicamento: null,
        search: "",
        from: null,
        to: null,
      });
    });

    it("deve aceitar skip e take válidos", () => {
      const result = parseRegularizacoesQuery({
        skip: "20",
        take: "10",
      });

      expect(result.skip).toBe(20);
      expect(result.take).toBe(10);
    });

    it("deve normalizar skip negativo para 0", () => {
      const result = parseRegularizacoesQuery({
        skip: "-10",
      });

      expect(result.skip).toBe(0);
    });

    it("deve normalizar take menor que 1 para 1", () => {
      const result = parseRegularizacoesQuery({
        take: "0",
      });

      expect(result.take).toBe(1);
    });

    it("deve limitar take ao máximo permitido", () => {
      const result = parseRegularizacoesQuery({
        take: "999",
      });

      expect(result.take).toBe(200);
    });

    it("deve rejeitar skip inválido", () => {
      expect(() => {
        parseRegularizacoesQuery({
          skip: "abc",
        });
      }).toThrow("O parâmetro 'skip' deve ser um número válido.");
    });

    it("deve rejeitar take inválido", () => {
      expect(() => {
        parseRegularizacoesQuery({
          take: "abc",
        });
      }).toThrow("O parâmetro 'take' deve ser um número válido.");
    });

    it("deve aceitar utenteId", () => {
      const result = parseRegularizacoesQuery({
        utenteId: "utente-1",
      });

      expect(result.utenteId).toBe("utente-1");
    });

    it("deve remover espaços do utenteId", () => {
      const result = parseRegularizacoesQuery({
        utenteId: " utente-1 ",
      });

      expect(result.utenteId).toBe("utente-1");
    });

    it("deve devolver utenteId null quando vazio", () => {
      const result = parseRegularizacoesQuery({
        utenteId: "",
      });

      expect(result.utenteId).toBeNull();
    });

    it("deve aceitar medicamento", () => {
      const result = parseRegularizacoesQuery({
        medicamento: "Paracetamol",
      });

      expect(result.medicamento).toBe("Paracetamol");
    });

    it("deve remover espaços do medicamento", () => {
      const result = parseRegularizacoesQuery({
        medicamento: " Paracetamol ",
      });

      expect(result.medicamento).toBe("Paracetamol");
    });

    it("deve devolver medicamento null quando vazio", () => {
      const result = parseRegularizacoesQuery({
        medicamento: "",
      });

      expect(result.medicamento).toBeNull();
    });

    it("deve aceitar search", () => {
      const result = parseRegularizacoesQuery({
        search: "João",
      });

      expect(result.search).toBe("João");
    });

    it("deve remover espaços do search", () => {
      const result = parseRegularizacoesQuery({
        search: " João ",
      });

      expect(result.search).toBe("João");
    });

    it("deve rejeitar search com mais de 160 caracteres", () => {
      expect(() => {
        parseRegularizacoesQuery({
          search: "a".repeat(161),
        });
      }).toThrow("O parâmetro 'search' não pode exceder 160 caracteres.");
    });

    it("deve converter from e to em Date", () => {
      const result = parseRegularizacoesQuery({
        from: "2026-01-10",
        to: "2026-01-20",
      });

      expect(result.from).toBeInstanceOf(Date);
      expect(result.to).toBeInstanceOf(Date);
    });

    it("deve definir from no início do dia quando recebe data simples", () => {
      const result = parseRegularizacoesQuery({
        from: "2026-01-10",
      });

      expect(result.from.getFullYear()).toBe(2026);
      expect(result.from.getMonth()).toBe(0);
      expect(result.from.getDate()).toBe(10);
      expect(result.from.getHours()).toBe(0);
      expect(result.from.getMinutes()).toBe(0);
      expect(result.from.getSeconds()).toBe(0);
      expect(result.from.getMilliseconds()).toBe(0);
    });

    it("deve definir to no fim do dia quando recebe data simples", () => {
      const result = parseRegularizacoesQuery({
        to: "2026-01-20",
      });

      expect(result.to.getFullYear()).toBe(2026);
      expect(result.to.getMonth()).toBe(0);
      expect(result.to.getDate()).toBe(20);
      expect(result.to.getHours()).toBe(23);
      expect(result.to.getMinutes()).toBe(59);
      expect(result.to.getSeconds()).toBe(59);
      expect(result.to.getMilliseconds()).toBe(999);
    });

    it("deve aceitar datas ISO completas", () => {
      const result = parseRegularizacoesQuery({
        from: "2026-01-10T10:30:00.000Z",
        to: "2026-01-20T18:45:00.000Z",
      });

      expect(result.from).toBeInstanceOf(Date);
      expect(result.to).toBeInstanceOf(Date);
    });

    it("deve rejeitar from inválido", () => {
      expect(() => {
        parseRegularizacoesQuery({
          from: "data-invalida",
        });
      }).toThrow("O parâmetro 'from' deve ser uma data válida.");
    });

    it("deve rejeitar to inválido", () => {
      expect(() => {
        parseRegularizacoesQuery({
          to: "data-invalida",
        });
      }).toThrow("O parâmetro 'to' deve ser uma data válida.");
    });
  });
});
