const bcrypt = require("bcryptjs");
const { env } = require("../src/config/env");
const { prisma } = require("../src/db/prisma");
const SALT_ROUNDS = 12;
const DEMO_CONFIRMATION_VALUE = "PORTFOLIO_DEMO";
const EXAMPLE_PASSWORDS = new Set([
  "ChangeMeDemoAdmin123!",
  "ChangeMeDemoSantaCasa123!",
  "ChangeMeDemoFarmacia123!",
]);
const DEMO_USER_DEFINITIONS = [
  {
    role: "ADMIN",
    nameEnv: "DEMO_ADMIN_NAME",
    emailEnv: "DEMO_ADMIN_EMAIL",
    passwordEnv: "DEMO_ADMIN_PASSWORD",
    defaultName: "Administrador Demo",
    defaultEmail: "demo.admin@sistema.local",
  },
  {
    role: "SANTACASA",
    nameEnv: "DEMO_SANTACASA_NAME",
    emailEnv: "DEMO_SANTACASA_EMAIL",
    passwordEnv: "DEMO_SANTACASA_PASSWORD",
    defaultName: "Santa Casa Demo",
    defaultEmail: "demo.santacasa@sistema.local",
  },
  {
    role: "FARMACIA",
    nameEnv: "DEMO_FARMACIA_NAME",
    emailEnv: "DEMO_FARMACIA_EMAIL",
    passwordEnv: "DEMO_FARMACIA_PASSWORD",
    defaultName: "Farmácia Demo",
    defaultEmail: "demo.farmacia@sistema.local",
  },
];
function getBoolean(name, fallback = false) {
  const value = String(process.env[name] ?? "")
    .trim()
    .toLowerCase();
  if (["1", "true", "yes", "on"].includes(value)) return true;
  if (["0", "false", "no", "off"].includes(value)) return false;
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
  return { name, email, password, role: definition.role };
}
function assertUniqueDemoEmails(users) {
  const emails = users.map((user) => user.email);
  if (new Set(emails).size !== emails.length) {
    throw new Error("Os emails das contas demo têm de ser diferentes.");
  }
}
function assertDemoEmailsDoNotReuseSeedAccounts(users) {
  const protectedEmails = new Set(
    [
      process.env.SEED_ADMIN_EMAIL,
      process.env.SEED_SANTACASA_EMAIL,
      process.env.SEED_FARMACIA_EMAIL,
    ]
      .map(normalizeEmail)
      .filter(Boolean),
  );
  const reusedEmail = users.find((user) => protectedEmails.has(user.email));
  if (reusedEmail) {
    throw new Error(
      `A conta demo ${reusedEmail.email} não pode reutilizar uma conta do seed inicial.`,
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
async function upsertDemoUsers(users) {
  const usersData = await Promise.all(users.map(buildDemoUserData));
  return prisma.$transaction(
    usersData.map((userData) =>
      prisma.user.upsert({
        where: { email: userData.email },
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
      }),
    ),
  );
}
async function main() {
  assertDemoSeedAllowed();
  const demoUsers = DEMO_USER_DEFINITIONS.map(getDemoUser);
  assertUniqueDemoEmails(demoUsers);
  assertDemoEmailsDoNotReuseSeedAccounts(demoUsers);
  console.log("[seed:demo] A criar ou atualizar contas demo...");
  const users = await upsertDemoUsers(demoUsers);
  console.table(
    users.map((user) => ({
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    })),
  );
  console.log(
    "[seed:demo] Contas demo concluídas. As passwords foram sincronizadas com as variáveis de ambiente.",
  );
}
main()
  .catch((error) => {
    console.error("[seed:demo] Erro:", error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
