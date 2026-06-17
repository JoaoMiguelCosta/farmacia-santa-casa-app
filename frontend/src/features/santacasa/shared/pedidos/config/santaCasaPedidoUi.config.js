// src/features/santacasa/shared/pedidos/config/santaCasaPedidoUi.config.js

export const SANTACASA_PEDIDO_ITEM_TYPES = Object.freeze({
  receita: "COM_RECEITA",
  semReceita: "SEM_RECEITA",
  vendaSuspensa: "EXTRA",
});

export const SANTACASA_PEDIDO_ITEM_STATUS = Object.freeze({
  pending: "PENDENTE",
  validated: "VALIDADO",
  rejected: "REJEITADO",
  canceled: "CANCELADO",
  canceledByExpiration: "CANCELADO_POR_EXPIRACAO",
});

export const SANTACASA_PEDIDO_STATUS = Object.freeze({
  pending: "PENDENTE",
  validated: "VALIDADO",
  rejected: "REJEITADO",
  canceled: "CANCELADO",
});

export const SANTACASA_PEDIDO_VISUAL_STATUS = Object.freeze({
  pending: "PENDENTE",
  pendingWithWarnings: "PENDENTE_COM_AVISOS",

  validated: "VALIDADO",
  validatedWithWarnings: "VALIDADO_COM_AVISOS",

  rejected: "REJEITADO",

  canceled: "CANCELADO",
  automaticallyCanceled: "CANCELADO_AUTOMATICAMENTE",
});

export const SANTACASA_PEDIDO_UI = Object.freeze({
  labels: Object.freeze({
    emptyValue: "—",
    pedidoPrefix: "#",

    pedido: "Pedido",
    createdAt: "Enviado em",

    totalUtentes: "Total de utentes",
    totalItems: "Total de medicamentos",
    totalQuantity: "Quantidade total",

    medicamentoFallback: "Medicamento",
    utenteFallback: "Utente",
  }),

  summary: Object.freeze({
    pendingItems: "Medicamentos pendentes",
    pendingQuantity: "Quantidade pendente",

    validatedItems: "Medicamentos validados",
    validatedQuantity: "Quantidade validada",

    expiredItems: "Cancelados por expiração",
    expiredQuantity: "Quantidade cancelada",
  }),

  warnings: Object.freeze({
    pending: Object.freeze({
      title: "Pedido com medicamentos expirados",

      message:
        "Este pedido contém medicamentos que já não podem ser incluídos porque a validade da receita terminou. Os restantes medicamentos continuam pendentes.",
    }),

    validated: Object.freeze({
      title: "Pedido validado com avisos",

      message:
        "Este pedido foi validado, mas alguns medicamentos não foram incluídos porque a validade da receita terminou antes da decisão da Farmácia.",
    }),
  }),

  itemTypes: Object.freeze({
    [SANTACASA_PEDIDO_ITEM_TYPES.receita]: "Com receita",

    [SANTACASA_PEDIDO_ITEM_TYPES.semReceita]:
      "Medicamentos não sujeitos a receita médica",

    [SANTACASA_PEDIDO_ITEM_TYPES.vendaSuspensa]: "Venda Suspensa",
  }),

  itemStatus: Object.freeze({
    [SANTACASA_PEDIDO_ITEM_STATUS.pending]: "Pendente",
    [SANTACASA_PEDIDO_ITEM_STATUS.validated]: "Validado",
    [SANTACASA_PEDIDO_ITEM_STATUS.rejected]: "Rejeitado",
    [SANTACASA_PEDIDO_ITEM_STATUS.canceled]: "Cancelado",

    [SANTACASA_PEDIDO_ITEM_STATUS.canceledByExpiration]:
      "Cancelado por expiração",
  }),

  pedidoStatus: Object.freeze({
    [SANTACASA_PEDIDO_VISUAL_STATUS.pending]: "Pendente",

    [SANTACASA_PEDIDO_VISUAL_STATUS.pendingWithWarnings]: "Pendente com avisos",

    [SANTACASA_PEDIDO_VISUAL_STATUS.validated]: "Validado",

    [SANTACASA_PEDIDO_VISUAL_STATUS.validatedWithWarnings]:
      "Validado com avisos",

    [SANTACASA_PEDIDO_VISUAL_STATUS.rejected]: "Rejeitado",

    [SANTACASA_PEDIDO_VISUAL_STATUS.canceled]: "Cancelado",

    [SANTACASA_PEDIDO_VISUAL_STATUS.automaticallyCanceled]:
      "Cancelado automaticamente",
  }),
});
