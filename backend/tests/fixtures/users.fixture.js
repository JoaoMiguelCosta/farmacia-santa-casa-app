const TEST_USERS = Object.freeze({
  admin: {
    email: process.env.SEED_ADMIN_EMAIL || "admin@sistema.local",
    password: process.env.SEED_ADMIN_PASSWORD || "Admin123!",
    role: "ADMIN",
  },

  santacasa: {
    email: process.env.SEED_SANTACASA_EMAIL || "santacasa@sistema.local",
    password: process.env.SEED_SANTACASA_PASSWORD || "SantaCasa123!",
    role: "SANTACASA",
  },

  farmacia: {
    email: process.env.SEED_FARMACIA_EMAIL || "farmacia@sistema.local",
    password: process.env.SEED_FARMACIA_PASSWORD || "Farmacia123!",
    role: "FARMACIA",
  },
});

module.exports = {
  TEST_USERS,
};
