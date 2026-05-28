const request = require("supertest");

const { TEST_USERS } = require("../fixtures/users.fixture");

async function loginAs(app, user) {
  const response = await request(app)
    .post("/api/auth/login")
    .send({
      email: user.email,
      password: user.password,
    })
    .expect(200);

  const cookies = response.headers["set-cookie"];

  if (!cookies) {
    throw new Error(`Login ${user.role} não devolveu cookie.`);
  }

  return cookies;
}

async function createAuthenticatedAgent(app, user) {
  const agent = request.agent(app);

  await agent
    .post("/api/auth/login")
    .send({
      email: user.email,
      password: user.password,
    })
    .expect(200);

  return agent;
}

async function createAdminAgent(app) {
  return createAuthenticatedAgent(app, TEST_USERS.admin);
}

async function createSantaCasaAgent(app) {
  return createAuthenticatedAgent(app, TEST_USERS.santacasa);
}

async function createFarmaciaAgent(app) {
  return createAuthenticatedAgent(app, TEST_USERS.farmacia);
}

module.exports = {
  loginAs,
  createAuthenticatedAgent,
  createAdminAgent,
  createSantaCasaAgent,
  createFarmaciaAgent,
};
