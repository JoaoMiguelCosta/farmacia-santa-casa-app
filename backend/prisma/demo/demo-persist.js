const REQUIRED_DEMO_ROLES = Object.freeze(["ADMIN", "SANTACASA", "FARMACIA"]);

function createMap(rows, field) {
  return new Map(rows.map((row) => [row[field], row]));
}

function getDemoUserIdsByRole(users = []) {
  const userIdsByRole = {};

  for (const user of users) {
    if (!user?.id || !user?.role) {
      throw new Error(
        "Utilizador demo inválido: cada utilizador precisa de ID e role.",
      );
    }

    if (userIdsByRole[user.role]) {
      throw new Error(
        `Foi encontrado mais do que um utilizador demo com role ${user.role}.`,
      );
    }

    userIdsByRole[user.role] = user.id;
  }

  for (const role of REQUIRED_DEMO_ROLES) {
    if (!userIdsByRole[role]) {
      throw new Error(
        `Não foi encontrado o utilizador demo obrigatório com role ${role}.`,
      );
    }
  }

  return userIdsByRole;
}

function getAuditUserId(role, userIdsByRole) {
  if (!role) return null;

  const userId = userIdsByRole[role];

  if (!userId) {
    throw new Error(
      `Não existe utilizador demo disponível para a role ${role}.`,
    );
  }

  return userId;
}

function getResolvedMedicamentoId(medicamentoIdMap, datasetMedicamentoId) {
  if (!datasetMedicamentoId) return null;

  const resolvedId = medicamentoIdMap.get(datasetMedicamentoId);

  if (!resolvedId) {
    throw new Error(
      `Não foi possível resolver o medicamento "${datasetMedicamentoId}".`,
    );
  }

  return resolvedId;
}

function assertMedicamentoCompatibility(actual, expected) {
  if (actual.nome !== expected.nome) {
    throw new Error(
      `O ID reservado "${expected.id}" já pertence ao medicamento ` +
        `"${actual.nome}", mas era esperado "${expected.nome}".`,
    );
  }

  if (actual.tipo !== expected.tipo) {
    throw new Error(
      `O medicamento "${actual.nome}" existe com tipo ${actual.tipo}, ` +
        `mas o dataset demo exige ${expected.tipo}.`,
    );
  }
}

async function resolveDemoMedicamentos(tx, dataset) {
  const expectedById = createMap(dataset.medicamentos, "id");
  const expectedByName = createMap(dataset.medicamentos, "nome");

  const ids = dataset.medicamentos.map((row) => row.id);
  const nomes = dataset.medicamentos.map((row) => row.nome);

  const existing = await tx.medicamento.findMany({
    where: {
      OR: [
        {
          id: {
            in: ids,
          },
        },
        {
          nome: {
            in: nomes,
          },
        },
      ],
    },
    select: {
      id: true,
      nome: true,
      tipo: true,
    },
  });

  const existingByName = new Map();

  for (const actual of existing) {
    const expectedFromId = expectedById.get(actual.id);
    const expectedFromName = expectedByName.get(actual.nome);

    if (expectedFromId && expectedFromName) {
      if (expectedFromId.id !== expectedFromName.id) {
        throw new Error(
          `Colisão entre o ID reservado "${actual.id}" e o nome ` +
            `"${actual.nome}" no catálogo de medicamentos.`,
        );
      }
    }

    if (expectedFromId) {
      assertMedicamentoCompatibility(actual, expectedFromId);
    }

    if (expectedFromName) {
      if (actual.tipo !== expectedFromName.tipo) {
        throw new Error(
          `O medicamento "${actual.nome}" existe com tipo ${actual.tipo}, ` +
            `mas o dataset demo exige ${expectedFromName.tipo}.`,
        );
      }
    }

    if (!expectedFromId && !expectedFromName) {
      throw new Error(
        `Foi encontrado um medicamento inesperado durante a resolução: ` +
          `"${actual.nome}".`,
      );
    }

    existingByName.set(actual.nome, actual);
  }

  const medicamentoIdMap = new Map();
  let createdCount = 0;
  let reusedCount = 0;

  for (const expected of dataset.medicamentos) {
    let actual = existingByName.get(expected.nome);

    if (!actual) {
      actual = await tx.medicamento.create({
        data: {
          id: expected.id,
          nome: expected.nome,
          tipo: expected.tipo,
        },
        select: {
          id: true,
          nome: true,
          tipo: true,
        },
      });

      createdCount += 1;
    } else {
      reusedCount += 1;
    }

    medicamentoIdMap.set(expected.id, actual.id);
  }

  return {
    medicamentoIdMap,
    createdCount,
    reusedCount,
  };
}

