import { useMemo } from "react";

import {
  buildDraftQuantityMap,
  getExtraPedidoKey,
  getExtraQuantidadeRestante,
  getQuantidadeDisponivelVisual,
  getReceitaPedidoKey,
  getSemReceitaPedidoKey,
} from "../utils/santaCasaOperacao.utils";

export function useOperacaoVisibleItems({
  receitas = [],
  semReceita = [],
  extras = [],
  pedidoDraftItems = [],
}) {
  const pedidoItemsQuantities = useMemo(
    () => buildDraftQuantityMap(pedidoDraftItems),
    [pedidoDraftItems],
  );

  const visibleReceitas = useMemo(
    () =>
      receitas.filter((linha) => {
        const pedidoKey = getReceitaPedidoKey(linha);

        return (
          getQuantidadeDisponivelVisual(
            linha.quantidadeRestante,
            pedidoKey,
            pedidoItemsQuantities,
          ) > 0
        );
      }),
    [receitas, pedidoItemsQuantities],
  );

  const visibleSemReceita = useMemo(
    () =>
      semReceita.filter((item) => {
        const pedidoKey = getSemReceitaPedidoKey(item);

        return (
          getQuantidadeDisponivelVisual(
            item.quantidadeRestante,
            pedidoKey,
            pedidoItemsQuantities,
          ) > 0
        );
      }),
    [semReceita, pedidoItemsQuantities],
  );

  const visibleExtras = useMemo(
    () =>
      extras.filter((item) => {
        const pedidoKey = getExtraPedidoKey(item);

        return (
          getQuantidadeDisponivelVisual(
            getExtraQuantidadeRestante(item),
            pedidoKey,
            pedidoItemsQuantities,
          ) > 0
        );
      }),
    [extras, pedidoItemsQuantities],
  );

  return {
    pedidoItemsQuantities,
    visibleReceitas,
    visibleSemReceita,
    visibleExtras,
  };
}
