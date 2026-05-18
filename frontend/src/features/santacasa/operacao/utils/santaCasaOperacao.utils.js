import { RECEITAS_PAGE } from "../../receitas/config/receitasPage.config";
import { SEM_RECEITA_PAGE } from "../../sem-receita/config/semReceitaPage.config";
import { EXTRAS_PAGE } from "../../extras/config/extrasPage.config";

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

export function normalizeMedicationName(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function getItemMedicationName(item) {
  return (
    item?.medicamento ||
    item?.nome ||
    item?.title ||
    item?.source?.medicamento ||
    item?.source?.nome ||
    ""
  );
}

export function isSameMedication(a, b) {
  return (
    normalizeMedicationName(getItemMedicationName(a)) ===
    normalizeMedicationName(getItemMedicationName(b))
  );
}

export function formatUnitsLabel(quantity) {
  const amount = Number(quantity) || 0;

  return amount === 1 ? "1 unidade" : `${amount} unidades`;
}

export function getOriginListLabel(tipo) {
  if (tipo === "COM_RECEITA") return "Receitas";
  if (tipo === "SEM_RECEITA") return "Sem Receita";
  if (tipo === "EXTRA") return "Extras";

  return "lista correspondente";
}

export function formatVerbByQuantity(quantity, singular, plural) {
  return Number(quantity) === 1 ? singular : plural;
}

export function buildAddToPedidoMessage({
  item,
  addedQuantity,
  remainingQuantity,
  utenteNome,
}) {
  const medicamento = getItemMedicationName(item);
  const originLabel = getOriginListLabel(item.tipo);
  const addVerb = formatVerbByQuantity(
    addedQuantity,
    "adicionada",
    "adicionadas",
  );

  const baseMessage = `${formatUnitsLabel(
    addedQuantity,
  )} de ${medicamento} ${addVerb} ao pedido geral de ${utenteNome}.`;

  if (remainingQuantity <= 0) {
    return `${baseMessage} Toda a quantidade disponível ficou no pedido geral. O item deixou de aparecer em ${originLabel} para este utente.`;
  }

  const remainVerb = formatVerbByQuantity(
    remainingQuantity,
    "continua",
    "continuam",
  );

  const availableWord = formatVerbByQuantity(
    remainingQuantity,
    "disponível",
    "disponíveis",
  );

  return `${baseMessage} ${formatUnitsLabel(
    remainingQuantity,
  )} ${remainVerb} ${availableWord} em ${originLabel}.`;
}

export function getResolvedExtraKeys(extrasResolvidos = []) {
  return extrasResolvidos
    .map((extra) => extra?.id)
    .filter(Boolean)
    .map((extraId) => `EXTRA:${extraId}`);
}

export function buildResolvedExtrasMessage(extrasResolvidos = []) {
  if (!Array.isArray(extrasResolvidos) || extrasResolvidos.length === 0) {
    return "";
  }

  if (extrasResolvidos.length === 1) {
    const extra = extrasResolvidos[0];
    const quantidade = Number(extra.quantidadeRemovida) || 0;

    if (extra.action === "DELETED") {
      return ` O Extra ${extra.medicamento} foi removido porque passou a existir receita ativa para o mesmo medicamento.`;
    }

    return ` No Extra ${extra.medicamento}, ${formatUnitsLabel(
      quantidade,
    )} que ainda não tinham sido enviadas à Farmácia foram removidas. A parte já enviada foi preservada.`;
  }

  return ` ${extrasResolvidos.length} Extras compatíveis foram ajustados/removidos porque passaram a ter receita ativa.`;
}

export function getCreatedReceitaLinhas(receita) {
  return Array.isArray(receita?.linhas) ? receita.linhas : [];
}

export function getLinhaQuantidadeRegularizada(linha) {
  return Number(linha?.quantidadeDispensada) || 0;
}

export function getLinhaQuantidadeRestante(linha) {
  const restante = Number(linha?.quantidadeRestante);

  if (Number.isFinite(restante)) {
    return Math.max(0, restante);
  }

  return Math.max(
    0,
    Number(linha?.quantidade || 0) - getLinhaQuantidadeRegularizada(linha),
  );
}

export function buildReceitaRegularizacaoMessage(receita) {
  const linhasRegularizadas = getCreatedReceitaLinhas(receita)
    .map((linha) => {
      const quantidadeRegularizada = getLinhaQuantidadeRegularizada(linha);
      const quantidadeRestante = getLinhaQuantidadeRestante(linha);

      return {
        medicamento: linha?.medicamento || linha?.nome || "Medicamento",
        quantidadeRegularizada,
        quantidadeRestante,
      };
    })
    .filter((linha) => linha.quantidadeRegularizada > 0);

  if (linhasRegularizadas.length === 0) {
    return "";
  }

  const detalhes = linhasRegularizadas
    .map((linha) => {
      const usedVerb = formatVerbByQuantity(
        linha.quantidadeRegularizada,
        RECEITAS_PAGE.form.regularizationUsedSingular,
        RECEITAS_PAGE.form.regularizationUsedPlural,
      );

      const remainingMessage =
        linha.quantidadeRestante > 0
          ? `${formatUnitsLabel(
              linha.quantidadeRestante,
            )} ${formatVerbByQuantity(
              linha.quantidadeRestante,
              RECEITAS_PAGE.form.regularizationRemainingSingular,
              RECEITAS_PAGE.form.regularizationRemainingPlural,
            )}`
          : RECEITAS_PAGE.form.regularizationNoRemaining;

      return `${linha.medicamento}: ${formatUnitsLabel(
        linha.quantidadeRegularizada,
      )} ${usedVerb}; ${remainingMessage}.`;
    })
    .join(" ");

  return ` ${RECEITAS_PAGE.form.regularizationSuccessPrefix} ${detalhes}`;
}

export function buildReceitaSuccessMessage(
  createdReceita,
  extrasResolvidos = [],
) {
  return `${RECEITAS_PAGE.form.successMessage}${buildReceitaRegularizacaoMessage(
    createdReceita,
  )}${buildResolvedExtrasMessage(extrasResolvidos)}`;
}

export function getReceitaFieldErrors(requestError) {
  if (requestError?.status === 409) {
    return {
      numero19:
        requestError.message || "Já existe uma receita com esse número.",
    };
  }

  return {};
}

export function getDeleteTargetKey(target) {
  if (!target) return "";

  if (target.kind === "receita") {
    return `receita:${target.item.linhaId}`;
  }

  if (target.kind === "semReceita") {
    return `semReceita:${target.item.id}`;
  }

  if (target.kind === "extra") {
    return `extra:${target.item.id}`;
  }

  return "";
}

export function getDeletingId(deletingKey, kind) {
  if (!deletingKey?.startsWith(`${kind}:`)) return null;

  return deletingKey.slice(kind.length + 1);
}

export function getPedidoKeyFromDeleteTarget(target) {
  if (!target) return "";

  if (target.kind === "receita") {
    return `COM_RECEITA:${target.item.linhaId}`;
  }

  if (target.kind === "semReceita") {
    return `SEM_RECEITA:${target.item.id}`;
  }

  if (target.kind === "extra") {
    return `EXTRA:${target.item.id}`;
  }

  return "";
}

export function getDeleteDialogData(target) {
  if (!target) {
    return {
      title: "Remover item?",
      description: "Esta ação pode ser bloqueada se o item tiver histórico.",
      confirmLabel: "Remover",
      cancelLabel: "Cancelar",
    };
  }

  if (target.kind === "receita") {
    return {
      ...RECEITAS_PAGE.deleteDialog,
      description: `${RECEITAS_PAGE.deleteDialog.description} Medicamento: ${target.item.medicamento}.`,
    };
  }

  if (target.kind === "semReceita") {
    return {
      ...SEM_RECEITA_PAGE.deleteDialog,
      description: `${SEM_RECEITA_PAGE.deleteDialog.description} Medicamento: ${target.item.medicamento}.`,
    };
  }

  return {
    ...EXTRAS_PAGE.deleteDialog,
    description: `${EXTRAS_PAGE.deleteDialog.description} Medicamento: ${target.item.medicamento}.`,
  };
}

export function getDeleteSuccessMessage(target) {
  if (target?.kind === "receita") {
    return RECEITAS_PAGE.list.deleteSuccessMessage;
  }

  if (target?.kind === "semReceita") {
    return SEM_RECEITA_PAGE.list.deleteSuccessMessage;
  }

  return EXTRAS_PAGE.list.deleteSuccessMessage;
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
