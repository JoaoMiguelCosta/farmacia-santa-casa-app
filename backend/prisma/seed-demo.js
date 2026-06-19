const bcrypt = require("bcryptjs");

const { env } = require("../src/config/env");
const { prisma } = require("../src/db/prisma");

const {
  buildDemoDataset,
  validateDemoDataset,
} = require("./demo/demo-dataset");

const { clearDemoOperationalData } = require("./demo/demo-reset");

const { createDemoOperationalData } = require("./demo/demo-persist");

const { verifyDemoOperationalData } = require("./demo/demo-verify");

const SALT_ROUNDS = 12;
const DEMO_CONFIRMATION_VALUE = "PORTFOLIO_DEMO";

const TRANSACTION_OPTIONS = Object.freeze({
  maxWait: 10_000,
  timeout: 60_000,
});

const EXAMPLE_PASSWORDS = new Set([
  "ChangeMeDemoAdmin123!",
  "ChangeMeDemoSantaCasa123!",
  "ChangeMeDemoFarmacia123!",
]);

const INITIAL_SEED_EMAILS = Object.freeze({
  ADMIN: "admin@sistema.local",
  SANTACASA: "santacasa@sistema.local",
  FARMACIA: "farmacia@sistema.local",
});

const DEMO_USER_DEFINITIONS = Object.freeze([
  Object.freeze({
    role: "ADMIN",
    nameEnv: "DEMO_ADMIN_NAME",
    emailEnv: "DEMO_ADMIN_EMAIL",
    passwordEnv: "DEMO_ADMIN_PASSWORD",
    defaultName: "Administrador Demo",
    defaultEmail: "demo.admin@sistema.local",
  }),

  Object.freeze({
    role: "SANTACASA",
    nameEnv: "DEMO_SANTACASA_NAME",
    emailEnv: "DEMO_SANTACASA_EMAIL",
    passwordEnv: "DEMO_SANTACASA_PASSWORD",
    defaultName: "Santa Casa Demo",
    defaultEmail: "demo.santacasa@sistema.local",
  }),

  Object.freeze({
    role: "FARMACIA",
    nameEnv: "DEMO_FARMACIA_NAME",
    emailEnv: "DEMO_FARMACIA_EMAIL",
    passwordEnv: "DEMO_FARMACIA_PASSWORD",
    defaultName: "Farmácia Demo",
    defaultEmail: "demo.farmacia@sistema.local",
  }),
]);

function getBoolean(name, fallback = false) {
  const value = String(process.env[name] ?? "")
    .trim()
    .toLowerCase();

  if (["1", "true", "yes", "on"].includes(value)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(value)) {
    return false;
  }

  return fallback;
}

function hasExplicitEnvValue(name) {
  return String(process.env[name] ?? "").trim().length > 0;
}

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

function assertDemoSeedAllowed() {
  if (!getBoolean("ALLOW_DEMO_SEED", false)) {
    throw new Error(
      "Seed demo bloqueado. Define ALLOW_DEMO_SEED=true apenas durante uma reposição controlada do ambiente demo.",
    );
  }

  const confirmation = String(process.env.DEMO_SEED_CONFIRMATION || "").trim();

  if (confirmation !== DEMO_CONFIRMATION_VALUE) {
    throw new Error(
      `DEMO_SEED_CONFIRMATION inválida. Usa exatamente ${DEMO_CONFIRMATION_VALUE}.`,
    );
  }
}

function validateEmail(name, email) {
  if (!email.includes("@")) {
    throw new Error(`${name} inválido.`);
  }
}

function validatePassword(name, password) {
  if (password.length < 12) {
    throw new Error(`${name} deve ter pelo menos 12 caracteres.`);
  }

  if (env.NODE_ENV === "production" && EXAMPLE_PASSWORDS.has(password)) {
    throw new Error(
      `${name} não pode usar a password de exemplo em production.`,
    );
  }
}

function getDemoUser(definition) {
  const name = String(
    process.env[definition.nameEnv] || definition.defaultName,
  ).trim();

  const email = normalizeEmail(
    process.env[definition.emailEnv] || definition.defaultEmail,
  );

  if (!hasExplicitEnvValue(definition.passwordEnv)) {
    throw new Error(`${definition.passwordEnv} é obrigatório.`);
  }

  const password = String(process.env[definition.passwordEnv] || "");

  validateEmail(definition.emailEnv, email);
  validatePassword(definition.passwordEnv, password);

  return {
    name,
    email,
    password,
    role: definition.role,
  };
}

function assertUniqueDemoEmails(users) {
  const emails = users.map((user) => user.email);

  if (new Set(emails).size !== emails.length) {
    throw new Error("Os emails das contas demo têm de ser diferentes.");
  }
}

