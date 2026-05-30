const alertasRepository = require("./alertas.repository");

const {
  toAlertaOperacionalDTO,
  toAlertasOperacionaisDTO,
} = require("./alertas.mappers");

const { forbidden, notFound } = require("../../shared/errors/AppError");

const ALERTA_DESTINO_FARMACIA = "FARMACIA";

function ensureUser(user) {
  if (!user?.id) {
    throw forbidden("Utilizador não autenticado.");
  }

  return user;
}

function ensureFarmaciaUser(user) {
  ensureUser(user);

  if (user.role !== "FARMACIA" && user.role !== "ADMIN") {
    throw forbidden("Sem permissões para consultar alertas da Farmácia.");
  }

  return user;
}

async function listFarmaciaAlertas(user) {
  ensureFarmaciaUser(user);

  const alertas = await alertasRepository.findActiveForUser({
    destino: ALERTA_DESTINO_FARMACIA,
    userId: user.id,
  });

  return toAlertasOperacionaisDTO(alertas);
}

async function dismissFarmaciaAlerta({ user, alertaId }) {
  ensureFarmaciaUser(user);

  const alerta = await alertasRepository.findById(alertaId);

  if (!alerta) {
    throw notFound("Alerta não encontrado.");
  }

  if (alerta.destino !== ALERTA_DESTINO_FARMACIA) {
    throw forbidden("Sem permissões para fechar este alerta.");
  }

  await alertasRepository.dismissForUser({
    alertaId,
    userId: user.id,
  });

  return {
    dismissed: true,
    alerta: toAlertaOperacionalDTO(alerta),
  };
}

async function dismissAllFarmaciaAlertas(user) {
  ensureFarmaciaUser(user);

  const alertas = await alertasRepository.findActiveForUser({
    destino: ALERTA_DESTINO_FARMACIA,
    userId: user.id,
    take: 200,
  });

  const alertaIds = alertas.map((alerta) => alerta.id);

  const result = await alertasRepository.dismissManyForUser({
    alertaIds,
    userId: user.id,
  });

  return {
    dismissed: result.count,
  };
}

async function createPedidoEnviadoAlerta({ pedido }) {
  if (!pedido?.id) return null;

  const numeroLabel = Number.isFinite(Number(pedido.numero))
    ? `#${pedido.numero}`
    : pedido.id;

  return alertasRepository.createIfNotExists({
    tipo: "PEDIDO_ENVIADO",
    destino: ALERTA_DESTINO_FARMACIA,
    titulo: "Novo pedido recebido",
    mensagem: `A Santa Casa enviou o pedido ${numeroLabel} para validação.`,
    pedidoId: pedido.id,
    regularizacaoId: null,
    utenteId: null,
    metadata: {
      pedidoNumero: pedido.numero ?? null,
    },
    idempotencyKey: `PEDIDO_ENVIADO:${pedido.id}`,
  });
}

async function createRegularizacaoAlerta({ regularizacao }) {
  if (!regularizacao?.id) return null;

  const status = String(regularizacao.status || "").toUpperCase();

  const isParcial = status === "PARCIALMENTE_REGULARIZADO";
  const isTotal = status === "REGULARIZADO";

  if (!isParcial && !isTotal) return null;

  const tipo = isParcial ? "REGULARIZACAO_PARCIAL" : "REGULARIZACAO_TOTAL";

  const titulo = isParcial
    ? "Regularização parcial efetuada"
    : "Regularização concluída";

  const medicamento = regularizacao.medicamento || "Medicamento";
  const pedidoNumero = regularizacao.pedidoNumero
    ? ` Pedido #${regularizacao.pedidoNumero}.`
    : "";

  const mensagem = isParcial
    ? `${medicamento} foi parcialmente regularizado.${pedidoNumero}`
    : `${medicamento} foi totalmente regularizado.${pedidoNumero}`;

  return alertasRepository.createIfNotExists({
    tipo,
    destino: ALERTA_DESTINO_FARMACIA,
    titulo,
    mensagem,
    pedidoId: regularizacao.pedidoId || null,
    regularizacaoId: regularizacao.id,
    utenteId: regularizacao.utenteId || null,
    metadata: {
      medicamento,
      pedidoNumero: regularizacao.pedidoNumero ?? null,
      quantidadeSolicitada: regularizacao.quantidadeSolicitada ?? null,
      quantidadeRegularizada: regularizacao.quantidadeRegularizada ?? null,
      status: regularizacao.status,
    },
    idempotencyKey: `REGULARIZACAO_STATUS:${regularizacao.id}:${status}`,
  });
}

module.exports = {
  listFarmaciaAlertas,
  dismissFarmaciaAlerta,
  dismissAllFarmaciaAlertas,

  createPedidoEnviadoAlerta,
  createRegularizacaoAlerta,
};
