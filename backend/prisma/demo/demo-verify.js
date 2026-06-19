const { DEMO_EXPECTED_TOTALS, getDemoIdLists } = require("./demo-dataset");

const { getDemoUserIdsByRole } = require("./demo-persist");

function normalizeComparableValue(value) {
  if (value instanceof Date) {
    return value.getTime();
  }

  return value;
}

function assertEqual(actual, expected, label) {
  const normalizedActual = normalizeComparableValue(actual);
  const normalizedExpected = normalizeComparableValue(expected);

  if (normalizedActual !== normalizedExpected) {
    throw new Error(
      `${label}: esperado "${normalizedExpected}", ` +
        `encontrado "${normalizedActual}".`,
    );
  }
}

function assertRowCount(rows, expected, label) {
  assertEqual(rows.length, expected, `${label} — total`);
}

function getSortedIds(rows = []) {
  return rows.map((row) => row.id).sort();
}

function assertExactIds(actualRows, expectedRows, label) {
  const actualIds = getSortedIds(actualRows);
  const expectedIds = getSortedIds(expectedRows);

  assertEqual(actualIds.length, expectedIds.length, `${label} — número de IDs`);

  for (let index = 0; index < expectedIds.length; index += 1) {
    assertEqual(
      actualIds[index],
      expectedIds[index],
      `${label} — ID na posição ${index}`,
    );
  }
}

function createMapById(rows = []) {
  return new Map(rows.map((row) => [row.id, row]));
}

function assertRowsMatch({ actualRows, expectedRows, fields, label }) {
  assertExactIds(actualRows, expectedRows, label);

  const actualById = createMapById(actualRows);

  for (const expected of expectedRows) {
    const actual = actualById.get(expected.id);

    if (!actual) {
      throw new Error(
        `${label}: registo esperado "${expected.id}" não encontrado.`,
      );
    }

    for (const field of fields) {
      assertEqual(
        actual[field],
        expected[field],
        `${label} "${expected.id}" — campo "${field}"`,
      );
    }
  }
}

function countByStatus(rows = []) {
  return rows.reduce((totals, row) => {
    const status = String(row.status || "");

    totals[status] = (totals[status] || 0) + 1;

    return totals;
  }, {});
}

function assertStatusTotals(rows, expectedTotals, label) {
  const actualTotals = countByStatus(rows);

  for (const [status, expectedTotal] of Object.entries(expectedTotals)) {
    assertEqual(
      Number(actualTotals[status] || 0),
      expectedTotal,
      `${label} — estado ${status}`,
    );
  }

  const expectedStatuses = new Set(Object.keys(expectedTotals));

  for (const [status, total] of Object.entries(actualTotals)) {
    if (!expectedStatuses.has(status) && total > 0) {
      throw new Error(
        `${label}: estado inesperado "${status}" ` + `com ${total} registos.`,
      );
    }
  }
}

function sumField(rows, field) {
  return rows.reduce((total, row) => {
    return total + Number(row[field] || 0);
  }, 0);
}

function resolveExpectedMedicamentos(dataset, persistenceResult) {
  const resolvedIds = persistenceResult?.medicamentoIds;

  if (!resolvedIds || typeof resolvedIds !== "object") {
    throw new Error(
      "Resultado da persistência não contém os medicamentos resolvidos.",
    );
  }

  return dataset.medicamentos.map((medicamento) => {
    const resolvedId = resolvedIds[medicamento.id];

    if (!resolvedId) {
      throw new Error(
        `Medicamento demo "${medicamento.id}" não foi resolvido.`,
      );
    }

    return {
      ...medicamento,
      id: resolvedId,
      datasetId: medicamento.id,
    };
  });
}

