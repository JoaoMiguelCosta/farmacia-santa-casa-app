import { formatDateTime } from "../../../../shared/utils/formatDate";
import { FARMACIA_REGULARIZACOES_PAGE } from "../config/farmaciaRegularizacoesPage.config";

const UNKNOWN_LABEL = "—";

const STATUS_PRIORITY = Object.freeze({
  PARCIALMENTE_REGULARIZADO: 0,
  PENDENTE: 1,
  REGULARIZADO: 2,
});

function normalizeFallbackText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function getComparableDateValue(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.getTime();
}

function getEarliestDateValue(values = []) {
  const timestamps = values
    .map(getComparableDateValue)
    .filter((value) => Number.isFinite(value));

  if (timestamps.length === 0) return null;

  return new Date(Math.min(...timestamps)).toISOString();
}

function getLatestDateValue(values = []) {
  const timestamps = values
    .map(getComparableDateValue)
    .filter((value) => Number.isFinite(value));

  if (timestamps.length === 0) return null;

  return new Date(Math.max(...timestamps)).toISOString();
}

function getRegularizacaoActivityDate(regularizacao) {
  return regularizacao?.updatedAt || regularizacao?.createdAt;
}

function getRegularizacaoUtenteKey(regularizacao) {
  return (
    regularizacao?.utenteId ||
    regularizacao?.utente?.id ||
    regularizacao?.utente?.numero9 ||
    UNKNOWN_LABEL
  );
}

function getRegularizacaoMedicamentoKey(regularizacao) {
  const medicamentoId = regularizacao?.medicamentoId;

  if (medicamentoId) {
    return `id:${medicamentoId}`;
  }

  const medicamentoNorm = String(regularizacao?.medicamentoNorm || "").trim();

  if (medicamentoNorm) {
    return `norm:${medicamentoNorm}`;
  }

  return `name:${normalizeFallbackText(regularizacao?.medicamento)}`;
}

function getRegularizacaoGroupKey(regularizacao) {
  return [
    getRegularizacaoUtenteKey(regularizacao),
    getRegularizacaoMedicamentoKey(regularizacao),
  ].join("::");
}

function getPedidoNumberFromRegularizacao(regularizacao) {
  const pedidoNumero = Number(
    regularizacao?.pedidoNumero ?? regularizacao?.pedido?.numero,
  );

  if (!Number.isFinite(pedidoNumero)) return null;

  return pedidoNumero;
}

function getUniquePedidoNumbers(regularizacoes = []) {
  const pedidoNumbers = new Set();

  regularizacoes.forEach((regularizacao) => {
    const pedidoNumero = getPedidoNumberFromRegularizacao(regularizacao);

    if (pedidoNumero) {
      pedidoNumbers.add(pedidoNumero);
    }
  });

  return Array.from(pedidoNumbers).sort((a, b) => a - b);
}

function getAggregatedStatus({
  quantidadeSolicitada,
  quantidadeRegularizada,
  quantidadeRestante,
}) {
  if (quantidadeRestante <= 0 && quantidadeSolicitada > 0) {
    return "REGULARIZADO";
  }

  if (quantidadeRegularizada > 0) {
    return "PARCIALMENTE_REGULARIZADO";
  }

  return "PENDENTE";
}

function getStatusPriority(status) {
  return STATUS_PRIORITY[status] ?? 99;
}

function sortRegularizacoesByOperationalPriority(regularizacoes = []) {
  return [...regularizacoes].sort((a, b) => {
    const statusDiff =
      getStatusPriority(a.status) - getStatusPriority(b.status);

    if (statusDiff !== 0) return statusDiff;

    const aCreatedAt =
      getComparableDateValue(a.createdAt) ?? Number.MAX_SAFE_INTEGER;

    const bCreatedAt =
      getComparableDateValue(b.createdAt) ?? Number.MAX_SAFE_INTEGER;

    const dateDiff = aCreatedAt - bCreatedAt;

    if (dateDiff !== 0) return dateDiff;

    const remainingDiff =
      getRegularizacaoQuantidadeRestante(b) -
      getRegularizacaoQuantidadeRestante(a);

    if (remainingDiff !== 0) return remainingDiff;

    return getRegularizacaoMedicamentoLabel(a).localeCompare(
      getRegularizacaoMedicamentoLabel(b),
      "pt-PT",
      {
        sensitivity: "base",
      },
    );
  });
}

