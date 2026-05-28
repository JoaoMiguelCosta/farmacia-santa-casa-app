const {
  validateCreatePedidoPayload,
  parseHistoricoQuery,
  parseCancelPedidoPayload,
  parsePendentesQuery,
} = require("../../../src/modules/pedidos/pedidos.validators");

describe("pedidos.validators", () => {
  describe("validateCreatePedidoPayload", () => {
    it("deve aceitar pedido com item COM_RECEITA", () => {
      const result = validateCreatePedidoPayload({
        items: [
          {
            utenteId: "utente-1",
            tipo: "COM_RECEITA",
            id: "linha-1",
            quantidade: 2,
          },
        ],
      });

      expect(result).toEqual({
        items: [
          {
            utenteId: "utente-1",
            tipo: "COM_RECEITA",
            id: "linha-1",
            quantidade: 2,
          },
        ],
      });
    });

    it("deve aceitar RECEITA como alias de COM_RECEITA", () => {
      const result = validateCreatePedidoPayload({
        items: [
          {
            utenteId: "utente-1",
            tipo: "RECEITA",
            linhaId: "linha-1",
            quantidade: 1,
          },
        ],
      });

      expect(result.items[0]).toEqual({
        utenteId: "utente-1",
        tipo: "COM_RECEITA",
        id: "linha-1",
        quantidade: 1,
      });
    });

    it("deve aceitar RECEITA_LINHA como alias de COM_RECEITA", () => {
      const result = validateCreatePedidoPayload({
        items: [
          {
            utenteId: "utente-1",
            tipo: "RECEITA_LINHA",
            receitaLinhaId: "linha-1",
            quantidade: 1,
          },
        ],
      });

      expect(result.items[0].tipo).toBe("COM_RECEITA");
      expect(result.items[0].id).toBe("linha-1");
    });

    it("deve aceitar item SEM_RECEITA", () => {
      const result = validateCreatePedidoPayload({
        items: [
          {
            utenteId: "utente-1",
            tipo: "SEM_RECEITA",
            semReceitaId: "sem-receita-1",
            quantidade: 1,
          },
        ],
      });

      expect(result.items[0]).toEqual({
        utenteId: "utente-1",
        tipo: "SEM_RECEITA",
        id: "sem-receita-1",
        quantidade: 1,
      });
    });

    it("deve aceitar item EXTRA", () => {
      const result = validateCreatePedidoPayload({
        items: [
          {
            utenteId: "utente-1",
            tipo: "EXTRA",
            extraId: "extra-1",
            quantidade: 1,
          },
        ],
      });

      expect(result.items[0]).toEqual({
        utenteId: "utente-1",
        tipo: "EXTRA",
        id: "extra-1",
        quantidade: 1,
      });
    });

    it("deve aceitar kind como alternativa a tipo", () => {
      const result = validateCreatePedidoPayload({
        items: [
          {
            utenteId: "utente-1",
            kind: "EXTRA",
            extraId: "extra-1",
            quantidade: 1,
          },
        ],
      });

      expect(result.items[0].tipo).toBe("EXTRA");
    });

    it("deve usar quantidade padrão 1 quando não for enviada", () => {
      const result = validateCreatePedidoPayload({
        items: [
          {
            utenteId: "utente-1",
            tipo: "EXTRA",
            id: "extra-1",
          },
        ],
      });

      expect(result.items[0].quantidade).toBe(1);
    });

    it("deve aceitar qtd como alternativa a quantidade", () => {
      const result = validateCreatePedidoPayload({
        items: [
          {
            utenteId: "utente-1",
            tipo: "EXTRA",
            id: "extra-1",
            qtd: 3,
          },
        ],
      });

      expect(result.items[0].quantidade).toBe(3);
    });

    it("deve converter quantidade decimal para inteiro por baixo", () => {
      const result = validateCreatePedidoPayload({
        items: [
          {
            utenteId: "utente-1",
            tipo: "EXTRA",
            id: "extra-1",
            quantidade: 2.9,
          },
        ],
      });

      expect(result.items[0].quantidade).toBe(2);
    });

    it("deve juntar itens duplicados", () => {
      const result = validateCreatePedidoPayload({
        items: [
          {
            utenteId: "utente-1",
            tipo: "EXTRA",
            id: "extra-1",
            quantidade: 1,
          },
          {
            utenteId: "utente-1",
            tipo: "EXTRA",
            id: "extra-1",
            quantidade: 2,
          },
        ],
      });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].quantidade).toBe(3);
    });

    it("não deve juntar itens de utentes diferentes", () => {
      const result = validateCreatePedidoPayload({
        items: [
          {
            utenteId: "utente-1",
            tipo: "EXTRA",
            id: "extra-1",
            quantidade: 1,
          },
          {
            utenteId: "utente-2",
            tipo: "EXTRA",
            id: "extra-1",
            quantidade: 1,
          },
        ],
      });

      expect(result.items).toHaveLength(2);
    });

    it("deve rejeitar pedido sem itens", () => {
      expect(() => {
        validateCreatePedidoPayload({
          items: [],
        });
      }).toThrow("O pedido deve conter pelo menos um item.");
    });

    it("deve rejeitar payload sem array de items", () => {
      expect(() => {
        validateCreatePedidoPayload({});
      }).toThrow("O pedido deve conter pelo menos um item.");
    });

    it("deve rejeitar item sem utenteId", () => {
      expect(() => {
        validateCreatePedidoPayload({
          items: [
            {
              tipo: "EXTRA",
              id: "extra-1",
              quantidade: 1,
            },
          ],
        });
      }).toThrow("Item 1: o campo 'utenteId' é obrigatório.");
    });

    it("deve rejeitar tipo inválido", () => {
      expect(() => {
        validateCreatePedidoPayload({
          items: [
            {
              utenteId: "utente-1",
              tipo: "INVALIDO",
              id: "item-1",
              quantidade: 1,
            },
          ],
        });
      }).toThrow("Item 1: tipo de item inválido.");
    });

    it("deve rejeitar item sem id", () => {
      expect(() => {
        validateCreatePedidoPayload({
          items: [
            {
              utenteId: "utente-1",
              tipo: "EXTRA",
              quantidade: 1,
            },
          ],
        });
      }).toThrow("Item 1: o campo 'id' é obrigatório.");
    });

    it("deve rejeitar quantidade zero", () => {
      expect(() => {
        validateCreatePedidoPayload({
          items: [
            {
              utenteId: "utente-1",
              tipo: "EXTRA",
              id: "extra-1",
              quantidade: 0,
            },
          ],
        });
      }).toThrow(
        "Item 1: a quantidade deve ser um número inteiro maior que 0.",
      );
    });

    it("deve rejeitar quantidade negativa", () => {
      expect(() => {
        validateCreatePedidoPayload({
          items: [
            {
              utenteId: "utente-1",
              tipo: "EXTRA",
              id: "extra-1",
              quantidade: -1,
            },
          ],
        });
      }).toThrow(
        "Item 1: a quantidade deve ser um número inteiro maior que 0.",
      );
    });

    it("deve rejeitar quantidade inválida", () => {
      expect(() => {
        validateCreatePedidoPayload({
          items: [
            {
              utenteId: "utente-1",
              tipo: "EXTRA",
              id: "extra-1",
              quantidade: "abc",
            },
          ],
        });
      }).toThrow(
        "Item 1: a quantidade deve ser um número inteiro maior que 0.",
      );
    });
  });

  describe("parseHistoricoQuery", () => {
    it("deve aplicar valores padrão", () => {
      const result = parseHistoricoQuery({});

      expect(result).toEqual({
        status: null,
        from: null,
        to: null,
        search: "",
        skip: 0,
        take: 50,
      });
    });

    it("deve aceitar status VALIDADO", () => {
      const result = parseHistoricoQuery({
        status: "validado",
      });

      expect(result.status).toBe("VALIDADO");
    });

    it("deve aceitar status REJEITADO", () => {
      const result = parseHistoricoQuery({
        status: "rejeitado",
      });

      expect(result.status).toBe("REJEITADO");
    });

    it("deve aceitar status CANCELADO", () => {
      const result = parseHistoricoQuery({
        status: "cancelado",
      });

      expect(result.status).toBe("CANCELADO");
    });

    it("deve converter TODOS para null", () => {
      const result = parseHistoricoQuery({
        status: "todos",
      });

      expect(result.status).toBeNull();
    });

    it("deve rejeitar status inválido", () => {
      expect(() => {
        parseHistoricoQuery({
          status: "PENDENTE",
        });
      }).toThrow(
        "O filtro 'status' deve ser TODOS, VALIDADO, REJEITADO ou CANCELADO.",
      );
    });

    it("deve converter from e to em Date", () => {
      const result = parseHistoricoQuery({
        from: "2026-01-10",
        to: "2026-01-20",
      });

      expect(result.from).toBeInstanceOf(Date);
      expect(result.to).toBeInstanceOf(Date);
    });

    it("deve rejeitar from inválido", () => {
      expect(() => {
        parseHistoricoQuery({
          from: "data-invalida",
        });
      }).toThrow("O parâmetro 'from' deve ser uma data válida.");
    });

    it("deve rejeitar to inválido", () => {
      expect(() => {
        parseHistoricoQuery({
          to: "data-invalida",
        });
      }).toThrow("O parâmetro 'to' deve ser uma data válida.");
    });

    it("deve limpar espaços da pesquisa", () => {
      const result = parseHistoricoQuery({
        search: " João ",
      });

      expect(result.search).toBe("João");
    });

    it("deve limitar take ao máximo permitido", () => {
      const result = parseHistoricoQuery({
        take: "999",
      });

      expect(result.take).toBe(200);
    });

    it("deve normalizar skip negativo para 0", () => {
      const result = parseHistoricoQuery({
        skip: "-10",
      });

      expect(result.skip).toBe(0);
    });

    it("deve rejeitar skip inválido", () => {
      expect(() => {
        parseHistoricoQuery({
          skip: "abc",
        });
      }).toThrow("O parâmetro 'skip' deve ser um número válido.");
    });

    it("deve rejeitar take inválido", () => {
      expect(() => {
        parseHistoricoQuery({
          take: "abc",
        });
      }).toThrow("O parâmetro 'take' deve ser um número válido.");
    });
  });

  describe("parseCancelPedidoPayload", () => {
    it("deve aplicar motivo padrão quando body vazio", () => {
      const result = parseCancelPedidoPayload({});

      expect(result).toEqual({
        reason: "Cancelado pela Santa Casa antes da validação pela Farmácia.",
      });
    });

    it("deve aceitar reason", () => {
      const result = parseCancelPedidoPayload({
        reason: "Pedido duplicado.",
      });

      expect(result).toEqual({
        reason: "Pedido duplicado.",
      });
    });

    it("deve aceitar motivo como alias", () => {
      const result = parseCancelPedidoPayload({
        motivo: "Erro no pedido.",
      });

      expect(result).toEqual({
        reason: "Erro no pedido.",
      });
    });

    it("deve remover espaços do motivo", () => {
      const result = parseCancelPedidoPayload({
        motivo: " Erro no pedido. ",
      });

      expect(result.reason).toBe("Erro no pedido.");
    });

    it("deve rejeitar motivo com mais de 240 caracteres", () => {
      expect(() => {
        parseCancelPedidoPayload({
          motivo: "a".repeat(241),
        });
      }).toThrow("O motivo do cancelamento não pode exceder 240 caracteres.");
    });
  });

  describe("parsePendentesQuery", () => {
    it("deve aplicar valores padrão", () => {
      const result = parsePendentesQuery({});

      expect(result).toEqual({
        search: "",
        skip: 0,
        take: 50,
      });
    });

    it("deve limpar espaços da pesquisa", () => {
      const result = parsePendentesQuery({
        search: " Paracetamol ",
      });

      expect(result.search).toBe("Paracetamol");
    });

    it("deve limitar take ao máximo permitido", () => {
      const result = parsePendentesQuery({
        take: "999",
      });

      expect(result.take).toBe(200);
    });

    it("deve normalizar skip negativo para 0", () => {
      const result = parsePendentesQuery({
        skip: "-10",
      });

      expect(result.skip).toBe(0);
    });

    it("deve rejeitar skip inválido", () => {
      expect(() => {
        parsePendentesQuery({
          skip: "abc",
        });
      }).toThrow("O parâmetro 'skip' deve ser um número válido.");
    });

    it("deve rejeitar take inválido", () => {
      expect(() => {
        parsePendentesQuery({
          take: "abc",
        });
      }).toThrow("O parâmetro 'take' deve ser um número válido.");
    });
  });
});
