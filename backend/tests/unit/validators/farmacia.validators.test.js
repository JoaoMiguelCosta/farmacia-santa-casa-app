const {
  parseListPedidosQuery,
  parseRejeitarPayload,
  parseValidarPayload,
} = require("../../../src/modules/farmacia/farmacia.validators");

describe("farmacia.validators", () => {
  describe("parseListPedidosQuery", () => {
    it("deve aplicar valores padrão", () => {
      const result = parseListPedidosQuery({});

      expect(result).toEqual({
        status: "PENDENTE",
        search: "",
        from: null,
        to: null,
        skip: 0,
        take: 50,
      });
    });

    it("deve aceitar status TODOS", () => {
      const result = parseListPedidosQuery({
        status: "todos",
      });

      expect(result.status).toBe("TODOS");
    });

    it("deve aceitar status PENDENTE", () => {
      const result = parseListPedidosQuery({
        status: "pendente",
      });

      expect(result.status).toBe("PENDENTE");
    });

    it("deve aceitar status VALIDADO", () => {
      const result = parseListPedidosQuery({
        status: "validado",
      });

      expect(result.status).toBe("VALIDADO");
    });

    it("deve aceitar status REJEITADO", () => {
      const result = parseListPedidosQuery({
        status: "rejeitado",
      });

      expect(result.status).toBe("REJEITADO");
    });

    it("deve aceitar status CANCELADO", () => {
      const result = parseListPedidosQuery({
        status: "cancelado",
      });

      expect(result.status).toBe("CANCELADO");
    });

    it("deve rejeitar status inválido", () => {
      expect(() => {
        parseListPedidosQuery({
          status: "ARQUIVADO",
        });
      }).toThrow(
        "O filtro 'status' deve ser TODOS, PENDENTE, VALIDADO, REJEITADO ou CANCELADO.",
      );
    });

    it("deve limpar espaços da pesquisa", () => {
      const result = parseListPedidosQuery({
        search: " Paracetamol ",
      });

      expect(result.search).toBe("Paracetamol");
    });

    it("deve rejeitar pesquisa com mais de 160 caracteres", () => {
      expect(() => {
        parseListPedidosQuery({
          search: "a".repeat(161),
        });
      }).toThrow("O parâmetro 'search' não pode exceder 160 caracteres.");
    });

    it("deve converter from e to em Date", () => {
      const result = parseListPedidosQuery({
        from: "2026-01-10",
        to: "2026-01-20",
      });

      expect(result.from).toBeInstanceOf(Date);
      expect(result.to).toBeInstanceOf(Date);
    });

    it("deve aceitar datas ISO completas", () => {
      const result = parseListPedidosQuery({
        from: "2026-01-10T10:30:00.000Z",
        to: "2026-01-20T18:45:00.000Z",
      });

      expect(result.from).toBeInstanceOf(Date);
      expect(result.to).toBeInstanceOf(Date);
    });

    it("deve rejeitar from inválido", () => {
      expect(() => {
        parseListPedidosQuery({
          from: "data-invalida",
        });
      }).toThrow("O parâmetro 'from' deve ser uma data válida.");
    });

    it("deve rejeitar to inválido", () => {
      expect(() => {
        parseListPedidosQuery({
          to: "data-invalida",
        });
      }).toThrow("O parâmetro 'to' deve ser uma data válida.");
    });

    it("deve aceitar skip e take válidos", () => {
      const result = parseListPedidosQuery({
        skip: "20",
        take: "10",
      });

      expect(result.skip).toBe(20);
      expect(result.take).toBe(10);
    });

    it("deve normalizar skip negativo para 0", () => {
      const result = parseListPedidosQuery({
        skip: "-10",
      });

      expect(result.skip).toBe(0);
    });

    it("deve limitar take ao máximo permitido", () => {
      const result = parseListPedidosQuery({
        take: "999",
      });

      expect(result.take).toBe(200);
    });

    it("deve normalizar take menor que 1 para 1", () => {
      const result = parseListPedidosQuery({
        take: "0",
      });

      expect(result.take).toBe(1);
    });

    it("deve rejeitar skip inválido", () => {
      expect(() => {
        parseListPedidosQuery({
          skip: "abc",
        });
      }).toThrow("O parâmetro 'skip' deve ser um número válido.");
    });

    it("deve rejeitar take inválido", () => {
      expect(() => {
        parseListPedidosQuery({
          take: "abc",
        });
      }).toThrow("O parâmetro 'take' deve ser um número válido.");
    });
  });

  describe("parseRejeitarPayload", () => {
    it("deve aceitar payload vazio", () => {
      const result = parseRejeitarPayload({});

      expect(result).toEqual({
        motivo: null,
      });
    });

    it("deve aceitar motivo", () => {
      const result = parseRejeitarPayload({
        motivo: "Medicamento indisponível.",
      });

      expect(result).toEqual({
        motivo: "Medicamento indisponível.",
      });
    });

    it("deve aceitar reason como alias de motivo", () => {
      const result = parseRejeitarPayload({
        reason: "Pedido duplicado.",
      });

      expect(result).toEqual({
        motivo: "Pedido duplicado.",
      });
    });

    it("deve remover espaços do motivo", () => {
      const result = parseRejeitarPayload({
        motivo: "  Medicamento indisponível.  ",
      });

      expect(result.motivo).toBe("Medicamento indisponível.");
    });

    it("deve devolver null quando motivo só tem espaços", () => {
      const result = parseRejeitarPayload({
        motivo: "   ",
      });

      expect(result).toEqual({
        motivo: null,
      });
    });

    it("deve rejeitar motivo com mais de 500 caracteres", () => {
      expect(() => {
        parseRejeitarPayload({
          motivo: "a".repeat(501),
        });
      }).toThrow("O motivo da rejeição não pode exceder 500 caracteres.");
    });
  });

  describe("parseValidarPayload", () => {
    it("deve aceitar payload vazio", () => {
      const result = parseValidarPayload({});

      expect(result).toEqual({
        validatedById: null,
      });
    });

    it("deve aceitar validatedById", () => {
      const result = parseValidarPayload({
        validatedById: "user-1",
      });

      expect(result).toEqual({
        validatedById: "user-1",
      });
    });

    it("deve remover espaços de validatedById", () => {
      const result = parseValidarPayload({
        validatedById: " user-1 ",
      });

      expect(result).toEqual({
        validatedById: "user-1",
      });
    });

    it("deve devolver null quando validatedById não é enviado", () => {
      const result = parseValidarPayload({
        outroCampo: "valor",
      });

      expect(result).toEqual({
        validatedById: null,
      });
    });
  });
});