function sortUtenteGroupsByOperationalPriority(groups = []) {
  return [...groups].sort((a, b) => {
    const partialDiff =
      Number(b.totalParciais > 0) - Number(a.totalParciais > 0);

    if (partialDiff !== 0) return partialDiff;

    const restanteDiff = b.totalRestante - a.totalRestante;

    if (restanteDiff !== 0) return restanteDiff;

    const medicamentosDiff = b.totalMedicamentos - a.totalMedicamentos;

    if (medicamentosDiff !== 0) return medicamentosDiff;

    const aCreatedAt =
      getComparableDateValue(a.createdAt) ?? Number.MAX_SAFE_INTEGER;

    const bCreatedAt =
      getComparableDateValue(b.createdAt) ?? Number.MAX_SAFE_INTEGER;

    const dateDiff = aCreatedAt - bCreatedAt;

    if (dateDiff !== 0) return dateDiff;

    return String(a.utente?.nome || "").localeCompare(
      String(b.utente?.nome || ""),
      "pt-PT",
      {
        sensitivity: "base",
      },
    );
  });
}

function sortHistoricoGroupsByPriority(groups = []) {
  return [...groups].sort((a, b) => {
    const latestDiff =
      (getComparableDateValue(b.latestActivityAt) || 0) -
      (getComparableDateValue(a.latestActivityAt) || 0);

    if (latestDiff !== 0) return latestDiff;

    const totalDiff = b.totalRegularizacoes - a.totalRegularizacoes;

    if (totalDiff !== 0) return totalDiff;

    const unidadesDiff =
      b.totalUnidadesRegularizadas - a.totalUnidadesRegularizadas;

    if (unidadesDiff !== 0) return unidadesDiff;

    return String(a.utente?.nome || "").localeCompare(
      String(b.utente?.nome || ""),
      "pt-PT",
      {
        sensitivity: "base",
      },
    );
  });
}

function buildAggregatedRegularizacao(regularizacoes = []) {
  const [firstRegularizacao] = regularizacoes;

  const quantidadeSolicitada = regularizacoes.reduce((total, regularizacao) => {
    return total + getRegularizacaoQuantidadeSolicitada(regularizacao);
  }, 0);

  const quantidadeRegularizada = regularizacoes.reduce(
    (total, regularizacao) => {
      return total + getRegularizacaoQuantidadeRegularizada(regularizacao);
    },
    0,
  );

  const quantidadeRestante = Math.max(
    0,
    quantidadeSolicitada - quantidadeRegularizada,
  );

  const pedidoNumbers = getUniquePedidoNumbers(regularizacoes);
  const eventos = regularizacoes.flatMap(getRegularizacaoEventos);

  return {
    ...firstRegularizacao,

    id: getRegularizacaoGroupKey(firstRegularizacao),
    isAggregated: true,

    origemRegularizacoes: regularizacoes,
    pedidoNumbers,

    pedidoNumero: pedidoNumbers.length === 1 ? pedidoNumbers[0] : null,

    quantidadeSolicitada,
    quantidadeRegularizada,
    quantidadeRestante,

    status: getAggregatedStatus({
      quantidadeSolicitada,
      quantidadeRegularizada,
      quantidadeRestante,
    }),

    eventos,

    createdAt: getEarliestDateValue(
      regularizacoes.map((regularizacao) => regularizacao?.createdAt),
    ),

    updatedAt: getLatestDateValue(
      regularizacoes.map((regularizacao) => regularizacao?.updatedAt),
    ),
  };
}

function buildUtenteGroup(regularizacoes = []) {
  const [firstRegularizacao] = regularizacoes;

  const medicamentoMap = new Map();

  regularizacoes.forEach((regularizacao) => {
    const medicamentoKey = getRegularizacaoMedicamentoKey(regularizacao);
    const currentItems = medicamentoMap.get(medicamentoKey) || [];

    medicamentoMap.set(medicamentoKey, [...currentItems, regularizacao]);
  });

  const medicamentos = sortRegularizacoesByOperationalPriority(
    Array.from(medicamentoMap.values()).map(buildAggregatedRegularizacao),
  );

  const pedidoNumbers = getUniquePedidoNumbers(regularizacoes);

  const totalRestante = medicamentos.reduce((total, regularizacao) => {
    return total + getRegularizacaoQuantidadeRestante(regularizacao);
  }, 0);

  const totalParciais = medicamentos.filter((regularizacao) => {
    return regularizacao.status === "PARCIALMENTE_REGULARIZADO";
  }).length;

  const totalPendentes = medicamentos.filter((regularizacao) => {
    return regularizacao.status === "PENDENTE";
  }).length;

  return {
    id: getRegularizacaoUtenteKey(firstRegularizacao),
    utente: firstRegularizacao?.utente || null,
    regularizacoes,
    medicamentos,
    pedidoNumbers,
    totalMedicamentos: medicamentos.length,
    totalPedidos: pedidoNumbers.length,
    totalRestante,
    totalParciais,
    totalPendentes,
    createdAt: getEarliestDateValue(
      regularizacoes.map((regularizacao) => regularizacao?.createdAt),
    ),
    updatedAt: getLatestDateValue(
      regularizacoes.map((regularizacao) => regularizacao?.updatedAt),
    ),
  };
}

