import { formatDateTime } from "../../../../shared/utils/formatDate";
import { normalizeText } from "../../../../shared/utils/normalizeText";

import {
  getRegularizacaoUtenteKey,
  getRegularizacaoUtenteNomeLabel,
  getRegularizacaoUtenteNumeroLabel,
  getUniquePedidoNumbers,
  getRegularizacaoQuantidadeSolicitada,
  getRegularizacaoQuantidadeRegularizada,
  getRegularizacaoQuantidadeRestante,
  getRegularizacaoEventos,
  getRegularizacaoEventosCount,
  getRegularizacaoMedicamentoLabel,
} from "./santaCasaRegularizacoesAccessors.utils";

const UNKNOWN_LABEL = "—";

const STATUS_PRIORITY = Object.freeze({
  PARCIALMENTE_REGULARIZADO: 0,
  PENDENTE: 1,
  REGULARIZADO: 2,
});

function getSafeDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return date;
}

function getComparableDateValue(value) {
  const date = getSafeDate(value);

  return date ? date.getTime() : null;
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

function getRegularizacaoMedicamentoKey(regularizacao) {
  const medicamentoId = regularizacao?.medicamentoId;

  if (medicamentoId) {
    return `id:${medicamentoId}`;
  }

  const medicamentoNorm = String(regularizacao?.medicamentoNorm || "").trim();

  if (medicamentoNorm) {
    return `norm:${medicamentoNorm}`;
  }

  return `name:${normalizeText(regularizacao?.medicamento)}`;
}

function getRegularizacaoGroupKey(regularizacao) {
  return [
    getRegularizacaoUtenteKey(regularizacao),
    getRegularizacaoMedicamentoKey(regularizacao),
  ].join("::");
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

    return String(a.utente?.nome || a.utenteNome || "").localeCompare(
      String(b.utente?.nome || b.utenteNome || ""),
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

    return String(a.utente?.nome || a.utenteNome || "").localeCompare(
      String(b.utente?.nome || b.utenteNome || ""),
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

  const totalRegularizada = medicamentos.reduce((total, regularizacao) => {
    return total + getRegularizacaoQuantidadeRegularizada(regularizacao);
  }, 0);

  const totalParciais = medicamentos.filter((regularizacao) => {
    return regularizacao.status === "PARCIALMENTE_REGULARIZADO";
  }).length;

  const totalPendentes = medicamentos.filter((regularizacao) => {
    return regularizacao.status === "PENDENTE";
  }).length;

  return {
    id: getRegularizacaoUtenteKey(firstRegularizacao),
    key: getRegularizacaoUtenteKey(firstRegularizacao),

    utente: firstRegularizacao?.utente || null,
    utenteNome: getRegularizacaoUtenteNomeLabel(firstRegularizacao),
    utenteNumero: getRegularizacaoUtenteNumeroLabel(firstRegularizacao),

    regularizacoes,
    medicamentos,
    pedidoNumbers,

    totalMedicamentos: medicamentos.length,
    totalPedidos: pedidoNumbers.length,
    totalRestante,
    totalRegularizada,
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
    key: getRegularizacaoUtenteKey(firstRegularizacao),

    utente: firstRegularizacao?.utente || null,
    utenteNome: getRegularizacaoUtenteNomeLabel(firstRegularizacao),
    utenteNumero: getRegularizacaoUtenteNumeroLabel(firstRegularizacao),

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
  const groupsMap = new Map();

  for (const regularizacao of regularizacoes) {
    const key = getRegularizacaoUtenteKey(regularizacao);
    const currentItems = groupsMap.get(key) || [];

    groupsMap.set(key, [...currentItems, regularizacao]);
  }

  return sortUtenteGroupsByOperationalPriority(
    Array.from(groupsMap.values()).map(buildUtenteGroup),
  );
}

export function groupHistoricoRegularizacoesByUtente(regularizacoes = []) {
  const groupsMap = new Map();

  for (const regularizacao of regularizacoes) {
    const key = getRegularizacaoUtenteKey(regularizacao);
    const currentItems = groupsMap.get(key) || [];

    groupsMap.set(key, [...currentItems, regularizacao]);
  }

  return sortHistoricoGroupsByPriority(
    Array.from(groupsMap.values()).map(buildHistoricoUtenteGroup),
  );
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
