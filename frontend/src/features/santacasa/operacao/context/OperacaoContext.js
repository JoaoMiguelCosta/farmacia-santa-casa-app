import { createContext, useContext } from "react";

export const OperacaoContext = createContext(null);

export function useOperacaoContext() {
  return useContext(OperacaoContext);
}
