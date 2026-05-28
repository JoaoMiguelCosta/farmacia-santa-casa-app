const {
  validateCreateUtentePayload,
  parseListUtentesQuery,
  validateArchiveUtentePayload,
} = require("../../../src/modules/utentes/utentes.validators");

describe("utentes.validators", () => {
  describe("validateCreateUtentePayload", () => {
    it("deve aceitar um utente válido", () => {
      const result = validateCreateUtentePayload({
        numero9: "123456789",
        nome: "João Costa",
      });

      expect(result).toEqual({
        numero9: "123456789",
        nome: "João Costa",
      });
    });

    it("deve remover espaços no numero9 e no nome", () => {
      const result = validateCreateUtentePayload({
        numero9: " 123456789 ",
        nome: " João Costa ",
      });

      expect(result).toEqual({
        numero9: "123456789",
        nome: "João Costa",
      });
    });

    it("deve rejeitar numero9 com menos de 9 dígitos", () => {
      expect(() => {
        validateCreateUtentePayload({
          numero9: "123",
          nome: "João Costa",
        });
      }).toThrow("O campo 'numero9' deve ter exatamente 9 dígitos.");
    });

    it("deve rejeitar numero9 com letras", () => {
      expect(() => {
        validateCreateUtentePayload({
          numero9: "12345abcd",
          nome: "João Costa",
        });
      }).toThrow("O campo 'numero9' deve ter exatamente 9 dígitos.");
    });

    it("deve rejeitar nome vazio", () => {
      expect(() => {
        validateCreateUtentePayload({
          numero9: "123456789",
          nome: "",
        });
      }).toThrow("O campo 'nome' é obrigatório.");
    });
  });

  describe("parseListUtentesQuery", () => {
    it("deve aplicar valores padrão", () => {
      const result = parseListUtentesQuery({});

      expect(result).toEqual({
        status: "ATIVO",
        search: "",
        skip: 0,
        take: 50,
      });
    });

    it("deve aceitar status ATIVO", () => {
      const result = parseListUtentesQuery({
        status: "ativo",
      });

      expect(result.status).toBe("ATIVO");
    });

    it("deve aceitar status ARQUIVADO", () => {
      const result = parseListUtentesQuery({
        status: "arquivado",
      });

      expect(result.status).toBe("ARQUIVADO");
    });

    it("deve aceitar status TODOS", () => {
      const result = parseListUtentesQuery({
        status: "todos",
      });

      expect(result.status).toBe("TODOS");
    });

    it("deve rejeitar status inválido", () => {
      expect(() => {
        parseListUtentesQuery({
          status: "REMOVIDO",
        });
      }).toThrow("O filtro 'status' deve ser ATIVO, ARQUIVADO ou TODOS.");
    });

    it("deve limitar take ao máximo permitido", () => {
      const result = parseListUtentesQuery({
        take: "999",
      });

      expect(result.take).toBe(100);
    });

    it("deve normalizar skip negativo para 0", () => {
      const result = parseListUtentesQuery({
        skip: "-10",
      });

      expect(result.skip).toBe(0);
    });

    it("deve rejeitar skip inválido", () => {
      expect(() => {
        parseListUtentesQuery({
          skip: "abc",
        });
      }).toThrow("O parâmetro 'skip' deve ser um número válido.");
    });

    it("deve rejeitar search demasiado longo", () => {
      expect(() => {
        parseListUtentesQuery({
          search: "a".repeat(121),
        });
      }).toThrow("O parâmetro 'search' não pode exceder 120 caracteres.");
    });
  });

  describe("validateArchiveUtentePayload", () => {
    it("deve aceitar payload vazio", () => {
      const result = validateArchiveUtentePayload({});

      expect(result).toEqual({
        archivedReason: null,
      });
    });

    it("deve aceitar archivedReason válido", () => {
      const result = validateArchiveUtentePayload({
        archivedReason: "Utente deixou de estar abrangido.",
      });

      expect(result).toEqual({
        archivedReason: "Utente deixou de estar abrangido.",
      });
    });

    it("deve aceitar reason como alias", () => {
      const result = validateArchiveUtentePayload({
        reason: "Motivo via alias.",
      });

      expect(result).toEqual({
        archivedReason: "Motivo via alias.",
      });
    });

    it("deve rejeitar motivo com mais de 500 caracteres", () => {
      expect(() => {
        validateArchiveUtentePayload({
          archivedReason: "a".repeat(501),
        });
      }).toThrow("O motivo do arquivo não pode exceder 500 caracteres.");
    });
  });
});
