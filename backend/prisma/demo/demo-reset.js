const { getDemoIdLists } = require("./demo-dataset");

function unique(values = []) {
  return Array.from(new Set(values.filter(Boolean)));
}

function createValueMap(rows, field) {
  return new Map(rows.map((row) => [row[field], row]));
}

function formatCollision(label, actual) {
  return `${label}: foi encontrada uma colisão com o registo "${actual.id}".`;
}

function assertFieldsMatch(actual, expected, fields, label) {
  for (const field of fields) {
    if (actual[field] !== expected[field]) {
      throw new Error(
        `${formatCollision(label, actual)} ` +
          `O campo "${field}" não corresponde ao dataset demo.`,
      );
    }
  }
}

function assertUniqueKeyOwnership({
  actualRows,
  expectedRows,
  uniqueField,
  additionalFields = [],
  label,
}) {
  const expectedById = createValueMap(expectedRows, "id");
  const expectedByUniqueValue = createValueMap(expectedRows, uniqueField);

  for (const actual of actualRows) {
    const expectedFromId = expectedById.get(actual.id);
    const expectedFromUniqueValue = expectedByUniqueValue.get(
      actual[uniqueField],
    );

    if (!expectedFromId || !expectedFromUniqueValue) {
      throw new Error(formatCollision(label, actual));
    }

    if (expectedFromId.id !== expectedFromUniqueValue.id) {
      throw new Error(
        `${formatCollision(label, actual)} ` +
          `O ID reservado e o campo "${uniqueField}" pertencem a ` +
          "definições demo diferentes.",
      );
    }

    assertFieldsMatch(
      actual,
      expectedFromId,
      [uniqueField, ...additionalFields],
      label,
    );
  }
}

function assertIdOwnership({ actualRows, expectedRows, fields, label }) {
  const expectedById = createValueMap(expectedRows, "id");

  for (const actual of actualRows) {
    const expected = expectedById.get(actual.id);

    if (!expected) {
      throw new Error(formatCollision(label, actual));
    }

    assertFieldsMatch(actual, expected, fields, label);
  }
}

async function assertUtenteOwnership(tx, dataset) {
  const ids = dataset.utentes.map((row) => row.id);
  const numeros = dataset.utentes.map((row) => row.numero9);

  const existing = await tx.utente.findMany({
    where: {
      OR: [
        {
          id: {
            in: ids,
          },
        },
        {
          numero9: {
            in: numeros,
          },
        },
      ],
    },
    select: {
      id: true,
      numero9: true,
    },
  });

  assertUniqueKeyOwnership({
    actualRows: existing,
    expectedRows: dataset.utentes,
    uniqueField: "numero9",
    label: "Utentes demo",
  });
}

async function assertReceitaOwnership(tx, dataset) {
  const ids = dataset.receitas.map((row) => row.id);
  const numeros = dataset.receitas.map((row) => row.numero19);

  const existing = await tx.receita.findMany({
    where: {
      OR: [
        {
          id: {
            in: ids,
          },
        },
        {
          numero19: {
            in: numeros,
          },
        },
      ],
    },
    select: {
      id: true,
      utenteId: true,
      numero19: true,
    },
  });

  assertUniqueKeyOwnership({
    actualRows: existing,
    expectedRows: dataset.receitas,
    uniqueField: "numero19",
    additionalFields: ["utenteId"],
    label: "Receitas demo",
  });
}

async function assertPedidoOwnership(tx, dataset) {
  const ids = dataset.pedidos.map((row) => row.id);
  const numeros = dataset.pedidos.map((row) => row.numero);

  const existing = await tx.pedido.findMany({
    where: {
      OR: [
        {
          id: {
            in: ids,
          },
        },
        {
          numero: {
            in: numeros,
          },
        },
      ],
    },
    select: {
      id: true,
      numero: true,
    },
  });

  assertUniqueKeyOwnership({
    actualRows: existing,
    expectedRows: dataset.pedidos,
    uniqueField: "numero",
    label: "Pedidos demo",
  });
}

