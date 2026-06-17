// src/modules/extras/extras.service.js
const extrasRepository = require("./extras.repository");
const utentesRepository = require("../utentes/utentes.repository");

const { normalizeText } = require("../../shared/utils/normalize");

const { toExtraDTO, getReceitaLinhaRestanteDTO } = require("./extras.mappers");

const { validateCreateExtraPayload } = require("./extras.validators");

const { assertUtenteOperational } = require("../utentes/utentes.guards");

const {
  conflict,
  forbidden,
  notFound,
} = require("../../shared/errors/AppError");

async function ensureUtenteOperational(utenteId, actionLabel) {
  const utente = await utentesRepository.findById(utenteId);

  return assertUtenteOperational(utente, actionLabel);
}

function getLinhaMedicamentoNorm(linha) {
  return normalizeText(linha.medicamentoRef?.nome || linha.nome);
}

function getExtraMedicamentoNorm(extra) {
  return normalizeText(extra.medicamentoRef?.nome || extra.medicamento);
}

function buildDraftQuantityMap(receitaDraftItems = []) {
  return receitaDraftItems.reduce((map, item) => {
    return {
      ...map,
      [item.linhaId]: Number(item.quantidade) || 0,
    };
  }, {});
}

function getReceitaLinhaRestanteVisual(linha, draftQuantityMap) {
  const quantidadeRestante = getReceitaLinhaRestanteDTO(linha);
  const quantidadeEmPedidoDraft = Number(draftQuantityMap[linha.id]) || 0;

  return Math.max(0, quantidadeRestante - quantidadeEmPedidoDraft);
}

function getExtraQuantidadeRestante(extra) {
  return Math.max(
    0,
    Number(extra.quantidadeSolicitada || 0) -
      Number(extra.quantidadeRegularizada || 0) -
      Number(extra.quantidadeCancelada || 0),
  );
}

async function listByUtente(utenteId) {
  await ensureUtenteOperational(
    utenteId,
    "consultar vendas suspensas deste utente",
  );

  const rows = await extrasRepository.findByUtente(utenteId);

  return rows.map(toExtraDTO).filter((extra) => extra.quantidadeRestante > 0);
}

async function createForUtente(utenteId, payload) {
  await ensureUtenteOperational(
    utenteId,
    "criar Venda Suspensa para este utente",
  );

  const data = validateCreateExtraPayload(payload);

  const receitaLinhas =
    await extrasRepository.findActiveReceitaLinhasByUtente(utenteId);

  const draftQuantityMap = buildDraftQuantityMap(data.receitaDraftItems);

  const matchingReceitaLinha = receitaLinhas.find((linha) => {
    const sameMedicamento =
      getLinhaMedicamentoNorm(linha) === data.medicamentoNorm;

    if (!sameMedicamento) return false;

    return getReceitaLinhaRestanteVisual(linha, draftQuantityMap) > 0;
  });

  if (matchingReceitaLinha) {
    throw conflict(
      "Já existe receita ativa com quantidade disponível para este medicamento.",
    );
  }

  const openExtras = await extrasRepository.findOpenExtrasByUtente(utenteId);

  const duplicatedExtra = openExtras.map(toExtraDTO).find((extra) => {
    const sameMedicamento =
      getExtraMedicamentoNorm(extra) === data.medicamentoNorm;

    return sameMedicamento && extra.quantidadeRestante > 0;
  });

  if (duplicatedExtra) {
    throw conflict(
      "Já existe uma Venda Suspensa em aberto para este medicamento.",
    );
  }

  const created = await extrasRepository.create(utenteId, data);

  return toExtraDTO(created);
}

async function removeForUtente(utenteId, extraId) {
  await ensureUtenteOperational(
    utenteId,
    "remover Venda Suspensa deste utente",
  );

  const extra = await extrasRepository.findById(extraId);

  if (!extra) {
    throw notFound("Venda Suspensa não encontrada.");
  }

  if (extra.utenteId !== utenteId) {
    throw forbidden("Venda Suspensa não pertence a este utente.");
  }

  const pendingPedidoItems =
    await extrasRepository.countPedidoItemsByExtraAndStatus(extraId, [
      "PENDENTE",
    ]);

  if (pendingPedidoItems > 0) {
    throw conflict(
      "Não é possível remover: a Venda Suspensa ainda está associada a pedidos pendentes.",
    );
  }

  const [validatedPedidoItems, regularizacoes] = await Promise.all([
    extrasRepository.countPedidoItemsByExtraAndStatus(extraId, ["VALIDADO"]),
    extrasRepository.countRegularizacoesByExtra(extraId),
  ]);

  const hasQuantidadeAceiteOuRegularizacao =
    validatedPedidoItems > 0 || regularizacoes > 0;

  if (hasQuantidadeAceiteOuRegularizacao) {
    const quantidadeRestante = getExtraQuantidadeRestante(extra);

    if (quantidadeRestante > 0) {
      await extrasRepository.cancelRemainingById(extraId, quantidadeRestante);
    }

    return;
  }

  await extrasRepository.deleteById(extraId);
}

module.exports = {
  listByUtente,
  createForUtente,
  removeForUtente,
};
