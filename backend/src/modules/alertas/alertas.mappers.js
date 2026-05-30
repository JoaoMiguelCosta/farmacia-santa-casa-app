function toAlertaOperacionalDTO(alerta) {
  if (!alerta) return null;

  return {
    id: alerta.id,
    tipo: alerta.tipo,
    destino: alerta.destino,
    titulo: alerta.titulo,
    mensagem: alerta.mensagem,
    pedidoId: alerta.pedidoId,
    regularizacaoId: alerta.regularizacaoId,
    utenteId: alerta.utenteId,
    metadata: alerta.metadata || null,
    createdAt: alerta.createdAt,
    updatedAt: alerta.updatedAt,
  };
}

function toAlertasOperacionaisDTO(alertas = []) {
  return alertas.map(toAlertaOperacionalDTO);
}

module.exports = {
  toAlertaOperacionalDTO,
  toAlertasOperacionaisDTO,
};