async function assertAlertaOwnership(tx, dataset) {
  const ids = dataset.alertas.map((row) => row.id);
  const idempotencyKeys = dataset.alertas.map((row) => row.idempotencyKey);

  const existing = await tx.alertaOperacional.findMany({
    where: {
      OR: [
        {
          id: {
            in: ids,
          },
        },
        {
          idempotencyKey: {
            in: idempotencyKeys,
          },
        },
      ],
    },
    select: {
      id: true,
      tipo: true,
      destino: true,
      idempotencyKey: true,
    },
  });

  assertUniqueKeyOwnership({
    actualRows: existing,
    expectedRows: dataset.alertas,
    uniqueField: "idempotencyKey",
    additionalFields: ["tipo", "destino"],
    label: "Alertas demo",
  });
}

async function assertMedicacaoHabitualOwnership(tx, dataset) {
  const ids = dataset.medicacoesHabituais.map((row) => row.id);

  const existing = await tx.medicacaoHabitual.findMany({
    where: {
      id: {
        in: ids,
      },
    },
    select: {
      id: true,
      utenteId: true,
      medicamentoNorm: true,
    },
  });

  assertIdOwnership({
    actualRows: existing,
    expectedRows: dataset.medicacoesHabituais,
    fields: ["utenteId", "medicamentoNorm"],
    label: "Medicação habitual demo",
  });
}

async function assertReceitaLinhaOwnership(tx, dataset) {
  const ids = dataset.receitaLinhas.map((row) => row.id);

  const existing = await tx.receitaLinha.findMany({
    where: {
      id: {
        in: ids,
      },
    },
    select: {
      id: true,
      receitaId: true,
      nome: true,
    },
  });

  assertIdOwnership({
    actualRows: existing,
    expectedRows: dataset.receitaLinhas,
    fields: ["receitaId", "nome"],
    label: "Linhas de receita demo",
  });
}

async function assertSemReceitaOwnership(tx, dataset) {
  const ids = dataset.semReceita.map((row) => row.id);

  const existing = await tx.semReceita.findMany({
    where: {
      id: {
        in: ids,
      },
    },
    select: {
      id: true,
      utenteId: true,
      medicamento: true,
    },
  });

  assertIdOwnership({
    actualRows: existing,
    expectedRows: dataset.semReceita,
    fields: ["utenteId", "medicamento"],
    label: "Medicamentos não sujeitos a receita médica demo",
  });
}

async function assertExtraOwnership(tx, dataset) {
  const ids = dataset.extras.map((row) => row.id);

  const existing = await tx.extra.findMany({
    where: {
      id: {
        in: ids,
      },
    },
    select: {
      id: true,
      utenteId: true,
      medicamento: true,
    },
  });

  assertIdOwnership({
    actualRows: existing,
    expectedRows: dataset.extras,
    fields: ["utenteId", "medicamento"],
    label: "Vendas Suspensas demo",
  });
}

async function assertPedidoItemOwnership(tx, dataset) {
  const ids = dataset.pedidoItens.map((row) => row.id);

  const existing = await tx.pedidoItem.findMany({
    where: {
      id: {
        in: ids,
      },
    },
    select: {
      id: true,
      pedidoId: true,
      utenteId: true,
      tipo: true,
      medicamento: true,
    },
  });

  assertIdOwnership({
    actualRows: existing,
    expectedRows: dataset.pedidoItens,
    fields: ["pedidoId", "utenteId", "tipo", "medicamento"],
    label: "Itens de pedido demo",
  });
}

async function assertDispensaOwnership(tx, dataset) {
  const ids = dataset.dispensas.map((row) => row.id);

  const existing = await tx.dispensa.findMany({
    where: {
      id: {
        in: ids,
      },
    },
    select: {
      id: true,
      receitaLinhaId: true,
      pedidoItemId: true,
    },
  });

  assertIdOwnership({
    actualRows: existing,
    expectedRows: dataset.dispensas,
    fields: ["receitaLinhaId", "pedidoItemId"],
    label: "Dispensas demo",
  });
}

async function assertRegularizacaoOwnership(tx, dataset) {
  const ids = dataset.regularizacoes.map((row) => row.id);

  const existing = await tx.regularizacaoExtra.findMany({
    where: {
      id: {
        in: ids,
      },
    },
    select: {
      id: true,
      utenteId: true,
      extraId: true,
      pedidoId: true,
      medicamento: true,
    },
  });

  assertIdOwnership({
    actualRows: existing,
    expectedRows: dataset.regularizacoes,
    fields: ["utenteId", "extraId", "pedidoId", "medicamento"],
    label: "Regularizações demo",
  });
}

