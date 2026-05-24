import { RECEITAS_PAGE } from "../../receitas/config/receitasPage.config";
import { SEM_RECEITA_PAGE } from "../../sem-receita/config/semReceitaPage.config";
import { EXTRAS_PAGE } from "../../extras/config/extrasPage.config";

export const REGULARIZACAO_CONFIRMATION_REQUIRED =
  "REGULARIZACAO_CONFIRMATION_REQUIRED";

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
  if (tipo === "SEM_RECEITA") {
    return "Medicamentos não sujeitos a receita médica";
  }
  if (tipo === "EXTRA") return "Vendas Suspensas";

  return "lista correspondente";
}

export function formatVerbByQuantity(quantity, singular, plural) {
  return Number(quantity) === 1 ? singular : plural;
}

export function isRegularizacaoConfirmationRequired(error) {
  return (
    error?.status === 409 &&
    String(error?.code || error?.payload?.error || error?.payload?.code) ===
      REGULARIZACAO_CONFIRMATION_REQUIRED
  );
}

export function getRegularizacaoConfirmationDetails(error) {
  return error?.payload?.details || error?.details || null;
}

function getRegularizacaoLineKey(item) {
  const linha = item?.linha || {};

  return [
    linha.nome || item?.medicamento || "Medicamento",
    linha.validade || "",
    Number(linha.quantidade) || 0,
  ].join("|");
}

function getRegularizacaoPedidosLabel(pedidos) {
  const pedidoNumeros = Array.from(pedidos).filter(Boolean);

  if (pedidoNumeros.length === 0) {
    return "regularizações pendentes";
  }

  if (pedidoNumeros.length === 1) {
    return `o pedido ${pedidoNumeros[0]}`;
  }

  return `os pedidos ${pedidoNumeros.join(", ")}`;
}

function buildLineAvailabilityMessages(regularizacoes = []) {
  const linhasMap = new Map();

  regularizacoes.forEach((item) => {
    const key = getRegularizacaoLineKey(item);
    const linha = item?.linha || {};
    const quantidadeARegularizar = Number(item?.quantidadeARegularizar) || 0;

    const currentLine = linhasMap.get(key) || {
      medicamento: linha.nome || item?.medicamento || "Medicamento",
      quantidadeReceita: Number(linha.quantidade) || 0,
      quantidadeARegularizar: 0,
      pedidos: new Set(),
    };

    currentLine.quantidadeARegularizar += quantidadeARegularizar;

    if (item?.pedidoNumero) {
      currentLine.pedidos.add(`#${item.pedidoNumero}`);
    }

    linhasMap.set(key, currentLine);
  });

  return Array.from(linhasMap.values()).map((linha) => {
    const quantidadeDisponivel = Math.max(
      0,
      linha.quantidadeReceita - linha.quantidadeARegularizar,
    );

    const regularizacaoVerb = formatVerbByQuantity(
      linha.quantidadeARegularizar,
      "vai regularizar",
      "vão regularizar",
    );

    const regularizacaoMessage = `${linha.medicamento}: ${formatUnitsLabel(
      linha.quantidadeARegularizar,
    )} ${regularizacaoVerb} ${getRegularizacaoPedidosLabel(linha.pedidos)}`;

    if (quantidadeDisponivel > 0) {
      const disponibilidadeVerb = formatVerbByQuantity(
        quantidadeDisponivel,
        "fica",
        "ficam",
      );

      const disponibilidadeAdjective = formatVerbByQuantity(
        quantidadeDisponivel,
        "disponível",
        "disponíveis",
      );

      return `${regularizacaoMessage}; ${formatUnitsLabel(
        quantidadeDisponivel,
      )} ${disponibilidadeVerb} ${disponibilidadeAdjective} na linha de receita.`;
    }

    return `${regularizacaoMessage}; não fica quantidade disponível na linha de receita.`;
  });
}

export function buildRegularizacaoConfirmationDescription(preview) {
  const regularizacoes = Array.isArray(preview?.regularizacoes)
    ? preview.regularizacoes
    : [];

  if (regularizacoes.length === 0) {
    return RECEITAS_PAGE.regularizationDialog.fallbackDetails;
  }

  const totalRegularizado = Number(preview?.totalRegularizado) || 0;
  const lineMessages = buildLineAvailabilityMessages(regularizacoes);

  const details = lineMessages.slice(0, 4).join(" ");

  const extraCount =
    lineMessages.length > 4
      ? ` E há mais ${lineMessages.length - 4} linha(s) com impacto.`
      : "";

  return `${RECEITAS_PAGE.regularizationDialog.description} Impacto previsto: ${formatUnitsLabel(
    totalRegularizado,
  )} em ${regularizacoes.length} regularização(ões). ${details}${extraCount}`;
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
      return ` A Venda Suspensa ${extra.medicamento} foi removida porque passou a existir receita ativa para o mesmo medicamento.`;
    }

    return ` Na Venda Suspensa ${extra.medicamento}, ${formatUnitsLabel(
      quantidade,
    )} que ainda não tinham sido enviadas à Farmácia foram removidas. A parte já enviada foi preservada.`;
  }

  return ` ${extrasResolvidos.length} Vendas suspensas compatíveis foram ajustadas/removidas porque passaram a ter receita ativa.`;
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
  if (isRegularizacaoConfirmationRequired(requestError)) {
    return {};
  }

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
