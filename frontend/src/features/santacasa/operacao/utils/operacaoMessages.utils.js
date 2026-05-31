// src/features/santacasa/operacao/utils/operacaoMessages.utils.js
import { RECEITAS_PAGE } from "../../receitas/config/receitasPage.config";

import {
  formatUnitsLabel,
  formatVerbByQuantity,
  getItemMedicationName,
  getOriginListLabel,
} from "./operacaoMedicamento.utils";

import {
  getCreatedReceitaLinhas,
  getLinhaQuantidadeRegularizada,
  getLinhaQuantidadeRestante,
} from "./operacaoRegularizacao.utils";

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
