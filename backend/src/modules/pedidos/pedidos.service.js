// src/modules/pedidos/pedidos.service.js
const repository = require("./pedidos.repository");
const alertasService = require("../alertas/alertas.service");

const {
  validateCreatePedidoPayload,
  parseHistoricoQuery,
  parseCancelPedidoPayload,
  parsePendentesQuery,
} = require("./pedidos.validators");

const { toPedidoDTO } = require("./pedidos.mappers");

const { assertUtenteOperational } = require("../utentes/utentes.guards");
const { normalizeText } = require("../../shared/utils/normalize");

const {
  conflict,
  forbidden,
  notFound,
} = require("../../shared/errors/AppError");

function sumPendingQuantity(items = []) {
  return items.reduce((total, item) => {
    return total + (Number(item.quantidade) || 0);
  }, 0);
}

function getReceitaLinhaDisponivel(linha) {
  const reservadoPendente = sumPendingQuantity(linha.pedidoItens);

  return Math.max(
    0,
    Number(linha.quantidade || 0) -
      Number(linha.quantidadeDispensada || 0) -
      reservadoPendente,
  );
}

function getReceitaLinhaMedicamentoName(linha) {
  return linha?.medicamentoRef?.nome || linha?.nome || "";
}

function getReceitaLinhaMedicamentoNorm(linha) {
  return normalizeText(getReceitaLinhaMedicamentoName(linha));
}

function hasSameReceitaMedicamento(a, b) {
  if (a?.medicamentoId && b?.medicamentoId) {
    return a.medicamentoId === b.medicamentoId;
  }

  const aNorm = getReceitaLinhaMedicamentoNorm(a);
  const bNorm = getReceitaLinhaMedicamentoNorm(b);

  return Boolean(aNorm) && aNorm === bNorm;
}

function getDateLabel(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "validade anterior";
  }

  return date.toISOString().slice(0, 10);
}

function getRequestedQuantityForReceitaLinha(items = [], linhaId) {
  return items.reduce((total, item) => {
    if (item.tipo !== "COM_RECEITA") return total;
    if (item.id !== linhaId) return total;

    return total + (Number(item.quantidade) || 0);
  }, 0);
}

async function ensureUtenteOperational(utenteId, actionLabel) {
  const utente = await repository.findUtenteById(utenteId);

  return assertUtenteOperational(utente, actionLabel);
}

function assertOwnership(actualUtenteId, expectedUtenteId, message) {
  if (actualUtenteId !== expectedUtenteId) {
    throw forbidden(message);
  }
}

function validateReceitaLinhaAvailability(linha, quantidade) {
  if (linha.status !== "ATIVA") {
    throw conflict("Linha de receita não está ativa.");
  }

  if (new Date(linha.validade) <= new Date()) {
    throw conflict("Linha de receita expirada.");
  }

  const disponivel = getReceitaLinhaDisponivel(linha);

  if (quantidade > disponivel) {
    throw conflict(
      `Quantidade indisponível para "${linha.nome}". Disponível: ${disponivel}.`,
    );
  }

  return disponivel;
}

async function assertReceitaLinhaFefoPolicy(linha, currentPedidoItems = []) {
  const utenteId = linha.receita?.utenteId;
  const beforeValidade = new Date(linha.validade);

  if (!utenteId || Number.isNaN(beforeValidade.getTime())) {
    return;
  }

  const earlierLinhas = await repository.findEarlierActiveReceitaLinhasByUtente(
    {
      utenteId,
      beforeValidade,
      excludeLinhaId: linha.id,
    },
  );

  const blockingLinha = earlierLinhas.find((candidate) => {
    if (!hasSameReceitaMedicamento(candidate, linha)) {
      return false;
    }

    const disponivel = getReceitaLinhaDisponivel(candidate);

    if (disponivel <= 0) {
      return false;
    }

    const quantidadeJaPedidaNestePedido = getRequestedQuantityForReceitaLinha(
      currentPedidoItems,
      candidate.id,
    );

    return Math.max(0, disponivel - quantidadeJaPedidaNestePedido) > 0;
  });

  if (!blockingLinha) {
    return;
  }

  throw conflict(
    `Existe uma receita de "${getReceitaLinhaMedicamentoName(
      linha,
    )}" com validade mais próxima (${getDateLabel(
      blockingLinha.validade,
    )}). Usa primeiro a receita que expira mais cedo.`,
  );
}

function validateSemReceitaAvailability(row, quantidade) {
  const reservadoPendente = sumPendingQuantity(row.pedidoItens);

  const disponivel = Math.max(
    0,
    Number(row.quantidade || 0) - reservadoPendente,
  );

  if (quantidade > disponivel) {
    throw conflict(
      `Quantidade indisponível para "${row.medicamento}". Disponível: ${disponivel}.`,
    );
  }

  return disponivel;
}

