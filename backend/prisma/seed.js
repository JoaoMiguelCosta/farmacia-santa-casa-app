const bcrypt = require("bcryptjs");

const { env } = require("../src/config/env");
const { prisma } = require("../src/db/prisma");

const SALT_ROUNDS = 12;

const DEFAULT_PASSWORDS = new Set([
  "Admin123!",
  "SantaCasa123!",
  "Farmacia123!",
]);

const DEVELOPMENT_USERS = [
  {
    name: "Administrador do Sistema",
    email: process.env.SEED_ADMIN_EMAIL || "admin@sistema.local",
    password: process.env.SEED_ADMIN_PASSWORD || "Admin123!",
    role: "ADMIN",
  },
  {
    name: "Utilizador Santa Casa",
    email: process.env.SEED_SANTACASA_EMAIL || "santacasa@sistema.local",
    password: process.env.SEED_SANTACASA_PASSWORD || "SantaCasa123!",
    role: "SANTACASA",
  },
  {
    name: "Utilizador Farmácia",
    email: process.env.SEED_FARMACIA_EMAIL || "farmacia@sistema.local",
    password: process.env.SEED_FARMACIA_PASSWORD || "Farmacia123!",
    role: "FARMACIA",
  },
];

function isProduction() {
  return env.NODE_ENV === "production";
}

function hasExplicitEnvValue(name) {
  return String(process.env[name] ?? "").trim().length > 0;
}

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

function getProductionAdminUser() {
  if (!hasExplicitEnvValue("SEED_ADMIN_EMAIL")) {
    throw new Error(
      "SEED_ADMIN_EMAIL é obrigatório para executar seed em produção.",
    );
  }

  if (!hasExplicitEnvValue("SEED_ADMIN_PASSWORD")) {
    throw new Error(
      "SEED_ADMIN_PASSWORD é obrigatório para executar seed em produção.",
    );
  }

  const email = normalizeEmail(process.env.SEED_ADMIN_EMAIL);
  const password = String(process.env.SEED_ADMIN_PASSWORD || "");

  if (!email.includes("@")) {
    throw new Error("SEED_ADMIN_EMAIL inválido.");
  }

  if (DEFAULT_PASSWORDS.has(password)) {
    throw new Error("SEED_ADMIN_PASSWORD não pode usar uma password default.");
  }

  if (password.length < 12) {
    throw new Error(
      "SEED_ADMIN_PASSWORD deve ter pelo menos 12 caracteres em produção.",
    );
  }

  return {
    name: process.env.SEED_ADMIN_NAME || "Administrador do Sistema",
    email,
    password,
    role: "ADMIN",
  };
}

function getSeedUsers() {
  if (!isProduction()) {
    return DEVELOPMENT_USERS;
  }

  if (!env.ALLOW_PRODUCTION_SEED) {
    throw new Error(
      "Seed bloqueado em produção. Define ALLOW_PRODUCTION_SEED=true apenas em caso controlado.",
    );
  }

  return [getProductionAdminUser()];
}

async function createUser({ name, email, password, role }) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  return prisma.user.create({
    data: {
      name,
      email,
      role,
      isActive: true,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
    },
  });
}

async function upsertDevelopmentUser({ name, email, password, role }) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  return prisma.user.upsert({
    where: {
      email,
    },
    update: {
      name,
      role,
      isActive: true,
      passwordHash,
    },
    create: {
      name,
      email,
      role,
      isActive: true,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
    },
  });
}

async function seedProductionAdmin(adminUser) {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: adminUser.email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  if (!existingUser) {
    return createUser(adminUser);
  }

  if (existingUser.role !== "ADMIN") {
    throw new Error(
      `Já existe um utilizador com o email ${adminUser.email}, mas não tem role ADMIN.`,
    );
  }

  console.log(
    "[seed] ADMIN inicial já existe. Não foi alterada password, role ou estado.",
  );

  return existingUser;
}

async function seedUser(userData) {
  if (isProduction()) {
    return seedProductionAdmin(userData);
  }

  return upsertDevelopmentUser(userData);
}

async function main() {
  const usersToSeed = getSeedUsers();

  console.log(
    isProduction()
      ? "[seed] Produção: a criar apenas o ADMIN inicial..."
      : "[seed] Desenvolvimento/teste: a criar utilizadores iniciais...",
  );

  const users = [];

  for (const userData of usersToSeed) {
    const user = await seedUser(userData);
    users.push(user);
  }

  console.table(
    users.map((user) => ({
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    })),
  );

  console.log("[seed] Seed concluído.");
}

main()
  .catch((error) => {
    console.error("[seed] Erro ao criar utilizadores:", error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
