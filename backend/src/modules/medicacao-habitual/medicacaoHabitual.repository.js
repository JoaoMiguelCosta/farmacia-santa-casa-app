const { prisma } = require("../../db/prisma");

const baseSelect = Object.freeze({
  id: true,
  utenteId: true,
  medicamento: true,
  medicamentoNorm: true,
  createdAt: true,
  updatedAt: true,
});

function findByUtente(utenteId) {
  return prisma.medicacaoHabitual.findMany({
    where: {
      utenteId,
    },
    select: baseSelect,
    orderBy: [{ medicamento: "asc" }, { createdAt: "asc" }],
  });
}

function findByUtenteAndNorm(utenteId, medicamentoNorm) {
  return prisma.medicacaoHabitual.findUnique({
    where: {
      utenteId_medicamentoNorm: {
        utenteId,
        medicamentoNorm,
      },
    },
    select: baseSelect,
  });
}

function findById(id) {
  return prisma.medicacaoHabitual.findUnique({
    where: {
      id,
    },
    select: baseSelect,
  });
}

function create(utenteId, data) {
  return prisma.medicacaoHabitual.create({
    data: {
      utenteId,
      medicamento: data.medicamento,
      medicamentoNorm: data.medicamentoNorm,
    },
    select: baseSelect,
  });
}

function deleteById(id) {
  return prisma.medicacaoHabitual.delete({
    where: {
      id,
    },
    select: baseSelect,
  });
}

function deleteManyByUtente(utenteId) {
  return prisma.medicacaoHabitual.deleteMany({
    where: {
      utenteId,
    },
  });
}

module.exports = {
  findByUtente,
  findByUtenteAndNorm,
  findById,
  create,
  deleteById,
  deleteManyByUtente,
};