function validateExtraAvailability(row, quantidade) {
  if (!["PENDENTE", "PARCIALMENTE_REGULARIZADO"].includes(row.status)) {
    throw conflict("Venda Suspensa não está em aberto.");
  }

  const reservadoPendente = sumPendingQuantity(row.pedidoItens);

  const disponivel = Math.max(
    0,
    Number(row.quantidadeSolicitada || 0) -
      Number(row.quantidadeRegularizada || 0) -
      Number(row.quantidadeCancelada || 0) -
      reservadoPendente,
  );

  if (quantidade > disponivel) {
    throw conflict(
      `Quantidade indisponível para "${row.medicamento}". Disponível: ${disponivel}.`,
    );
  }

  return disponivel;
}

async function buildPedidoItem(rawItem, currentPedidoItems = []) {
  await ensureUtenteOperational(
    rawItem.utenteId,
    "criar pedido para este utente",
  );

  if (rawItem.tipo === "COM_RECEITA") {
    const linha = await repository.findReceitaLinhaById(rawItem.id);

    if (!linha) {
      throw notFound("Linha de receita não encontrada.");
    }

    assertOwnership(
      linha.receita?.utenteId,
      rawItem.utenteId,
      "Linha de receita não pertence a este utente.",
    );

    validateReceitaLinhaAvailability(linha, rawItem.quantidade);
    await assertReceitaLinhaFefoPolicy(linha, currentPedidoItems);

    return {
      utenteId: rawItem.utenteId,
      tipo: "COM_RECEITA",
      referenciaId: linha.id,
      medicamento: linha.medicamentoRef?.nome || linha.nome,
      quantidade: rawItem.quantidade,
    };
  }

  if (rawItem.tipo === "SEM_RECEITA") {
    const semReceita = await repository.findSemReceitaById(rawItem.id);

    if (!semReceita) {
      throw notFound(
        "Registo de medicamento não sujeito a receita médica não encontrado.",
      );
    }

    assertOwnership(
      semReceita.utenteId,
      rawItem.utenteId,
      "Registo de medicamento não sujeito a receita médica não pertence a este utente.",
    );

    validateSemReceitaAvailability(semReceita, rawItem.quantidade);

    return {
      utenteId: rawItem.utenteId,
      tipo: "SEM_RECEITA",
      referenciaId: semReceita.id,
      medicamento: semReceita.medicamento,
      quantidade: rawItem.quantidade,
    };
  }

  if (rawItem.tipo === "EXTRA") {
    const extra = await repository.findExtraById(rawItem.id);

    if (!extra) {
      throw notFound("Venda Suspensa não encontrada.");
    }

    assertOwnership(
      extra.utenteId,
      rawItem.utenteId,
      "Venda Suspensa não pertence a este utente.",
    );

    validateExtraAvailability(extra, rawItem.quantidade);

    return {
      utenteId: rawItem.utenteId,
      tipo: "EXTRA",
      referenciaId: extra.id,
      medicamento: extra.medicamento,
      quantidade: rawItem.quantidade,
    };
  }

  throw conflict("Tipo de item inválido.");
}

async function createPedido(payload) {
  const parsed = validateCreatePedidoPayload(payload);

  const builtItems = [];

  for (const item of parsed.items) {
    builtItems.push(await buildPedidoItem(item, parsed.items));
  }

const pedido = await repository.createPedidoWithItems(builtItems);

try {
  await alertasService.createPedidoEnviadoAlerta({
    pedido,
  });
} catch (error) {
  console.error("[alertas] falha ao criar alerta de pedido enviado", error);
}

return toPedidoDTO(pedido);
}

async function getPedidoById(pedidoId) {
  const pedido = await repository.findPedidoById(pedidoId);

  if (!pedido) {
    throw notFound("Pedido não encontrado.");
  }

  return toPedidoDTO(pedido);
}

async function cancelPedido(pedidoId, payload = {}) {
  const params = parseCancelPedidoPayload(payload);

  const result = await repository.cancelPendingPedidoById(
    pedidoId,
    params.reason,
  );

  if (!result.pedido) {
    throw notFound("Pedido não encontrado.");
  }

  if (!result.wasCanceled) {
    throw conflict("Só é possível cancelar pedidos pendentes.");
  }

  return toPedidoDTO(result.pedido);
}

async function listPendentes(query = {}) {
  const params = parsePendentesQuery(query);
  const result = await repository.listPendentes(params);

  return {
    rows: result.rows.map(toPedidoDTO),
    total: result.total,
    params: {
      skip: result.skip,
      take: result.take,
      search: result.search,
      status: "PENDENTE",
    },
  };
}

async function listHistorico(query = {}) {
  const params = parseHistoricoQuery(query);
  const result = await repository.listHistorico(params);

  return {
    rows: result.rows.map(toPedidoDTO),
    total: result.total,
    params: {
      skip: result.skip,
      take: result.take,
      search: result.search,
      status: params.status || "TODOS",
      from: params.from,
      to: params.to,
    },
  };
}

module.exports = {
  createPedido,
  getPedidoById,
  cancelPedido,
  listHistorico,
  listPendentes,
};
