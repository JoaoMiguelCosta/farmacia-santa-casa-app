// src/features/santacasa/operacao/utils/operacaoRegularizacao.utils.js
import { RECEITAS_PAGE } from "../../receitas/config/receitasPage.config";

import {
  formatUnitsLabel,
  formatVerbByQuantity,
} from "./operacaoMedicamento.utils";

export const REGULARIZACAO_CONFIRMATION_REQUIRED =
  "REGULARIZACAO_CONFIRMATION_REQUIRED";

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

export function getResolvedExtraKeys(extrasResolvidos = []) {
  return extrasResolvidos
    .map((extra) => extra?.id)
    .filter(Boolean)
    .map((extraId) => `EXTRA:${extraId}`);
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