function buildHistoricoUtenteGroup(regularizacoes = []) {
  const [firstRegularizacao] = regularizacoes;

  const pedidoNumbers = getUniquePedidoNumbers(regularizacoes);

  const totalUnidadesRegularizadas = regularizacoes.reduce(
    (total, regularizacao) => {
      return total + getRegularizacaoQuantidadeRegularizada(regularizacao);
    },
    0,
  );

  const totalReceitasUsadas = regularizacoes.reduce((total, regularizacao) => {
    return total + getRegularizacaoEventosCount(regularizacao);
  }, 0);

  const latestActivityAt = getLatestDateValue(
    regularizacoes.map(getRegularizacaoActivityDate),
  );

  return {
    id: getRegularizacaoUtenteKey(firstRegularizacao),
    utente: firstRegularizacao?.utente || null,
    regularizacoes,
    pedidoNumbers,
    totalRegularizacoes: regularizacoes.length,
    totalUnidadesRegularizadas,
    totalReceitasUsadas,
    totalPedidos: pedidoNumbers.length,
    latestActivityAt,
    latestActivityLabel: formatDateTime(latestActivityAt),
  };
}

export function groupRegularizacoesByUtente(regularizacoes = []) {
  const utenteMap = new Map();

  regularizacoes.forEach((regularizacao) => {
    const utenteKey = getRegularizacaoUtenteKey(regularizacao);
    const currentItems = utenteMap.get(utenteKey) || [];

    utenteMap.set(utenteKey, [...currentItems, regularizacao]);
  });

  return sortUtenteGroupsByOperationalPriority(
    Array.from(utenteMap.values()).map(buildUtenteGroup),
  );
}

export function groupHistoricoRegularizacoesByUtente(regularizacoes = []) {
  const utenteMap = new Map();

  regularizacoes.forEach((regularizacao) => {
    const utenteKey = getRegularizacaoUtenteKey(regularizacao);
    const currentItems = utenteMap.get(utenteKey) || [];

    utenteMap.set(utenteKey, [...currentItems, regularizacao]);
  });

  return sortHistoricoGroupsByPriority(
    Array.from(utenteMap.values()).map(buildHistoricoUtenteGroup),
  );
}

export function getRegularizacaoStatusLabel(status) {
  return FARMACIA_REGULARIZACOES_PAGE.status[status] || status || UNKNOWN_LABEL;
}

export function getRegularizacaoPedidoNumbers(regularizacao) {
  if (Array.isArray(regularizacao?.pedidoNumbers)) {
    return regularizacao.pedidoNumbers;
  }

  const pedidoNumero = getPedidoNumberFromRegularizacao(regularizacao);

  return pedidoNumero ? [pedidoNumero] : [];
}

export function getRegularizacaoPedidoLabel(regularizacao) {
  const pedidoNumbers = getRegularizacaoPedidoNumbers(regularizacao);

  if (pedidoNumbers.length === 0) return UNKNOWN_LABEL;

  return pedidoNumbers.map((pedidoNumero) => `#${pedidoNumero}`).join(", ");
}

export function getRegularizacaoOrigins(regularizacao) {
  if (Array.isArray(regularizacao?.origemRegularizacoes)) {
    return regularizacao.origemRegularizacoes;
  }

  return regularizacao ? [regularizacao] : [];
}

export function hasRegularizacaoOrigins(regularizacao) {
  return getRegularizacaoOrigins(regularizacao).length > 0;
}

export function getRegularizacaoUtenteLabel(regularizacao) {
  const nome = regularizacao?.utente?.nome || UNKNOWN_LABEL;
  const numero9 = regularizacao?.utente?.numero9 || UNKNOWN_LABEL;

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

export function getEventoQuantidadeLabel(evento) {
  const quantidade = Number(evento?.quantidade);

  if (!Number.isFinite(quantidade)) return UNKNOWN_LABEL;

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
  medicamento = "",
  from = "",
  to = "",
  skip = 0,
  take = 50,
} = {}) {
  const normalizedSearch = String(search || "").trim();
  const normalizedMedicamento = String(medicamento || "").trim();
  const normalizedFrom = String(from || "").trim();
  const normalizedTo = String(to || "").trim();

  return {
    skip,
    take,
    ...(normalizedSearch ? { search: normalizedSearch } : {}),
    ...(normalizedMedicamento ? { medicamento: normalizedMedicamento } : {}),
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
