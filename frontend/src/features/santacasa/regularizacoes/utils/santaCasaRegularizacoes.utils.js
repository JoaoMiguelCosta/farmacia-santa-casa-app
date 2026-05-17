import { formatDateTime } from "../../../../shared/utils/formatDate";
import { SANTACASA_REGULARIZACOES_PAGE } from "../config/santaCasaRegularizacoesPage.config";

const UNKNOWN_LABEL = "—";

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
  medicamento,
  utenteId,
  skip = 0,
  take = 50,
} = {}) {
  const normalizedMedicamento = String(medicamento || "").trim();
  const normalizedUtenteId = String(utenteId || "").trim();

  return {
    skip,
    take,
    ...(normalizedMedicamento ? { medicamento: normalizedMedicamento } : {}),
    ...(normalizedUtenteId ? { utenteId: normalizedUtenteId } : {}),
  };
}

export function hasRegularizacaoRestante(regularizacao) {
  return getRegularizacaoQuantidadeRestante(regularizacao) > 0;
}

export function isRegularizacaoConcluida(regularizacao) {
  return regularizacao?.status === "REGULARIZADO";
}
