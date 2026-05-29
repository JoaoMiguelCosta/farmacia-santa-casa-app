function toMedicacaoHabitualDTO(row) {
  if (!row) return null;

  return {
    id: row.id,
    utenteId: row.utenteId,
    medicamento: row.medicamento,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

module.exports = {
  toMedicacaoHabitualDTO,
};
