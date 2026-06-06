// src/features/santacasa/historico/components/SantaCasaHistoricoCard/useSantaCasaHistoricoCard.js

import { useState } from "react";

import styles from "./SantaCasaHistoricoCard.module.css";

import {
  getHistoricoPedidoItems,
  isHistoricoPedidoCancelado,
  isHistoricoPedidoValidadoComAvisos,
} from "../../utils/santaCasaHistorico.utils";

function isHistoricoPedidoRejeitado(pedido) {
  return pedido?.status === "REJEITADO";
}

function getHistoricoCardClassName(pedido) {
  return [
    styles.card,
    pedido?.status === "VALIDADO" ? styles.cardValidated : "",
    isHistoricoPedidoValidadoComAvisos(pedido) ? styles.cardWarning : "",
    isHistoricoPedidoRejeitado(pedido) ? styles.cardRejected : "",
    isHistoricoPedidoCancelado(pedido) ? styles.cardCancelled : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function useSantaCasaHistoricoCard(pedido) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const items = getHistoricoPedidoItems(pedido);
  const cardClassName = getHistoricoCardClassName(pedido);

  function handleToggleDetails() {
    setIsDetailsOpen((currentValue) => !currentValue);
  }

  return {
    items,
    isDetailsOpen,
    cardClassName,
    handleToggleDetails,
  };
}
