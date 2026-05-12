// src/modules/utentes/utentes.mappers.js
function toUtenteDTO(utente) {
  if (!utente) return null;

  return {
    id: utente.id,
    numero9: utente.numero9,
    nome: utente.nome,
    isValid: utente.isValid,
    invalidReason: utente.invalidReason,
    deletedAt: utente.deletedAt,
    createdAt: utente.createdAt,
    updatedAt: utente.updatedAt,
  };
}

module.exports = {
  toUtenteDTO,
};
