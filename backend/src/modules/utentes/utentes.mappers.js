// src/modules/utentes/utentes.mappers.js
function toAuditUserDTO(user) {
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

function toUtenteDTO(utente) {
  if (!utente) return null;

  return {
    id: utente.id,
    numero9: utente.numero9,
    nome: utente.nome,

    status: utente.status,
    isArchived: utente.status === "ARQUIVADO",

    archivedAt: utente.archivedAt,
    archivedReason: utente.archivedReason,
    archivedById: utente.archivedById,
    archivedBy: toAuditUserDTO(utente.archivedBy),

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