function assertResolvedMedicamentos(actualRows, expectedRows) {
  assertRowCount(
    actualRows,
    expectedRows.length,
    "Medicamentos demo resolvidos",
  );

  const actualById = createMapById(actualRows);

  for (const expected of expectedRows) {
    const actual = actualById.get(expected.id);

    if (!actual) {
      throw new Error(
        `Medicamento resolvido não encontrado: "${expected.nome}".`,
      );
    }

    assertEqual(
      actual.nome,
      expected.nome,
      `Medicamento "${expected.id}" — nome`,
    );

    assertEqual(
      actual.tipo,
      expected.tipo,
      `Medicamento "${expected.id}" — tipo`,
    );
  }
}

async function readDemoOperationalData(tx, dataset, persistenceResult) {
  const ids = getDemoIdLists();
  const demoUtenteIds = ids.utenteIds;

  const resolvedMedicamentos = resolveExpectedMedicamentos(
    dataset,
    persistenceResult,
  );

  const resolvedMedicamentoIds = resolvedMedicamentos.map((row) => row.id);

  const [
    users,
    utentes,
    medicamentos,
    medicacoesHabituais,
    receitas,
    receitaLinhas,
    semReceita,
    extras,
    pedidos,
    pedidoItens,
    dispensas,
    regularizacoes,
    regularizacaoEventos,
  ] = await Promise.all([
    tx.user.findMany({
      where: {
        id: {
          in: Object.values(persistenceResult.userIdsByRole || {}),
        },
      },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
    }),

    tx.utente.findMany({
      where: {
        id: {
          in: demoUtenteIds,
        },
      },
      select: {
        id: true,
        numero9: true,
        nome: true,
        isValid: true,
        invalidReason: true,
        deletedAt: true,
        status: true,
        archivedAt: true,
        archivedReason: true,
        archivedById: true,
        createdAt: true,
        updatedAt: true,
      },
    }),

    tx.medicamento.findMany({
      where: {
        id: {
          in: resolvedMedicamentoIds,
        },
      },
      select: {
        id: true,
        nome: true,
        tipo: true,
      },
    }),

    tx.medicacaoHabitual.findMany({
      where: {
        utenteId: {
          in: demoUtenteIds,
        },
      },
      select: {
        id: true,
        utenteId: true,
        medicamento: true,
        medicamentoNorm: true,
        createdAt: true,
        updatedAt: true,
      },
    }),

    tx.receita.findMany({
      where: {
        utenteId: {
          in: demoUtenteIds,
        },
      },
      select: {
        id: true,
        utenteId: true,
        numero19: true,
        pinAcesso6: true,
        pinOpcao4: true,
        createdAt: true,
        updatedAt: true,
      },
    }),

    tx.receitaLinha.findMany({
      where: {
        receita: {
          utenteId: {
            in: demoUtenteIds,
          },
        },
      },
      select: {
        id: true,
        receitaId: true,
        medicamentoId: true,
        nome: true,
        quantidade: true,
        quantidadeDispensada: true,
        validade: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    }),

    tx.semReceita.findMany({
      where: {
        utenteId: {
          in: demoUtenteIds,
        },
      },
      select: {
        id: true,
        utenteId: true,
        medicamento: true,
        quantidade: true,
        createdAt: true,
        updatedAt: true,
      },
    }),

    tx.extra.findMany({
      where: {
        utenteId: {
          in: demoUtenteIds,
        },
      },
      select: {
        id: true,
        utenteId: true,
        medicamentoId: true,
        medicamento: true,
        medicamentoNorm: true,
        quantidadeSolicitada: true,
        quantidadeRegularizada: true,
        quantidadeCancelada: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    }),

    tx.pedido.findMany({
      where: {
        itens: {
          some: {
            utenteId: {
              in: demoUtenteIds,
            },
          },
        },
      },
      select: {
        id: true,
        numero: true,
        status: true,
        validatedAt: true,
        validatedById: true,
        rejectedAt: true,
        rejectedById: true,
        canceledById: true,
        closedReason: true,
        createdAt: true,
        updatedAt: true,
      },
    }),

    tx.pedidoItem.findMany({
      where: {
        utenteId: {
          in: demoUtenteIds,
        },
      },
      select: {
        id: true,
        pedidoId: true,
        utenteId: true,
        tipo: true,
        status: true,
        medicamento: true,
        quantidade: true,
        receitaLinhaId: true,
        semReceitaId: true,
        extraId: true,
        validatedAt: true,
        validatedById: true,
        rejectedAt: true,
        rejectedById: true,
        createdAt: true,
        updatedAt: true,
      },
    }),

    tx.dispensa.findMany({
      where: {
        OR: [
          {
            receitaLinhaId: {
              in: ids.receitaLinhaIds,
            },
          },
          {
            pedidoItemId: {
              in: ids.pedidoItemIds,
            },
          },
        ],
      },
      select: {
        id: true,
        receitaLinhaId: true,
        pedidoItemId: true,
        quantidade: true,
        createdAt: true,
      },
    }),

    tx.regularizacaoExtra.findMany({
      where: {
        utenteId: {
          in: demoUtenteIds,
        },
      },
      select: {
        id: true,
        utenteId: true,
        extraId: true,
        pedidoId: true,
        pedidoNumero: true,
        medicamentoId: true,
        medicamento: true,
        medicamentoNorm: true,
        quantidadeSolicitada: true,
        quantidadeRegularizada: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    }),

    tx.regularizacaoEvento.findMany({
      where: {
        OR: [
          {
            regularizacaoId: {
              in: ids.regularizacaoIds,
            },
          },
          {
            receitaLinhaId: {
              in: ids.receitaLinhaIds,
            },
          },
        ],
      },
      select: {
        id: true,
        regularizacaoId: true,
        receitaLinhaId: true,
        quantidade: true,
        createdAt: true,
      },
    }),
  ]);

  const alertas = await tx.alertaOperacional.findMany({
    where: {
      OR: [
        {
          id: {
            in: ids.alertaIds,
          },
        },
        {
          pedidoId: {
            in: pedidos.map((pedido) => pedido.id),
          },
        },
        {
          regularizacaoId: {
            in: regularizacoes.map((regularizacao) => regularizacao.id),
          },
        },
        {
          utenteId: {
            in: demoUtenteIds,
          },
        },
      ],
    },
    select: {
      id: true,
      tipo: true,
      destino: true,
      titulo: true,
      mensagem: true,
      pedidoId: true,
      regularizacaoId: true,
      utenteId: true,
      metadata: true,
      idempotencyKey: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return {
    users,
    utentes,
    medicamentos,
    resolvedMedicamentos,
    medicacoesHabituais,
    receitas,
    receitaLinhas,
    semReceita,
    extras,
    pedidos,
    pedidoItens,
    dispensas,
    regularizacoes,
    regularizacaoEventos,
    alertas,
  };
}

function verifyDemoUsers(users, demoUsers, persistenceResult) {
  const expectedUserIdsByRole = getDemoUserIdsByRole(demoUsers);

  assertRowCount(
    users,
    Object.keys(expectedUserIdsByRole).length,
    "Utilizadores demo",
  );

  const usersByRole = new Map(users.map((user) => [user.role, user]));

  for (const [role, expectedUserId] of Object.entries(expectedUserIdsByRole)) {
    const actual = usersByRole.get(role);

    if (!actual) {
      throw new Error(`Utilizador demo com role ${role} não encontrado.`);
    }

    assertEqual(actual.id, expectedUserId, `Utilizador demo ${role} — ID`);

    assertEqual(
      actual.isActive,
      true,
      `Utilizador demo ${role} — estado ativo`,
    );

    assertEqual(
      persistenceResult.userIdsByRole[role],
      expectedUserId,
      `Persistência — utilizador ${role}`,
    );
  }

  return expectedUserIdsByRole;
}

function verifyUtentes(actualRows, expectedRows, userIdsByRole) {
  assertRowsMatch({
    actualRows,
    expectedRows,
    fields: [
      "numero9",
      "nome",
      "isValid",
      "invalidReason",
      "deletedAt",
      "status",
      "archivedAt",
      "archivedReason",
      "createdAt",
      "updatedAt",
    ],
    label: "Utentes demo",
  });

  assertStatusTotals(
    actualRows,
    DEMO_EXPECTED_TOTALS.utentesByStatus,
    "Utentes demo",
  );

  const expectedById = createMapById(expectedRows);
  const actualById = createMapById(actualRows);

  for (const expected of expectedRows) {
    const actual = actualById.get(expected.id);

    const expectedArchivedById = expected.archivedByRole
      ? userIdsByRole[expected.archivedByRole]
      : null;

    assertEqual(
      actual.archivedById,
      expectedArchivedById,
      `Utente "${expected.id}" — archivedById`,
    );
  }
}

function verifyReceitaLinhas(actualRows, expectedRows, persistenceResult) {
  const medicamentoIds = persistenceResult.medicamentoIds || {};

  assertRowsMatch({
    actualRows,
    expectedRows,
    fields: [
      "receitaId",
      "nome",
      "quantidade",
      "quantidadeDispensada",
      "validade",
      "status",
      "createdAt",
      "updatedAt",
    ],
    label: "Linhas de receita demo",
  });

  const actualById = createMapById(actualRows);

  for (const expected of expectedRows) {
    const actual = actualById.get(expected.id);

    assertEqual(
      actual.medicamentoId,
      medicamentoIds[expected.medicamentoId],
      `Linha de receita "${expected.id}" — medicamentoId`,
    );
  }

  assertStatusTotals(
    actualRows,
    {
      ATIVA: 5,
      EXPIRADA: 1,
    },
    "Linhas de receita demo",
  );
}

function verifyExtras(actualRows, expectedRows, persistenceResult) {
  assertRowsMatch({
    actualRows,
    expectedRows,
    fields: [
      "utenteId",
      "medicamento",
      "medicamentoNorm",
      "quantidadeSolicitada",
      "quantidadeRegularizada",
      "quantidadeCancelada",
      "status",
      "createdAt",
      "updatedAt",
    ],
    label: "Vendas Suspensas demo",
  });

  const actualById = createMapById(actualRows);

  for (const expected of expectedRows) {
    const actual = actualById.get(expected.id);

    assertEqual(
      actual.medicamentoId,
      persistenceResult.medicamentoIds[expected.medicamentoId],
      `Venda Suspensa "${expected.id}" — medicamentoId`,
    );
  }

  assertStatusTotals(
    actualRows,
    {
      PENDENTE: 1,
      REGULARIZADO: 3,
    },
    "Vendas Suspensas demo",
  );
}

function verifyPedidos(actualRows, expectedRows, userIdsByRole) {
  assertRowsMatch({
    actualRows,
    expectedRows,
    fields: [
      "numero",
      "status",
      "validatedAt",
      "rejectedAt",
      "closedReason",
      "createdAt",
      "updatedAt",
    ],
    label: "Pedidos demo",
  });

  assertStatusTotals(
    actualRows,
    DEMO_EXPECTED_TOTALS.pedidosByStatus,
    "Pedidos demo",
  );

  const actualById = createMapById(actualRows);

  for (const expected of expectedRows) {
    const actual = actualById.get(expected.id);

    assertEqual(
      actual.validatedById,
      expected.validatedByRole ? userIdsByRole[expected.validatedByRole] : null,
      `Pedido "${expected.id}" — validatedById`,
    );

    assertEqual(
      actual.rejectedById,
      expected.rejectedByRole ? userIdsByRole[expected.rejectedByRole] : null,
      `Pedido "${expected.id}" — rejectedById`,
    );

    assertEqual(
      actual.canceledById,
      expected.canceledByRole ? userIdsByRole[expected.canceledByRole] : null,
      `Pedido "${expected.id}" — canceledById`,
    );
  }
}

function verifyPedidoItens(actualRows, expectedRows, userIdsByRole) {
  assertRowsMatch({
    actualRows,
    expectedRows,
    fields: [
      "pedidoId",
      "utenteId",
      "tipo",
      "status",
      "medicamento",
      "quantidade",
      "receitaLinhaId",
      "semReceitaId",
      "extraId",
      "validatedAt",
      "rejectedAt",
      "createdAt",
      "updatedAt",
    ],
    label: "Itens de pedido demo",
  });

  assertStatusTotals(
    actualRows,
    {
      PENDENTE: 2,
      VALIDADO: 5,
      REJEITADO: 1,
      CANCELADO_POR_EXPIRACAO: 1,
    },
    "Itens de pedido demo",
  );

  const actualById = createMapById(actualRows);

  for (const expected of expectedRows) {
    const actual = actualById.get(expected.id);

    assertEqual(
      actual.validatedById,
      expected.validatedByRole ? userIdsByRole[expected.validatedByRole] : null,
      `Item de pedido "${expected.id}" — validatedById`,
    );

    assertEqual(
      actual.rejectedById,
      expected.rejectedByRole ? userIdsByRole[expected.rejectedByRole] : null,
      `Item de pedido "${expected.id}" — rejectedById`,
    );
  }
}

function verifyRegularizacoes(actualRows, expectedRows, persistenceResult) {
  assertRowsMatch({
    actualRows,
    expectedRows,
    fields: [
      "utenteId",
      "extraId",
      "pedidoId",
      "pedidoNumero",
      "medicamento",
      "medicamentoNorm",
      "quantidadeSolicitada",
      "quantidadeRegularizada",
      "status",
      "createdAt",
      "updatedAt",
    ],
    label: "Regularizações demo",
  });

  assertStatusTotals(
    actualRows,
    DEMO_EXPECTED_TOTALS.regularizacoesByStatus,
    "Regularizações demo",
  );

  const actualById = createMapById(actualRows);

  for (const expected of expectedRows) {
    const actual = actualById.get(expected.id);

    assertEqual(
      actual.medicamentoId,
      persistenceResult.medicamentoIds[expected.medicamentoId],
      `Regularização "${expected.id}" — medicamentoId`,
    );
  }
}

function verifyAlertas(actualRows, expectedRows) {
  assertRowsMatch({
    actualRows,
    expectedRows,
    fields: [
      "tipo",
      "destino",
      "titulo",
      "mensagem",
      "pedidoId",
      "regularizacaoId",
      "utenteId",
      "idempotencyKey",
      "createdAt",
      "updatedAt",
    ],
    label: "Alertas demo",
  });

  assertRowCount(actualRows, DEMO_EXPECTED_TOTALS.alertas, "Alertas demo");
}

function verifyQuantities(data) {
  assertEqual(
    sumField(data.dispensas, "quantidade"),
    2,
    "Total de unidades dispensadas diretamente",
  );

  assertEqual(
    sumField(data.regularizacaoEventos, "quantidade"),
    DEMO_EXPECTED_TOTALS.regularizacaoUnidades,
    "Total de unidades regularizadas",
  );

  assertEqual(
    data.regularizacaoEventos.length,
    DEMO_EXPECTED_TOTALS.regularizacaoEventos,
    "Total de eventos de regularização",
  );

  const pendingPedidoIds = new Set(
    data.pedidos
      .filter((pedido) => pedido.status === "PENDENTE")
      .map((pedido) => pedido.id),
  );

  const pendingPedidoItems = data.pedidoItens.filter((item) =>
    pendingPedidoIds.has(item.pedidoId),
  );

  assertEqual(
    pendingPedidoItems.length,
    2,
    "Itens existentes no pedido pendente",
  );

  const linhaDispensadaTotal = sumField(
    data.receitaLinhas,
    "quantidadeDispensada",
  );

  assertEqual(
    linhaDispensadaTotal,
    7,
    "Quantidade dispensada acumulada nas linhas de receita",
  );
}

async function verifyDemoOperationalData(
  tx,
  dataset,
  demoUsers,
  persistenceResult,
) {
  if (!tx) {
    throw new Error("Cliente transacional Prisma em falta.");
  }

  if (!dataset) {
    throw new Error("Dataset demo em falta.");
  }

  if (!persistenceResult) {
    throw new Error("Resultado da persistência demo em falta.");
  }

  const data = await readDemoOperationalData(tx, dataset, persistenceResult);

  const userIdsByRole = verifyDemoUsers(
    data.users,
    demoUsers,
    persistenceResult,
  );

  verifyUtentes(data.utentes, dataset.utentes, userIdsByRole);

  assertResolvedMedicamentos(data.medicamentos, data.resolvedMedicamentos);

  assertRowsMatch({
    actualRows: data.medicacoesHabituais,
    expectedRows: dataset.medicacoesHabituais,
    fields: [
      "utenteId",
      "medicamento",
      "medicamentoNorm",
      "createdAt",
      "updatedAt",
    ],
    label: "Medicação habitual demo",
  });

  assertRowsMatch({
    actualRows: data.receitas,
    expectedRows: dataset.receitas,
    fields: [
      "utenteId",
      "numero19",
      "pinAcesso6",
      "pinOpcao4",
      "createdAt",
      "updatedAt",
    ],
    label: "Receitas demo",
  });

  verifyReceitaLinhas(
    data.receitaLinhas,
    dataset.receitaLinhas,
    persistenceResult,
  );

  assertRowsMatch({
    actualRows: data.semReceita,
    expectedRows: dataset.semReceita,
    fields: ["utenteId", "medicamento", "quantidade", "createdAt", "updatedAt"],
    label: "Medicamentos não sujeitos a receita médica demo",
  });

  verifyExtras(data.extras, dataset.extras, persistenceResult);

  verifyPedidos(data.pedidos, dataset.pedidos, userIdsByRole);

  verifyPedidoItens(data.pedidoItens, dataset.pedidoItens, userIdsByRole);

  assertRowsMatch({
    actualRows: data.dispensas,
    expectedRows: dataset.dispensas,
    fields: ["receitaLinhaId", "pedidoItemId", "quantidade", "createdAt"],
    label: "Dispensas demo",
  });

  verifyRegularizacoes(
    data.regularizacoes,
    dataset.regularizacoes,
    persistenceResult,
  );

  assertRowsMatch({
    actualRows: data.regularizacaoEventos,
    expectedRows: dataset.regularizacaoEventos,
    fields: ["regularizacaoId", "receitaLinhaId", "quantidade", "createdAt"],
    label: "Eventos de regularização demo",
  });

  verifyAlertas(data.alertas, dataset.alertas);

  verifyQuantities(data);

  return {
    users: data.users.length,
    utentes: data.utentes.length,
    medicamentos: data.medicamentos.length,
    medicacoesHabituais: data.medicacoesHabituais.length,
    receitas: data.receitas.length,
    receitaLinhas: data.receitaLinhas.length,
    semReceita: data.semReceita.length,
    extras: data.extras.length,
    pedidos: data.pedidos.length,
    pedidoItens: data.pedidoItens.length,
    dispensas: data.dispensas.length,
    regularizacoes: data.regularizacoes.length,
    regularizacaoEventos: data.regularizacaoEventos.length,
    unidadesRegularizadas: sumField(data.regularizacaoEventos, "quantidade"),
    alertas: data.alertas.length,
  };
}

module.exports = {
  readDemoOperationalData,
  verifyDemoOperationalData,
};
