const bcrypt = require("bcryptjs");

const { prisma } = require("../src/db/prisma");

const SALT_ROUNDS = 12;

const USERS = [
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

async function upsertUser({ name, email, password, role }) {
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

async function main() {
  console.log("[seed] A criar utilizadores iniciais...");

  const users = [];

  for (const userData of USERS) {
    const user = await upsertUser(userData);
    users.push(user);
  }

  console.table(
    users.map((user) => ({
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    })),
  );

  console.log("[seed] Utilizadores iniciais criados/atualizados.");
}

main()
  .catch((error) => {
    console.error("[seed] Erro ao criar utilizadores:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
