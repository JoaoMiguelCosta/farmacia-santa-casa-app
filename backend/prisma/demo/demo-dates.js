function assertValidDate(value, label) {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new Error(`${label} tem de ser uma data válida.`);
  }
}

function createRelativeDate(
  baseDate,
  { days = 0, hours = 10, minutes = 0, seconds = 0, milliseconds = 0 } = {},
) {
  assertValidDate(baseDate, "baseDate");

  const date = new Date(baseDate);

  date.setHours(hours, minutes, seconds, milliseconds);
  date.setDate(date.getDate() + days);

  return date;
}

function buildDemoDates(now = new Date()) {
  assertValidDate(now, "now");

  return {
    utentes: {
      anaCreatedAt: createRelativeDate(now, { days: -210, hours: 9 }),
      manuelCreatedAt: createRelativeDate(now, { days: -190, hours: 10 }),
      helenaCreatedAt: createRelativeDate(now, { days: -180, hours: 11 }),
      helenaArchivedAt: createRelativeDate(now, { days: -40, hours: 15 }),
      joaquimCreatedAt: createRelativeDate(now, { days: -160, hours: 9 }),
      rosaCreatedAt: createRelativeDate(now, { days: -150, hours: 14 }),
      antonioCreatedAt: createRelativeDate(now, { days: -140, hours: 10 }),
      luisaCreatedAt: createRelativeDate(now, { days: -120, hours: 16 }),
    },

    receitas: {
      anaCreatedAt: createRelativeDate(now, { days: -30, hours: 10 }),
      anaValidade: createRelativeDate(now, {
        days: 30,
        hours: 23,
        minutes: 59,
      }),

      manuelCreatedAt: createRelativeDate(now, { days: -20, hours: 11 }),
      manuelValidade: createRelativeDate(now, {
        days: 45,
        hours: 23,
        minutes: 59,
      }),

      helenaCreatedAt: createRelativeDate(now, { days: -15, hours: 9 }),
      helenaValidade: createRelativeDate(now, {
        days: 20,
        hours: 23,
        minutes: 59,
      }),

      rosaCreatedAt: createRelativeDate(now, { days: -6, hours: 10 }),
      rosaValidade: createRelativeDate(now, {
        days: 50,
        hours: 23,
        minutes: 59,
      }),

      antonioCreatedAt: createRelativeDate(now, { days: -9, hours: 11 }),
      antonioValidade: createRelativeDate(now, {
        days: 60,
        hours: 23,
        minutes: 59,
      }),

      luisaCreatedAt: createRelativeDate(now, { days: -8, hours: 9 }),
      luisaValidade: createRelativeDate(now, {
        days: -2,
        hours: 23,
        minutes: 59,
      }),
    },

    pedidos: {
      pendenteCreatedAt: createRelativeDate(now, {
        days: -1,
        hours: 10,
        minutes: 15,
      }),

      validadoCreatedAt: createRelativeDate(now, {
        days: -12,
        hours: 9,
        minutes: 30,
      }),
      validadoClosedAt: createRelativeDate(now, {
        days: -11,
        hours: 14,
        minutes: 20,
      }),

      rejeitadoCreatedAt: createRelativeDate(now, {
        days: -10,
        hours: 11,
      }),
      rejeitadoClosedAt: createRelativeDate(now, {
        days: -9,
        hours: 15,
        minutes: 10,
      }),

      regularizacaoPendenteCreatedAt: createRelativeDate(now, {
        days: -20,
        hours: 10,
      }),
      regularizacaoPendenteClosedAt: createRelativeDate(now, {
        days: -19,
        hours: 12,
      }),

      regularizacaoParcialCreatedAt: createRelativeDate(now, {
        days: -25,
        hours: 9,
      }),
      regularizacaoParcialClosedAt: createRelativeDate(now, {
        days: -24,
        hours: 16,
      }),

      regularizacaoTotalCreatedAt: createRelativeDate(now, {
        days: -35,
        hours: 10,
      }),
      regularizacaoTotalClosedAt: createRelativeDate(now, {
        days: -34,
        hours: 15,
      }),

      canceladoCreatedAt: createRelativeDate(now, {
        days: -3,
        hours: 9,
      }),
      canceladoClosedAt: createRelativeDate(now, {
        days: -2,
        hours: 8,
        minutes: 30,
      }),
    },

    extras: {
      abertoCreatedAt: createRelativeDate(now, { days: -4, hours: 10 }),
      pendenteCreatedAt: createRelativeDate(now, { days: -28, hours: 11 }),
      parcialCreatedAt: createRelativeDate(now, { days: -32, hours: 9 }),
      totalCreatedAt: createRelativeDate(now, { days: -45, hours: 10 }),
    },

    regularizacoes: {
      pendenteCreatedAt: createRelativeDate(now, { days: -19, hours: 12 }),
      parcialCreatedAt: createRelativeDate(now, { days: -24, hours: 16 }),
      parcialUpdatedAt: createRelativeDate(now, { days: -5, hours: 11 }),

      totalCreatedAt: createRelativeDate(now, { days: -34, hours: 15 }),
      totalUpdatedAt: createRelativeDate(now, { days: -8, hours: 14 }),

      parcialEventoAt: createRelativeDate(now, { days: -5, hours: 11 }),
      totalEventoAt: createRelativeDate(now, { days: -8, hours: 14 }),
    },

    alertas: {
      pedidoPendenteAt: createRelativeDate(now, {
        days: -1,
        hours: 10,
        minutes: 16,
      }),
      regularizacaoParcialAt: createRelativeDate(now, {
        days: -5,
        hours: 11,
        minutes: 1,
      }),
      regularizacaoTotalAt: createRelativeDate(now, {
        days: -8,
        hours: 14,
        minutes: 1,
      }),
    },
  };
}

module.exports = {
  buildDemoDates,
  createRelativeDate,
};
