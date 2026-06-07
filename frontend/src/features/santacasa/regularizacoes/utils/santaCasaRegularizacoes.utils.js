// src/features/santacasa/regularizacoes/utils/santaCasaRegularizacoes.utils.js

import { formatDateTime } from "../../../../shared/utils/formatDate";

import { SANTACASA_REGULARIZACOES_PAGE } from "../config/santaCasaRegularizacoesPage.config";

const UNKNOWN_LABEL = "—";
const REGULARIZACOES_VIEW_PARAM = "view";

export const SANTACASA_REGULARIZACOES_TABS = Object.freeze({
  pending: "pending",
  history: "history",
});

const ALLOWED_REGULARIZACOES_VIEWS = new Set(
  Object.values(SANTACASA_REGULARIZACOES_TABS),
);

function getSafeDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return date;
}

function getDateKey(value) {
  const date = getSafeDate(value);

  if (!date) return "sem-data";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDateLabel(value) {
  const date = getSafeDate(value);

  if (!date) return UNKNOWN_LABEL;

  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function normalizeRegularizacoesView(view) {
  const normalizedView = String(view || SANTACASA_REGULARIZACOES_TABS.pending)
    .trim()
    .toLowerCase();

  if (!ALLOWED_REGULARIZACOES_VIEWS.has(normalizedView)) {
    return SANTACASA_REGULARIZACOES_TABS.pending;
  }

  return normalizedView;
}

export function getRegularizacoesViewFromSearchParams(searchParams) {
  const safeSearchParams =
    searchParams instanceof URLSearchParams
      ? searchParams
      : new URLSearchParams(searchParams);

  return normalizeRegularizacoesView(
    safeSearchParams.get(REGULARIZACOES_VIEW_PARAM),
  );
}

export function buildRegularizacoesViewSearchParams({
  currentSearchParams,
  view,
}) {
  const nextSearchParams = new URLSearchParams(currentSearchParams);

  const normalizedView = normalizeRegularizacoesView(view);

  if (normalizedView === SANTACASA_REGULARIZACOES_TABS.pending) {
    nextSearchParams.delete(REGULARIZACOES_VIEW_PARAM);

    return nextSearchParams;
  }

  nextSearchParams.set(REGULARIZACOES_VIEW_PARAM, normalizedView);

  return nextSearchParams;
}

export function buildRegularizacoesViewRoute(baseRoute, view) {
  const searchParams = buildRegularizacoesViewSearchParams({
    currentSearchParams: new URLSearchParams(),
    view,
  });

  const queryString = searchParams.toString();

  if (!queryString) {
    return baseRoute;
  }

  return `${baseRoute}?${queryString}`;
}

export function getRegularizacaoStatusLabel(status) {
  return (
    SANTACASA_REGULARIZACOES_PAGE.status[status] || status || UNKNOWN_LABEL
  );
}

export function getRegularizacaoPedidoLabel(regularizacao) {
  const numero = Number(regularizacao?.pedidoNumero);

  if (!Number.isFinite(numero)) return UNKNOWN_LABEL;

  return `#${numero}`;
}

export function getRegularizacaoUtenteKey(regularizacao) {
  return (
    regularizacao?.utente?.id ||
    regularizacao?.utenteId ||
    `utente-${UNKNOWN_LABEL}`
  );
}

export function getRegularizacaoUtenteNomeLabel(regularizacao) {
  return regularizacao?.utente?.nome || UNKNOWN_LABEL;
}

export function getRegularizacaoUtenteNumeroLabel(regularizacao) {
  return regularizacao?.utente?.numero9 || UNKNOWN_LABEL;
}

export function getRegularizacaoUtenteLabel(regularizacao) {
  const nome = getRegularizacaoUtenteNomeLabel(regularizacao);

  const numero9 = getRegularizacaoUtenteNumeroLabel(regularizacao);

  return `${nome} · ${numero9}`;
}

export function getRegularizacaoMedicamentoLabel(regularizacao) {
  return regularizacao?.medicamento || UNKNOWN_LABEL;
}

export function getRegularizacaoCreatedAtLabel(regularizacao) {
  return formatDateTime(regularizacao?.createdAt);
}

export function getRegularizacaoUpdatedAtLabel(regularizacao) {
  return formatDateTime(regularizacao?.updatedAt);
}

export function getRegularizacaoQuantidadeSolicitada(regularizacao) {
  return Number(regularizacao?.quantidadeSolicitada) || 0;
}

export function getRegularizacaoQuantidadeRegularizada(regularizacao) {
  return Number(regularizacao?.quantidadeRegularizada) || 0;
}

export function getRegularizacaoQuantidadeRestante(regularizacao) {
  const restante = Number(regularizacao?.quantidadeRestante);

  if (Number.isFinite(restante)) {
    return Math.max(0, restante);
  }

  return Math.max(
    0,
    getRegularizacaoQuantidadeSolicitada(regularizacao) -
      getRegularizacaoQuantidadeRegularizada(regularizacao),
  );
}

export function getRegularizacaoProgressPercent(regularizacao) {
  const solicitada = getRegularizacaoQuantidadeSolicitada(regularizacao);

  const regularizada = getRegularizacaoQuantidadeRegularizada(regularizacao);

  if (solicitada <= 0) return 0;

  return Math.min(100, Math.round((regularizada / solicitada) * 100));
}

export function getRegularizacaoEventos(regularizacao) {
  return Array.isArray(regularizacao?.eventos) ? regularizacao.eventos : [];
}

export function hasRegularizacaoEventos(regularizacao) {
  return getRegularizacaoEventos(regularizacao).length > 0;
}

export function getRegularizacaoEventosCount(regularizacao) {
  return getRegularizacaoEventos(regularizacao).length;
}

export function getRegularizacaoSituationTitle(regularizacao) {
  if (regularizacao?.status === "REGULARIZADO") {
    return SANTACASA_REGULARIZACOES_PAGE.completedRecipe.title;
  }

  return SANTACASA_REGULARIZACOES_PAGE.waitingRecipe.title;
}

export function getRegularizacaoSituationDescription(regularizacao) {
  if (regularizacao?.status === "REGULARIZADO") {
    return SANTACASA_REGULARIZACOES_PAGE.completedRecipe.description;
  }

  return SANTACASA_REGULARIZACOES_PAGE.waitingRecipe.description;
}

export function getEventoQuantidadeLabel(evento) {
  const quantidade = Number(evento?.quantidade);

  if (!Number.isFinite(quantidade)) {
    return UNKNOWN_LABEL;
  }

  return String(quantidade);
}

export function getEventoCreatedAtLabel(evento) {
  return formatDateTime(evento?.createdAt);
}

export function getEventoReceitaLinhaLabel(evento) {
  return evento?.receitaLinha?.nome || UNKNOWN_LABEL;
}

export function getEventoReceitaNumeroLabel(evento) {
  const numero19 = evento?.receitaLinha?.receita?.numero19;

  return numero19 || UNKNOWN_LABEL;
}

export function getEventoReceitaPinAcessoLabel(evento) {
  const pinAcesso6 = evento?.receitaLinha?.receita?.pinAcesso6;

  return pinAcesso6 || UNKNOWN_LABEL;
}

export function getEventoReceitaPinOpcaoLabel(evento) {
  const pinOpcao4 = evento?.receitaLinha?.receita?.pinOpcao4;

  return pinOpcao4 || UNKNOWN_LABEL;
}

export function getEventoReceitaValidadeLabel(evento) {
  return formatDateTime(evento?.receitaLinha?.validade);
}

export function getSignalTotalEventos(signal) {
  return Number(signal?.totalEventos) || 0;
}

export function getSignalTotalUnidades(signal) {
  return Number(signal?.totalUnidades) || 0;
}

export function getSignalLatestEventoAtLabel(signal) {
  return formatDateTime(signal?.latestEventoAt);
}

export function buildRegularizacoesQuery({
  search = "",
  from = "",
  to = "",
  skip = 0,
  take = 50,
} = {}) {
  const normalizedSearch = String(search || "").trim();
  const normalizedFrom = String(from || "").trim();
  const normalizedTo = String(to || "").trim();

  return {
    skip,
    take,
    ...(normalizedSearch ? { search: normalizedSearch } : {}),
    ...(normalizedFrom ? { from: normalizedFrom } : {}),
    ...(normalizedTo ? { to: normalizedTo } : {}),
  };
}

export function hasRegularizacaoRestante(regularizacao) {
  return getRegularizacaoQuantidadeRestante(regularizacao) > 0;
}

export function isRegularizacaoConcluida(regularizacao) {
  return regularizacao?.status === "REGULARIZADO";
}

export function groupRegularizacoesByUtente(regularizacoes = []) {
  const groupsMap = new Map();

  for (const regularizacao of regularizacoes) {
    const key = getRegularizacaoUtenteKey(regularizacao);

    if (!groupsMap.has(key)) {
      groupsMap.set(key, {
        key,
        utenteNome: getRegularizacaoUtenteNomeLabel(regularizacao),
        utenteNumero: getRegularizacaoUtenteNumeroLabel(regularizacao),
        regularizacoes: [],
        totalRestante: 0,
        totalRegularizada: 0,
      });
    }

    const group = groupsMap.get(key);

    group.regularizacoes.push(regularizacao);

    group.totalRestante += getRegularizacaoQuantidadeRestante(regularizacao);

    group.totalRegularizada +=
      getRegularizacaoQuantidadeRegularizada(regularizacao);
  }

  return Array.from(groupsMap.values());
}

export function groupRegularizacoesHistoricoByDate(regularizacoes = []) {
  const groupsMap = new Map();

  for (const regularizacao of regularizacoes) {
    const dateValue = regularizacao?.updatedAt || regularizacao?.createdAt;

    const key = getDateKey(dateValue);

    if (!groupsMap.has(key)) {
      groupsMap.set(key, {
        key,
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

    group.totalEventos += getRegularizacaoEventosCount(regularizacao);
  }

  return Array.from(groupsMap.values());
}
