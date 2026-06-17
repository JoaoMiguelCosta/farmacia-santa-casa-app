const {
  toPedidoDTO,
  toPedidoItemDTO,
} = require("../../../src/modules/pedidos/pedidos.mappers");

describe("pedidos.mappers", () => {
  describe("toPedidoItemDTO", () => {
    it("deve devolver null quando item é null", () => {
      expect(toPedidoItemDTO(null)).toBeNull();
    });

    it("deve mapear item simples", () => {
      const item = {
        id: "item-1",
        pedidoId: "pedido-1",
        utenteId: "utente-1",

        tipo: "SEM_RECEITA",
        status: "PENDENTE",

        medicamento: "Ben-u-ron",
        quantidade: 2,

        receitaLinhaId: null,
        semReceitaId: "sem-1",
        extraId: null,

        utente: null,
        receitaLinha: null,
        semReceita: null,
        extra: null,

        validatedAt: null,
        validatedById: null,
        validatedBy: null,

        rejectedAt: null,
        rejectedById: null,
        rejectedBy: null,

        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
      };

      const result = toPedidoItemDTO(item);

      expect(result).toEqual({
        id: "item-1",
        pedidoId: "pedido-1",
        utenteId: "utente-1",

        tipo: "SEM_RECEITA",
        status: "PENDENTE",

        medicamento: "Ben-u-ron",
        quantidade: 2,

        receitaLinhaId: null,
        semReceitaId: "sem-1",
        extraId: null,

        utente: null,
        receitaLinha: null,
        semReceita: null,
        extra: null,

        validatedAt: null,
        validatedById: null,
        validatedBy: null,

        rejectedAt: null,
        rejectedById: null,
        rejectedBy: null,

        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      });
    });

    it("deve mapear utente associado", () => {
      const item = {
        id: "item-1",
        pedidoId: "pedido-1",
        utenteId: "utente-1",
        tipo: "COM_RECEITA",
        status: "PENDENTE",
        medicamento: "Paracetamol",
        quantidade: 1,
        receitaLinhaId: "linha-1",
        semReceitaId: null,
        extraId: null,

        utente: {
          id: "utente-1",
          numero9: "123456789",
          nome: "João Costa",
        },

        receitaLinha: null,
        semReceita: null,
        extra: null,

        validatedAt: null,
        validatedById: null,
        validatedBy: null,
        rejectedAt: null,
        rejectedById: null,
        rejectedBy: null,
        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
      };

      const result = toPedidoItemDTO(item);

      expect(result.utente).toEqual({
        id: "utente-1",
        numero9: "123456789",
        nome: "João Costa",
      });
    });

    it("deve mapear receitaLinha com dados da receita", () => {
      const item = {
        id: "item-1",
        pedidoId: "pedido-1",
        utenteId: "utente-1",
        tipo: "COM_RECEITA",
        status: "PENDENTE",
        medicamento: "Paracetamol",
        quantidade: 1,
        receitaLinhaId: "linha-1",
        semReceitaId: null,
        extraId: null,

        utente: null,

        receitaLinha: {
          id: "linha-1",
          nome: "Paracetamol",
          validade: new Date("2099-12-31T00:00:00.000Z"),
          quantidade: 5,
          quantidadeDispensada: 1,
          status: "ATIVA",
          receita: {
            id: "receita-1",
            numero19: "1234567890123456789",
            pinAcesso6: "123456",
            pinOpcao4: "1234",
          },
        },

        semReceita: null,
        extra: null,

        validatedAt: null,
        validatedById: null,
        validatedBy: null,
        rejectedAt: null,
        rejectedById: null,
        rejectedBy: null,
        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
      };

      const result = toPedidoItemDTO(item);

      expect(result.receitaLinha).toEqual({
        id: "linha-1",
        nome: "Paracetamol",
        validade: item.receitaLinha.validade,
        quantidade: 5,
        quantidadeDispensada: 1,
        status: "ATIVA",
        receita: {
          id: "receita-1",
          numero19: "1234567890123456789",
          pinAcesso6: "123456",
          pinOpcao4: "1234",
        },
      });
    });

    it("deve mapear receitaLinha sem receita como null", () => {
      const item = {
        id: "item-1",
        pedidoId: "pedido-1",
        utenteId: "utente-1",
        tipo: "COM_RECEITA",
        status: "PENDENTE",
        medicamento: "Paracetamol",
        quantidade: 1,
        receitaLinhaId: "linha-1",
        semReceitaId: null,
        extraId: null,

        utente: null,

        receitaLinha: {
          id: "linha-1",
          nome: "Paracetamol",
          validade: new Date("2099-12-31T00:00:00.000Z"),
          quantidade: 5,
          quantidadeDispensada: 1,
          status: "ATIVA",
          receita: null,
        },

        semReceita: null,
        extra: null,

        validatedAt: null,
        validatedById: null,
        validatedBy: null,
        rejectedAt: null,
        rejectedById: null,
        rejectedBy: null,
        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
      };

      const result = toPedidoItemDTO(item);

      expect(result.receitaLinha.receita).toBeNull();
    });

    it("deve mapear medicamento não sujeito a receita médica", () => {
      const item = {
        id: "item-1",
        pedidoId: "pedido-1",
        utenteId: "utente-1",
        tipo: "SEM_RECEITA",
        status: "PENDENTE",
        medicamento: "Ben-u-ron",
        quantidade: 1,
        receitaLinhaId: null,
        semReceitaId: "sem-1",
        extraId: null,

        utente: null,
        receitaLinha: null,

        semReceita: {
          id: "sem-1",
          medicamento: "Ben-u-ron",
          quantidade: 4,
        },

        extra: null,

        validatedAt: null,
        validatedById: null,
        validatedBy: null,
        rejectedAt: null,
        rejectedById: null,
        rejectedBy: null,
        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
      };

      const result = toPedidoItemDTO(item);

      expect(result.semReceita).toEqual({
        id: "sem-1",
        medicamento: "Ben-u-ron",
        quantidade: 4,
      });
    });

    it("deve mapear Venda Suspensa", () => {
      const item = {
        id: "item-1",
        pedidoId: "pedido-1",
        utenteId: "utente-1",
        tipo: "EXTRA",
        status: "PENDENTE",
        medicamento: "Medicamento Extra",
        quantidade: 1,
        receitaLinhaId: null,
        semReceitaId: null,
        extraId: "extra-1",

        utente: null,
        receitaLinha: null,
        semReceita: null,

        extra: {
          id: "extra-1",
          medicamento: "Medicamento Extra",
          quantidadeSolicitada: 3,
          quantidadeRegularizada: 1,
          quantidadeCancelada: 0,
          status: "PARCIALMENTE_REGULARIZADO",
        },

        validatedAt: null,
        validatedById: null,
        validatedBy: null,
        rejectedAt: null,
        rejectedById: null,
        rejectedBy: null,
        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
      };

      const result = toPedidoItemDTO(item);

      expect(result.extra).toEqual({
        id: "extra-1",
        medicamento: "Medicamento Extra",
        quantidadeSolicitada: 3,
        quantidadeRegularizada: 1,
        quantidadeCancelada: 0,
        status: "PARCIALMENTE_REGULARIZADO",
      });
    });

    it("deve mapear utilizadores de auditoria", () => {
      const validatedAt = new Date("2026-01-01T10:00:00.000Z");
      const rejectedAt = new Date("2026-01-02T10:00:00.000Z");

      const item = {
        id: "item-1",
        pedidoId: "pedido-1",
        utenteId: "utente-1",
        tipo: "SEM_RECEITA",
        status: "VALIDADO",
        medicamento: "Ben-u-ron",
        quantidade: 1,
        receitaLinhaId: null,
        semReceitaId: "sem-1",
        extraId: null,

        utente: null,
        receitaLinha: null,
        semReceita: null,
        extra: null,

        validatedAt,
        validatedById: "user-1",
        validatedBy: {
          id: "user-1",
          name: "Farmácia",
          email: "farmacia@sistema.local",
          role: "FARMACIA",
        },

        rejectedAt,
        rejectedById: "user-2",
        rejectedBy: {
          id: "user-2",
          name: "Admin",
          email: "admin@sistema.local",
          role: "ADMIN",
        },

        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
      };

      const result = toPedidoItemDTO(item);

      expect(result.validatedBy).toEqual({
        id: "user-1",
        name: "Farmácia",
        email: "farmacia@sistema.local",
        role: "FARMACIA",
      });

      expect(result.rejectedBy).toEqual({
        id: "user-2",
        name: "Admin",
        email: "admin@sistema.local",
        role: "ADMIN",
      });
    });
  });

  describe("toPedidoDTO", () => {
    it("deve devolver null quando pedido é null", () => {
      expect(toPedidoDTO(null)).toBeNull();
    });

    it("deve mapear pedido sem itens", () => {
      const pedido = {
        id: "pedido-1",
        numero: 1,
        status: "PENDENTE",

        validatedAt: null,
        validatedById: null,
        validatedBy: null,

        rejectedAt: null,
        rejectedById: null,
        rejectedBy: null,

        closedReason: null,
        itens: [],

        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
      };

      const result = toPedidoDTO(pedido);

      expect(result).toEqual({
        id: "pedido-1",
        numero: 1,
        status: "PENDENTE",

        validatedAt: null,
        validatedById: null,
        validatedBy: null,

        rejectedAt: null,
        rejectedById: null,
        rejectedBy: null,

        canceledById: null,
        canceledBy: null,

        closedReason: null,
        cancelReason: null,

        itens: [],

        createdAt: pedido.createdAt,
        updatedAt: pedido.updatedAt,
      });
    });

    it("deve mapear pedido com itens", () => {
      const item = {
        id: "item-1",
        pedidoId: "pedido-1",
        utenteId: "utente-1",

        tipo: "SEM_RECEITA",
        status: "PENDENTE",

        medicamento: "Ben-u-ron",
        quantidade: 2,

        receitaLinhaId: null,
        semReceitaId: "sem-1",
        extraId: null,

        utente: null,
        receitaLinha: null,
        semReceita: null,
        extra: null,

        validatedAt: null,
        validatedById: null,
        validatedBy: null,

        rejectedAt: null,
        rejectedById: null,
        rejectedBy: null,

        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
      };

      const pedido = {
        id: "pedido-1",
        numero: 1,
        status: "PENDENTE",

        validatedAt: null,
        validatedById: null,
        validatedBy: null,

        rejectedAt: null,
        rejectedById: null,
        rejectedBy: null,

        closedReason: null,
        itens: [item],

        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
      };

      const result = toPedidoDTO(pedido);

      expect(result.itens).toEqual([toPedidoItemDTO(item)]);
    });

    it("deve usar closedReason como cancelReason", () => {
      const pedido = {
        id: "pedido-1",
        numero: 1,
        status: "CANCELADO",

        validatedAt: null,
        validatedById: null,
        validatedBy: null,

        rejectedAt: null,
        rejectedById: null,
        rejectedBy: null,

        closedReason: "Cancelado por teste.",
        itens: [],

        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
      };

      const result = toPedidoDTO(pedido);

      expect(result.closedReason).toBe("Cancelado por teste.");
      expect(result.cancelReason).toBe("Cancelado por teste.");
    });

    it("deve usar cancelReason antigo se closedReason não existir", () => {
      const pedido = {
        id: "pedido-1",
        numero: 1,
        status: "CANCELADO",

        validatedAt: null,
        validatedById: null,
        validatedBy: null,

        rejectedAt: null,
        rejectedById: null,
        rejectedBy: null,

        closedReason: null,
        cancelReason: "Motivo antigo.",
        itens: [],

        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
      };

      const result = toPedidoDTO(pedido);

      expect(result.closedReason).toBe("Motivo antigo.");
      expect(result.cancelReason).toBe("Motivo antigo.");
    });

    it("deve devolver itens vazio quando pedido.itens não é array", () => {
      const pedido = {
        id: "pedido-1",
        numero: 1,
        status: "PENDENTE",

        validatedAt: null,
        validatedById: null,
        validatedBy: null,

        rejectedAt: null,
        rejectedById: null,
        rejectedBy: null,

        closedReason: null,
        itens: null,

        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
      };

      const result = toPedidoDTO(pedido);

      expect(result.itens).toEqual([]);
    });

    it("deve mapear utilizadores de auditoria do pedido", () => {
      const pedido = {
        id: "pedido-1",
        numero: 1,
        status: "VALIDADO",

        validatedAt: new Date("2026-01-01T10:00:00.000Z"),
        validatedById: "user-1",
        validatedBy: {
          id: "user-1",
          name: "Farmácia",
          email: "farmacia@sistema.local",
          role: "FARMACIA",
        },

        rejectedAt: null,
        rejectedById: null,
        rejectedBy: null,

        closedReason: null,
        itens: [],

        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
      };

      const result = toPedidoDTO(pedido);

      expect(result.validatedBy).toEqual({
        id: "user-1",
        name: "Farmácia",
        email: "farmacia@sistema.local",
        role: "FARMACIA",
      });
    });

    it("deve mapear utilizador que cancelou o pedido", () => {
      const pedido = {
        id: "pedido-1",
        numero: 1,
        status: "CANCELADO",

        validatedAt: null,
        validatedById: null,
        validatedBy: null,

        rejectedAt: null,
        rejectedById: null,
        rejectedBy: null,

        canceledById: "user-3",
        canceledBy: {
          id: "user-3",
          name: "Santa Casa",
          email: "santacasa@sistema.local",
          role: "SANTACASA",
        },

        closedReason: "Cancelado pela Santa Casa.",
        itens: [],

        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
      };

      const result = toPedidoDTO(pedido);

      expect(result.canceledById).toBe("user-3");

      expect(result.canceledBy).toEqual({
        id: "user-3",
        name: "Santa Casa",
        email: "santacasa@sistema.local",
        role: "SANTACASA",
      });
    });
  });
});
