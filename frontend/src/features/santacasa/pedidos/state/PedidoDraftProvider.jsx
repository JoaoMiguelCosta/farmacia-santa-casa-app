import { usePedidoDraftState } from "../hooks/usePedidoDraftState";

import { PedidoDraftContext } from "./PedidoDraftContext";

export function PedidoDraftProvider({ children }) {
  const value = usePedidoDraftState();

  return (
    <PedidoDraftContext.Provider value={value}>
      {children}
    </PedidoDraftContext.Provider>
  );
}