function getProtectedSeedEmails() {
  return new Set(
    [
      process.env.SEED_ADMIN_EMAIL || INITIAL_SEED_EMAILS.ADMIN,

      process.env.SEED_SANTACASA_EMAIL || INITIAL_SEED_EMAILS.SANTACASA,

      process.env.SEED_FARMACIA_EMAIL || INITIAL_SEED_EMAILS.FARMACIA,
    ]
      .map(normalizeEmail)
      .filter(Boolean),
  );
}

function assertDemoEmailsDoNotReuseSeedAccounts(users) {
  const protectedEmails = getProtectedSeedEmails();

  const reusedUser = users.find((user) => protectedEmails.has(user.email));

  if (reusedUser) {
    throw new Error(
      `A conta demo ${reusedUser.email} não pode reutilizar uma conta do seed inicial.`,
    );
  }
}

async function buildDemoUserData(user) {
  const passwordHash = await bcrypt.hash(user.password, SALT_ROUNDS);

  return {
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: true,
    passwordHash,
  };
}

async function buildDemoUsersData(users) {
  return Promise.all(users.map(buildDemoUserData));
}

async function upsertDemoUsers(tx, usersData) {
  const users = [];

  for (const userData of usersData) {
    const user = await tx.user.upsert({
      where: {
        email: userData.email,
      },

      update: {
        name: userData.name,
        role: userData.role,
        isActive: true,
        passwordHash: userData.passwordHash,
      },

      create: userData,

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    users.push(user);
  }

  return users;
}

function printDemoUsers(users) {
  console.table(
    users.map((user) => ({
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    })),
  );
}

function printCleanupSummary(cleanupResult) {
  console.log("[seed:demo] Registos removidos durante a reposição:");

  console.table(
    Object.entries(cleanupResult).map(([entity, total]) => ({
      entity,
      total,
    })),
  );
}

function printPersistenceSummary(persistenceResult) {
  console.log("[seed:demo] Registos operacionais criados:");

  console.table(
    Object.entries(persistenceResult.registos).map(([entity, total]) => ({
      entity,
      total,
    })),
  );

  console.log("[seed:demo] Catálogo de medicamentos:");

  console.table([
    {
      criados: persistenceResult.medicamentos.criados,
      reutilizados: persistenceResult.medicamentos.reutilizados,
      total: persistenceResult.medicamentos.total,
    },
  ]);
}

function printVerificationSummary(verificationResult) {
  console.log("[seed:demo] Verificação final do ambiente demo:");

  console.table([
    {
      users: verificationResult.users,
      utentes: verificationResult.utentes,
      receitas: verificationResult.receitas,
      pedidos: verificationResult.pedidos,
      regularizacoes: verificationResult.regularizacoes,
      eventos: verificationResult.regularizacaoEventos,
      unidadesRegularizadas: verificationResult.unidadesRegularizadas,
      alertas: verificationResult.alertas,
    },
  ]);
}

async function resetDemoEnvironment({ dataset, usersData }) {
  return prisma.$transaction(async (tx) => {
    const users = await upsertDemoUsers(tx, usersData);

    const cleanupResult = await clearDemoOperationalData(tx, dataset);

    const persistenceResult = await createDemoOperationalData(
      tx,
      dataset,
      users,
    );

    const verificationResult = await verifyDemoOperationalData(
      tx,
      dataset,
      users,
      persistenceResult,
    );

    return {
      users,
      cleanupResult,
      persistenceResult,
      verificationResult,
    };
  }, TRANSACTION_OPTIONS);
}

async function main() {
  assertDemoSeedAllowed();

  const demoUsers = DEMO_USER_DEFINITIONS.map(getDemoUser);

  assertUniqueDemoEmails(demoUsers);
  assertDemoEmailsDoNotReuseSeedAccounts(demoUsers);

  const dataset = validateDemoDataset(buildDemoDataset());

  const usersData = await buildDemoUsersData(demoUsers);

  console.log("[seed:demo] A repor o ambiente de demonstração...");

  console.log(
    "[seed:demo] A operação é transacional: qualquer falha fará rollback completo.",
  );

  const result = await resetDemoEnvironment({
    dataset,
    usersData,
  });

  printDemoUsers(result.users);
  printCleanupSummary(result.cleanupResult);
  printPersistenceSummary(result.persistenceResult);
  printVerificationSummary(result.verificationResult);

  console.log("[seed:demo] Ambiente demo reposto e verificado com sucesso.");

  console.log(
    "[seed:demo] As passwords foram sincronizadas com as variáveis de ambiente.",
  );
}

main()
  .catch((error) => {
    console.error("[seed:demo] Erro:", error.message);

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
