const { prisma, disconnectPrisma } = require("../../../src/db/prisma");
const {
  runOnce,
  preview,
  HIGIENE_MARKER,
} = require("../../../src/jobs/higiene.job");

function makeNumero9() {
  return String(Math.floor(100000000 + Math.random() * 900000000));
}

async function createDeletedOldUtente() {
  const timestamp = Date.now();

  return prisma.utente.create({
    data: {
      numero9: makeNumero9(),
      nome: `Teste Integration Higiene ${timestamp}`,
      status: "ATIVO",
      isValid: false,
      invalidReason: "Removido por teste antes da rotina de higiene.",
      deletedAt: new Date("2020-01-01T00:00:00.000Z"),
    },
    select: {
      id: true,
      numero9: true,
      nome: true,
      deletedAt: true,
      invalidReason: true,
      isValid: true,
    },
  });
}

async function cleanupUtente(utente) {
  if (!utente?.id) return;

  await prisma.utente.deleteMany({
    where: {
      id: utente.id,
    },
  });
}

describe("higiene.job integration", () => {
  afterAll(async () => {
    await disconnectPrisma();
  });

  it("deve marcar utente removido antigo com marcador de higiene", async () => {
    let utente = null;

    try {
      utente = await createDeletedOldUtente();

      const before = await preview({
        offsetMonths: 1,
      });

      expect(before).toEqual(
        expect.objectContaining({
          cutoffDate: expect.any(Date),
          offsetMonths: 1,
          candidatos: expect.any(Number),
        }),
      );

      expect(before.candidatos).toBeGreaterThanOrEqual(1);

      const result = await runOnce({
        offsetMonths: 1,
        anonymize: false,
      });

      expect(result).toEqual(
        expect.objectContaining({
          checkedAt: expect.any(Date),
          cutoffDate: expect.any(Date),
          offsetMonths: 1,
          anonymizeRequested: false,
          anonymizeApplied: false,
          atualizados: expect.any(Number),
        }),
      );

      expect(result.atualizados).toBeGreaterThanOrEqual(1);

      const updated = await prisma.utente.findUnique({
        where: {
          id: utente.id,
        },
        select: {
          id: true,
          numero9: true,
          nome: true,
          isValid: true,
          invalidReason: true,
          deletedAt: true,
        },
      });

      expect(updated).toEqual(
        expect.objectContaining({
          id: utente.id,
          numero9: utente.numero9,
          nome: utente.nome,
          isValid: false,
          deletedAt: expect.any(Date),
        }),
      );

      expect(updated.invalidReason).toContain(HIGIENE_MARKER);
    } finally {
      await cleanupUtente(utente);
    }
  });

  it("deve ser idempotente para utente já marcado com higiene", async () => {
    let utente = null;

    try {
      utente = await createDeletedOldUtente();

      const firstRun = await runOnce({
        offsetMonths: 1,
        anonymize: false,
      });

      expect(firstRun.atualizados).toBeGreaterThanOrEqual(1);

      const secondRun = await runOnce({
        offsetMonths: 1,
        anonymize: false,
      });

      expect(secondRun).toEqual(
        expect.objectContaining({
          atualizados: expect.any(Number),
        }),
      );

      const updated = await prisma.utente.findUnique({
        where: {
          id: utente.id,
        },
        select: {
          invalidReason: true,
        },
      });

      expect(updated.invalidReason).toContain(HIGIENE_MARKER);
    } finally {
      await cleanupUtente(utente);
    }
  });
});
