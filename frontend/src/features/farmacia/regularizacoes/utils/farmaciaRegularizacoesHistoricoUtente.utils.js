import { normalizeText } from "../../../../shared/utils/normalizeText";
import { FARMACIA_REGULARIZACOES_PAGE } from "../config/farmaciaRegularizacoesPage.config";
import {
  getRegularizacaoEventos,
  getRegularizacaoQuantidadeRegularizada,
} from "./farmaciaRegularizacoes.utils";

export const INITIAL_VISIBLE_HISTORY = 5;
export const VISIBLE_HISTORY_INCREMENT = 5;

export function getSafeDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return date;
}

export function getDateTimestamp(value) {
  const date = getSafeDate(value);

  return date ? date.getTime() : 0;
}

export function getDateInputTimestamp(value, endOfDay = false) {
  if (!value) return null;

  const suffix = endOfDay ? "T23:59:59.999" : "T00:00:00.000";
  const date = new Date(`${value}${suffix}`);

  if (Number.isNaN(date.getTime())) return null;

  return date.getTime();
}

export function getDateKey(value) {
  const date = getSafeDate(value);

  if (!date) return "sem-data";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getDateLabel(value) {
  const date = getSafeDate(value);

  if (!date) return "—";

  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function getRegularizacaoActivityDate(regularizacao) {
  return regularizacao?.updatedAt || regularizacao?.createdAt;
}

export function getPedidoNumero(regularizacao) {
  const pedidoNumero = Number(
    regularizacao?.pedidoNumero ?? regularizacao?.pedido?.numero,
  );

  if (!Number.isFinite(pedidoNumero)) return null;

  return pedidoNumero;
}

export function getEventoSearchText(evento) {
  const receita = evento?.receitaLinha?.receita;

  return [
    evento?.receitaLinha?.nome,
    receita?.numero19,
    receita?.pinAcesso6,
    receita?.pinOpcao4,
  ]
    .filter(Boolean)
    .join(" ");
}

export function getRegularizacaoSearchText(regularizacao) {
  const pedidoNumero = getPedidoNumero(regularizacao);
  const eventosText = getRegularizacaoEventos(regularizacao)
    .map(getEventoSearchText)
    .join(" ");

  return normalizeText(
    [
      regularizacao?.medicamento,
      regularizacao?.medicamentoNorm,
      regularizacao?.status,
      FARMACIA_REGULARIZACOES_PAGE.status[regularizacao?.status],
      pedidoNumero ? `#${pedidoNumero} ${pedidoNumero}` : "",
      eventosText,
    ].join(" "),
  );
}

export function sortHistoricoRegularizacoes(regularizacoes = []) {
  return [...regularizacoes].sort((a, b) => {
    const dateDiff =
      getDateTimestamp(getRegularizacaoActivityDate(b)) -
      getDateTimestamp(getRegularizacaoActivityDate(a));

    if (dateDiff !== 0) return dateDiff;

    const pedidoDiff = (getPedidoNumero(b) || 0) - (getPedidoNumero(a) || 0);

    if (pedidoDiff !== 0) return pedidoDiff;

    return String(a?.medicamento || "").localeCompare(
      String(b?.medicamento || ""),
      "pt-PT",
      { sensitivity: "base" },
    );
  });
}

export function filterHistoricoRegularizacoes({ regularizacoes, search, from, to }) {
  const normalizedSearch = normalizeText(search);
  const fromTimestamp = getDateInputTimestamp(from);
  const toTimestamp = getDateInputTimestamp(to, true);

  return regularizacoes.filter((regularizacao) => {
    const activityTimestamp = getDateTimestamp(
      getRegularizacaoActivityDate(regularizacao),
    );

    if (fromTimestamp && activityTimestamp < fromTimestamp) return false;
    if (toTimestamp && activityTimestamp > toTimestamp) return false;
    if (!normalizedSearch) return true;

    return getRegularizacaoSearchText(regularizacao).includes(normalizedSearch);
  });
}

export function groupHistoricoByDate(regularizacoes = []) {
  const groupsMap = new Map();

  sortHistoricoRegularizacoes(regularizacoes).forEach((regularizacao) => {
    const dateValue = getRegularizacaoActivityDate(regularizacao);
    const key = getDateKey(dateValue);

    if (!groupsMap.has(key)) {
      groupsMap.set(key, {
        key,
        dateValue,
        dateLabel: getDateLabel(dateValue),
        regularizacoes: [],
        totalRegularizada: 0,
        totalEventos: 0,
      });
    }

    const group = groupsMap.get(key);

    group.regularizacoes.push(regularizacao);
    group.totalRegularizada +=
      getRegularizacaoQuantidadeRegularizada(regularizacao);
    group.totalEventos += getRegularizacaoEventos(regularizacao).length;
  });

  return Array.from(groupsMap.values()).sort(
    (a, b) => getDateTimestamp(b.dateValue) - getDateTimestamp(a.dateValue),
  );
}

export function getUtenteTitle(summary) {
  return (
    summary?.utente?.nome ||
    FARMACIA_REGULARIZACOES_PAGE.historyDetails.titleFallback
  );
}