async function assertRegularizacaoEventoOwnership(tx, dataset) {
  const ids = dataset.regularizacaoEventos.map((row) => row.id);

  const existing = await tx.regularizacaoEvento.findMany({
    where: {
      id: {
        in: ids,
      },
    },
    select: {
      id: true,
      regularizacaoId: true,
      receitaLinhaId: true,
    },
  });

  assertIdOwnership({
    actualRows: existing,
    expectedRows: dataset.regularizacaoEventos,
    fields: ["regularizacaoId", "receitaLinhaId"],
    label: "Eventos de regularização demo",
  });
}

async function assertReservedRecordOwnership(tx, dataset) {
  await assertUtenteOwnership(tx, dataset);
  await assertReceitaOwnership(tx, dataset);
  await assertPedidoOwnership(tx, dataset);
  await assertAlertaOwnership(tx, dataset);

  await assertMedicacaoHabitualOwnership(tx, dataset);
  await assertReceitaLinhaOwnership(tx, dataset);
  await assertSemReceitaOwnership(tx, dataset);
  await assertExtraOwnership(tx, dataset);
  await assertPedidoItemOwnership(tx, dataset);
  await assertDispensaOwnership(tx, dataset);
  await assertRegularizacaoOwnership(tx, dataset);
  await assertRegularizacaoEventoOwnership(tx, dataset);
}

async function getDemoPedidoScope(tx, dataset) {
  const { pedidoIds: reservedPedidoIds } = getDemoIdLists();
  const demoUtenteIds = dataset.utentes.map((row) => row.id);
  const demoUtenteIdSet = new Set(demoUtenteIds);

  const pedidos = await tx.pedido.findMany({
    where: {
      OR: [
        {
          id: {
            in: reservedPedidoIds,
          },
        },
        {
          itens: {
            some: {
              utenteId: {
                in: demoUtenteIds,
              },
            },
          },
        },
      ],
    },
    select: {
      id: true,
      itens: {
        select: {
          id: true,
          utenteId: true,
        },
      },
    },
  });

  for (const pedido of pedidos) {
    const nonDemoItem = pedido.itens.find(
      (item) => !demoUtenteIdSet.has(item.utenteId),
    );

    if (nonDemoItem) {
      throw new Error(
        `O pedido "${pedido.id}" contém simultaneamente itens demo e ` +
          "itens de utentes não-demo. A reposição foi interrompida.",
      );
    }
  }

  return {
    pedidoIds: unique(pedidos.map((pedido) => pedido.id)),
    pedidoItemIds: unique(
      pedidos.flatMap((pedido) => pedido.itens.map((item) => item.id)),
    ),
  };
}