async function createRows(model, rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return {
      count: 0,
    };
  }

  return model.createMany({
    data: rows,
  });
}

function buildUtenteRows(rows, userIdsByRole) {
  return rows.map((row) => {
    const { archivedByRole, ...data } = row;

    return {
      ...data,
      archivedById: getAuditUserId(archivedByRole, userIdsByRole),
    };
  });
}

function buildReceitaLinhaRows(rows, medicamentoIdMap) {
  return rows.map((row) => ({
    ...row,
    medicamentoId: getResolvedMedicamentoId(
      medicamentoIdMap,
      row.medicamentoId,
    ),
  }));
}

function buildExtraRows(rows, medicamentoIdMap) {
  return rows.map((row) => ({
    ...row,
    medicamentoId: getResolvedMedicamentoId(
      medicamentoIdMap,
      row.medicamentoId,
    ),
  }));
}

function buildPedidoRows(rows, userIdsByRole) {
  return rows.map((row) => {
    const { validatedByRole, rejectedByRole, canceledByRole, ...data } = row;

    return {
      ...data,

      validatedById: getAuditUserId(validatedByRole, userIdsByRole),

      rejectedById: getAuditUserId(rejectedByRole, userIdsByRole),

      canceledById: getAuditUserId(canceledByRole, userIdsByRole),
    };
  });
}

function buildPedidoItemRows(rows, userIdsByRole) {
  return rows.map((row) => {
    const { validatedByRole, rejectedByRole, ...data } = row;

    return {
      ...data,

      validatedById: getAuditUserId(validatedByRole, userIdsByRole),

      rejectedById: getAuditUserId(rejectedByRole, userIdsByRole),
    };
  });
}

function buildRegularizacaoRows(rows, medicamentoIdMap) {
  return rows.map((row) => ({
    ...row,
    medicamentoId: getResolvedMedicamentoId(
      medicamentoIdMap,
      row.medicamentoId,
    ),
  }));
}

function normalizeCreationResults(results) {
  return Object.fromEntries(
    Object.entries(results).map(([key, value]) => [
      key,
      Number(value?.count || 0),
    ]),
  );
}

async function createDemoOperationalData(tx, dataset, demoUsers) {
  if (!tx) {
    throw new Error("Cliente transacional Prisma em falta.");
  }

  if (!dataset) {
    throw new Error("Dataset demo em falta.");
  }

  const userIdsByRole = getDemoUserIdsByRole(demoUsers);

  const medicamentoResolution = await resolveDemoMedicamentos(tx, dataset);

  const { medicamentoIdMap } = medicamentoResolution;

  const results = {};

  results.utentes = await createRows(
    tx.utente,
    buildUtenteRows(dataset.utentes, userIdsByRole),
  );

  results.medicacoesHabituais = await createRows(
    tx.medicacaoHabitual,
    dataset.medicacoesHabituais,
  );

  results.receitas = await createRows(tx.receita, dataset.receitas);

  results.receitaLinhas = await createRows(
    tx.receitaLinha,
    buildReceitaLinhaRows(dataset.receitaLinhas, medicamentoIdMap),
  );

  results.semReceita = await createRows(tx.semReceita, dataset.semReceita);

  results.extras = await createRows(
    tx.extra,
    buildExtraRows(dataset.extras, medicamentoIdMap),
  );

  results.pedidos = await createRows(
    tx.pedido,
    buildPedidoRows(dataset.pedidos, userIdsByRole),
  );

  results.pedidoItens = await createRows(
    tx.pedidoItem,
    buildPedidoItemRows(dataset.pedidoItens, userIdsByRole),
  );

  results.dispensas = await createRows(tx.dispensa, dataset.dispensas);

  results.regularizacoes = await createRows(
    tx.regularizacaoExtra,
    buildRegularizacaoRows(dataset.regularizacoes, medicamentoIdMap),
  );

  results.regularizacaoEventos = await createRows(
    tx.regularizacaoEvento,
    dataset.regularizacaoEventos,
  );

  results.alertas = await createRows(tx.alertaOperacional, dataset.alertas);

  return {
    medicamentos: {
      criados: medicamentoResolution.createdCount,
      reutilizados: medicamentoResolution.reusedCount,
      total: medicamentoIdMap.size,
    },

    registos: normalizeCreationResults(results),

    userIdsByRole,

    medicamentoIds: Object.fromEntries(medicamentoIdMap.entries()),
  };
}

module.exports = {
  createDemoOperationalData,
  getDemoUserIdsByRole,
  resolveDemoMedicamentos,
};
