// src/features/santacasa/pedidos/utils/pedidoItems.js
const collator = new Intl.Collator("pt-PT", {
  sensitivity: "base",
  numeric: true,
});

export const PEDIDO_ITEM_TYPES = Object.freeze({
  receita: "COM_RECEITA",
  semReceita: "SEM_RECEITA",
  extra: "EXTRA",
});

export function getPedidoItemKey(item) {
  return `${item.tipo}:${item.id}`;
}

function getExtraQuantidadeRestante(item) {
  const restante = Number(item.quantidadeRestante);

  if (Number.isFinite(restante)) return restante;

  const total = Number(item.quantidadeSolicitada ?? item.quantidade ?? 0) || 0;
  const regularizada =
    Number(item.quantidadeRegularizada ?? item.quantidadeDispensada ?? 0) || 0;

  return Math.max(0, total - regularizada);
}

export function normalizeReceitaItems(items = []) {
  return items
    .map((item) => ({
      key: `COM_RECEITA:${item.linhaId}`,
      tipo: PEDIDO_ITEM_TYPES.receita,
      id: item.linhaId,
      title: item.medicamento,
      description: `Receita ${item.numero19}`,
      meta: `PIN ${item.pinAcesso6} · Opção ${item.pinOpcao4}`,

      numero19: item.numero19,
      pinAcesso6: item.pinAcesso6,
      pinOpcao4: item.pinOpcao4,
      validade: item.validade,

      quantidadeRestante: Number(item.quantidadeRestante) || 0,
      source: item,
    }))
    .filter((item) => item.quantidadeRestante > 0);
}

export function normalizeSemReceitaItems(items = []) {
  return items
    .map((item) => ({
      key: `SEM_RECEITA:${item.id}`,
      tipo: PEDIDO_ITEM_TYPES.semReceita,
      id: item.id,
      title: item.medicamento,
      description: "Medicamento não sujeito a receita médica",
      meta: `Total ${item.quantidade} · Reservada ${item.quantidadeReservadaPendente}`,
      quantidadeRestante: Number(item.quantidadeRestante) || 0,
      source: item,
    }))
    .filter((item) => item.quantidadeRestante > 0);
}

export function normalizeExtraItems(items = []) {
  return items
    .map((item) => {
      const quantidadeRestante = getExtraQuantidadeRestante(item);

      return {
        key: `EXTRA:${item.id}`,
        tipo: PEDIDO_ITEM_TYPES.extra,
        id: item.id,
        title: item.medicamento,
        description: "Venda suspensa por regularizar",
        meta: `Quantidade restante ${quantidadeRestante}`,
        quantidadeRestante,
        source: item,
      };
    })
    .filter((item) => item.quantidadeRestante > 0);
}

export function sortPedidoItems(items = []) {
  return [...items].sort((a, b) => {
    const typeCompare = collator.compare(a.tipo, b.tipo);

    if (typeCompare !== 0) return typeCompare;

    return collator.compare(a.title || "", b.title || "");
  });
}

export function clampQuantity(value, max) {
  const quantity = Math.floor(Number(value));

  if (!Number.isFinite(quantity) || quantity < 1) return 1;

  return Math.min(quantity, max);
}
