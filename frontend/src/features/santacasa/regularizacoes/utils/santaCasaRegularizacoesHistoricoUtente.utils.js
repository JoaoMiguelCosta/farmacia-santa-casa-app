import { normalizeText } from "../../../../shared/utils/normalizeText";
import { SANTACASA_REGULARIZACOES_PAGE } from "../config/santaCasaRegularizacoesPage.config";
import { getRegularizacaoEventos } from "./santaCasaRegularizacoes.utils";

export const INITIAL_VISIBLE_HISTORY = 5;
export const VISIBLE_HISTORY_INCREMENT = 5;

export function getSafeDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return date;
}

export function getActivityDate(regularizacao) {
  return regularizacao?.updatedAt || regularizacao?.createdAt;
}

export function getActivityTimestamp(regularizacao) {
  const date = getSafeDate(getActivityDate(regularizacao));

  return date ? date.getTime() : 0;
}

export function getDateInputTimestamp(value, boundary = "start") {
  const normalizedValue = String(value || "").trim();

  if (!normalizedValue) return null;

  const [year, month, day] = normalizedValue.split("-").map(Number);

  if (!year || !month || !day) return null;

  const date =
    boundary === "end"
      ? new Date(year, month - 1, day, 23, 59, 59, 999)
      : new Date(year, month - 1, day, 0, 0, 0, 0);

  return date.getTime();
}

export function getUtenteTitle(summary) {
  return (
    summary?.utente?.nome ||
    SANTACASA_REGULARIZACOES_PAGE.historyDetails.titleFallback
  );
}

export function getRegularizacaoPedidoSearchText(regularizacao) {
  const pedidoNumero =
    regularizacao?.pedidoNumero ?? regularizacao?.pedido?.numero;

  if (!pedidoNumero) return "";

  return `#${pedidoNumero} ${pedidoNumero}`;
}

export function getEventosSearchText(regularizacao) {
  return getRegularizacaoEventos(regularizacao)
    .map((evento) => {
      return [
        evento?.receitaLinha?.nome,
        evento?.receitaLinha?.receita?.numero19,
        evento?.receitaLinha?.receita?.pinAcesso6,
        evento?.receitaLinha?.receita?.pinOpcao4,
        evento?.quantidade,
        evento?.createdAt,
      ]
        .filter(Boolean)
        .join(" ");
    })
    .join(" ");
}

export function getRegularizacaoSearchText(regularizacao) {
  return normalizeText(
    [
      regularizacao?.medicamento,
      regularizacao?.medicamentoNorm,
      regularizacao?.status,
      SANTACASA_REGULARIZACOES_PAGE.status[regularizacao?.status],
      getRegularizacaoPedidoSearchText(regularizacao),
      getEventosSearchText(regularizacao),
    ].join(" "),
  );
}

export function isRegularizacaoInsideDateRange({ regularizacao, from, to }) {
  const timestamp = getActivityTimestamp(regularizacao);

  if (!timestamp) return false;

  const fromTimestamp = getDateInputTimestamp(from, "start");
  const toTimestamp = getDateInputTimestamp(to, "end");

  if (fromTimestamp && timestamp < fromTimestamp) return false;
  if (toTimestamp && timestamp > toTimestamp) return false;

  return true;
}

export function sortRegularizacoesByActivity(regularizacoes = []) {
  return [...regularizacoes].sort((a, b) => {
    const dateDiff = getActivityTimestamp(b) - getActivityTimestamp(a);

    if (dateDiff !== 0) return dateDiff;

    return String(a?.medicamento || "").localeCompare(
      String(b?.medicamento || ""),
      "pt-PT",
      { sensitivity: "base" },
    );
  });
}

export function filterHistoricoRegularizacoes({ regularizacoes, search, from, to }) {
  const normalizedSearch = normalizeText(search);

  return sortRegularizacoesByActivity(regularizacoes).filter(
    (regularizacao) => {
      if (!isRegularizacaoInsideDateRange({ regularizacao, from, to })) {
        return false;
      }

      if (!normalizedSearch) return true;

      return getRegularizacaoSearchText(regularizacao).includes(normalizedSearch);
    },
  );
}
