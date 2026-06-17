// src/features/santacasa/operacao/utils/operacaoPedido.utils.js
export function buildDraftQuantityMap(items = []) {
  const map = {};

  items.forEach((item) => {
    map[item.key] = Number(item.quantidade) || 0;
  });

  return map;
}

export function buildReceitaDraftItems(items = [], utenteId) {
  return items
    .filter((item) => item.tipo === "COM_RECEITA")
    .filter((item) => item.utenteId === utenteId)
    .map((item) => ({
      linhaId: item.id,
      quantidade: Number(item.quantidade) || 0,
    }))
    .filter((item) => item.linhaId && item.quantidade > 0);
}

export function getReceitaPedidoKey(linha) {
  return `COM_RECEITA:${linha.linhaId}`;
}

export function getSemReceitaPedidoKey(item) {
  return `SEM_RECEITA:${item.id}`;
}

export function getExtraPedidoKey(item) {
  return `EXTRA:${item.id}`;
}

export function getExtraQuantidadeRestante(item) {
  const restante = Number(item.quantidadeRestante);

  if (Number.isFinite(restante)) return Math.max(0, restante);

  const total = Number(item.quantidadeSolicitada ?? item.quantidade ?? 0) || 0;
  const regularizada =
    Number(item.quantidadeRegularizada ?? item.quantidadeDispensada ?? 0) || 0;

  return Math.max(0, total - regularizada);
}

export function getQuantidadeDisponivelVisual(
  totalRestante,
  pedidoKey,
  pedidoMap,
) {
  const quantidadeRestante = Number(totalRestante) || 0;
  const quantidadeEmPedido = Number(pedidoMap[pedidoKey]) || 0;

  return Math.max(0, quantidadeRestante - quantidadeEmPedido);
}

export function buildGlobalDraftItem({
  item,
  selectedUtente,
  selectedUtenteId,
}) {
  return {
    ...item,
    utenteId: selectedUtenteId,
    utenteNome: selectedUtente?.nome || "Utente selecionado",
    utenteNumero9: selectedUtente?.numero9 || "",
  };
}
