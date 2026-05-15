import { useContext } from "react";

import { PedidoDraftContext } from "./PedidoDraftContext";

export function usePedidoDraft() {
  const context = useContext(PedidoDraftContext);

  if (!context) {
    throw new Error(
      "usePedidoDraft deve ser usado dentro de PedidoDraftProvider.",
    );
  }

  return context;
}
