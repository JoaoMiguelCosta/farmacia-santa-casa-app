import { normalizeText } from "../../../../shared/utils/normalizeText";
import { SANTACASA_REGULARIZACOES_PAGE } from "../config/santaCasaRegularizacoesPage.config";

export const UNKNOWN_LABEL = "—";
export const STATUS_FILTER_ALL = "all";
export const INITIAL_VISIBLE_MEDICAMENTOS = 5;
export const VISIBLE_MEDICAMENTOS_INCREMENT = 5;

export const DETAILS_STATUS_OPTIONS = [
  {
    value: STATUS_FILTER_ALL,
    label: SANTACASA_REGULARIZACOES_PAGE.details.statusAll,
  },
  {
    value: "PARCIALMENTE_REGULARIZADO",
    label: SANTACASA_REGULARIZACOES_PAGE.status.PARCIALMENTE_REGULARIZADO,
  },
  {
    value: "PENDENTE",
    label: SANTACASA_REGULARIZACOES_PAGE.status.PENDENTE,
  },
];

export function getUtenteTitle(group) {
  return (
    group?.utenteNome || SANTACASA_REGULARIZACOES_PAGE.details.titleFallback
  );
}

export function getUtenteNumber(group) {
  return group?.utenteNumero || UNKNOWN_LABEL;
}

export function getPedidosLabel(pedidoNumbers = []) {
  if (pedidoNumbers.length === 0) return UNKNOWN_LABEL;

  return pedidoNumbers.map((numero) => `#${numero}`).join(", ");
}

function getRegularizacaoPedidoSearchText(regularizacao) {
  const pedidoNumbers = Array.isArray(regularizacao?.pedidoNumbers)
    ? regularizacao.pedidoNumbers
    : [];

  const originPedidoNumbers = Array.isArray(regularizacao?.origemRegularizacoes)
    ? regularizacao.origemRegularizacoes.map((origin) => {
        return origin?.pedidoNumero ?? origin?.pedido?.numero ?? "";
      })
    : [];

  return [...pedidoNumbers, ...originPedidoNumbers]
    .filter(Boolean)
    .map((numero) => `#${numero} ${numero}`)
    .join(" ");
}

function getRegularizacaoSearchText(regularizacao) {
  return normalizeText(
    [
      regularizacao?.medicamento,
      regularizacao?.medicamentoNorm,
      regularizacao?.status,
      SANTACASA_REGULARIZACOES_PAGE.status[regularizacao?.status],
      getRegularizacaoPedidoSearchText(regularizacao),
    ].join(" "),
  );
}

export function filterMedicamentos({ medicamentos, search, status }) {
  const normalizedSearch = normalizeText(search);

  return medicamentos.filter((regularizacao) => {
    if (status !== STATUS_FILTER_ALL && regularizacao?.status !== status) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    return getRegularizacaoSearchText(regularizacao).includes(normalizedSearch);
  });
}