async function buildDemoOperationalScope(tx, dataset) {
  const demoUtenteIds = dataset.utentes.map((row) => row.id);
  const reservedIds = getDemoIdLists();

  const pedidoScope = await getDemoPedidoScope(tx, dataset);

  const [receitas, semReceita, extras, regularizacoes] = await Promise.all([
    tx.receita.findMany({
      where: {
        OR: [
          {
            id: {
              in: reservedIds.receitaIds,
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
      },
    }),

    tx.semReceita.findMany({
      where: {
        OR: [
          {
            id: {
              in: reservedIds.semReceitaIds,
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
      },
    }),

    tx.extra.findMany({
      where: {
        OR: [
          {
            id: {
              in: reservedIds.extraIds,
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
      },
    }),

    tx.regularizacaoExtra.findMany({
      where: {
        OR: [
          {
            id: {
              in: reservedIds.regularizacaoIds,
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
      },
    }),
  ]);

  const receitaIds = unique(receitas.map((row) => row.id));

  const receitaLinhas =
    receitaIds.length > 0
      ? await tx.receitaLinha.findMany({
          where: {
            receitaId: {
              in: receitaIds,
            },
          },
          select: {
            id: true,
          },
        })
      : [];

  return {
    demoUtenteIds,

    receitaIds,
    receitaLinhaIds: unique(receitaLinhas.map((row) => row.id)),

    semReceitaIds: unique(semReceita.map((row) => row.id)),
    extraIds: unique(extras.map((row) => row.id)),

    pedidoIds: pedidoScope.pedidoIds,
    pedidoItemIds: pedidoScope.pedidoItemIds,

    regularizacaoIds: unique(regularizacoes.map((row) => row.id)),
  };
}

async function getDemoAlertIds(tx, dataset, scope) {
  const reservedAlertaIds = dataset.alertas.map((row) => row.id);

  const alertas = await tx.alertaOperacional.findMany({
    where: {
      OR: [
        {
          id: {
            in: reservedAlertaIds,
          },
        },
        {
          pedidoId: {
            in: scope.pedidoIds,
          },
        },
        {
          regularizacaoId: {
            in: scope.regularizacaoIds,
          },
        },
        {
          utenteId: {
            in: scope.demoUtenteIds,
          },
        },
      ],
    },
    select: {
      id: true,
    },
  });

  return unique(alertas.map((row) => row.id));
}

async function assertDemoOperationalOwnership(tx, dataset) {
  await assertReservedRecordOwnership(tx, dataset);

  return buildDemoOperationalScope(tx, dataset);
}

async function clearDemoOperationalData(tx, dataset) {
  const scope = await assertDemoOperationalOwnership(tx, dataset);
  const alertaIds = await getDemoAlertIds(tx, dataset, scope);

  const results = {};

  results.alertaDismissals =
    alertaIds.length > 0
      ? await tx.alertaOperacionalDismissal.deleteMany({
          where: {
            alertaId: {
              in: alertaIds,
            },
          },
        })
      : { count: 0 };

  results.alertas =
    alertaIds.length > 0
      ? await tx.alertaOperacional.deleteMany({
          where: {
            id: {
              in: alertaIds,
            },
          },
        })
      : { count: 0 };

  results.regularizacaoEventos =
    scope.regularizacaoIds.length > 0 || scope.receitaLinhaIds.length > 0
      ? await tx.regularizacaoEvento.deleteMany({
          where: {
            OR: [
              {
                regularizacaoId: {
                  in: scope.regularizacaoIds,
                },
              },
              {
                receitaLinhaId: {
                  in: scope.receitaLinhaIds,
                },
              },
            ],
          },
        })
      : { count: 0 };

  results.regularizacoes =
    scope.regularizacaoIds.length > 0
      ? await tx.regularizacaoExtra.deleteMany({
          where: {
            id: {
              in: scope.regularizacaoIds,
            },
          },
        })
      : { count: 0 };

  results.dispensas =
    scope.receitaLinhaIds.length > 0 || scope.pedidoItemIds.length > 0
      ? await tx.dispensa.deleteMany({
          where: {
            OR: [
              {
                receitaLinhaId: {
                  in: scope.receitaLinhaIds,
                },
              },
              {
                pedidoItemId: {
                  in: scope.pedidoItemIds,
                },
              },
            ],
          },
        })
      : { count: 0 };

  results.pedidoItens =
    scope.pedidoIds.length > 0
      ? await tx.pedidoItem.deleteMany({
          where: {
            pedidoId: {
              in: scope.pedidoIds,
            },
          },
        })
      : { count: 0 };

  results.pedidos =
    scope.pedidoIds.length > 0
      ? await tx.pedido.deleteMany({
          where: {
            id: {
              in: scope.pedidoIds,
            },
          },
        })
      : { count: 0 };

  results.receitaLinhas =
    scope.receitaIds.length > 0
      ? await tx.receitaLinha.deleteMany({
          where: {
            receitaId: {
              in: scope.receitaIds,
            },
          },
        })
      : { count: 0 };

  results.receitas =
    scope.receitaIds.length > 0
      ? await tx.receita.deleteMany({
          where: {
            id: {
              in: scope.receitaIds,
            },
          },
        })
      : { count: 0 };

  results.semReceita = await tx.semReceita.deleteMany({
    where: {
      utenteId: {
        in: scope.demoUtenteIds,
      },
    },
  });

  results.extras = await tx.extra.deleteMany({
    where: {
      utenteId: {
        in: scope.demoUtenteIds,
      },
    },
  });

  results.medicacoesHabituais = await tx.medicacaoHabitual.deleteMany({
    where: {
      utenteId: {
        in: scope.demoUtenteIds,
      },
    },
  });

  results.utentes = await tx.utente.deleteMany({
    where: {
      id: {
        in: scope.demoUtenteIds,
      },
    },
  });

  return Object.fromEntries(
    Object.entries(results).map(([key, result]) => [
      key,
      Number(result.count || 0),
    ]),
  );
}

module.exports = {
  assertDemoOperationalOwnership,
  buildDemoOperationalScope,
  clearDemoOperationalData,
};
