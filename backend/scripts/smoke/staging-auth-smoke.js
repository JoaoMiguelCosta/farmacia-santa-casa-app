const EXPECTED_CONFIRMATION = "STAGING_READ_ONLY";

const DEFAULT_API_BASE_URL =
  "https://farmacia-santacasa-backend-staging.onrender.com/api";

const DEFAULT_FRONTEND_ORIGIN =
  "https://farmacia-santacasa-frontend-staging.onrender.com";

const REQUEST_TIMEOUT_MS = 30_000;

const USER_DEFINITIONS = Object.freeze([
  Object.freeze({
    role: "ADMIN",
    emailEnv: "DEMO_ADMIN_EMAIL",
    passwordEnv: "DEMO_ADMIN_PASSWORD",
    defaultEmail: "demo.admin@sistema.local",
  }),
  Object.freeze({
    role: "SANTACASA",
    emailEnv: "DEMO_SANTACASA_EMAIL",
    passwordEnv: "DEMO_SANTACASA_PASSWORD",
    defaultEmail: "demo.santacasa@sistema.local",
  }),
  Object.freeze({
    role: "FARMACIA",
    emailEnv: "DEMO_FARMACIA_EMAIL",
    passwordEnv: "DEMO_FARMACIA_PASSWORD",
    defaultEmail: "demo.farmacia@sistema.local",
  }),
]);

function fail(message, details) {
  console.error(`❌ ${message}`);

  if (details !== undefined) {
    console.error(details);
  }

  process.exit(1);
}

function assert(condition, message, details) {
  if (!condition) {
    fail(message, details);
  }
}

function logStep(message) {
  console.log(`\n▶ ${message}`);
}

function logOk(message) {
  console.log(`✅ ${message}`);
}

function normalizeEmail(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function getRequiredEnv(name) {
  const value = String(process.env[name] || "").trim();

  if (!value) {
    fail(`Variável obrigatória em falta: ${name}`);
  }

  return value;
}

function normalizeApiBaseUrl(rawValue) {
  const parsed = new URL(rawValue);

  assert(
    parsed.protocol === "https:",
    "STAGING_API_BASE_URL tem de usar HTTPS.",
  );

  const pathname = parsed.pathname.replace(/\/+$/, "");

  assert(
    pathname === "/api",
    "STAGING_API_BASE_URL tem de terminar exatamente em /api.",
    { receivedPath: parsed.pathname },
  );

  assert(
    parsed.hostname.toLowerCase().includes("staging"),
    "O hostname da API não parece ser de staging.",
    { hostname: parsed.hostname },
  );

  return `${parsed.origin}/api`;
}

function normalizeFrontendOrigin(rawValue) {
  const normalizedValue = rawValue.replace(/\/+$/, "");
  const parsed = new URL(normalizedValue);

  assert(
    parsed.protocol === "https:",
    "STAGING_FRONTEND_ORIGIN tem de usar HTTPS.",
  );

  assert(
    parsed.origin === normalizedValue,
    "STAGING_FRONTEND_ORIGIN deve conter apenas o origin, sem /login nem outro caminho.",
    { expected: parsed.origin },
  );

  assert(
    parsed.hostname.toLowerCase().includes("staging"),
    "O hostname do frontend não parece ser de staging.",
    { hostname: parsed.hostname },
  );

  return parsed.origin;
}

function assertSafeRuntime() {
  const confirmation = String(
    process.env.STAGING_SMOKE_CONFIRMATION || "",
  ).trim();

  assert(
    confirmation === EXPECTED_CONFIRMATION,
    `Confirmação inválida. Define STAGING_SMOKE_CONFIRMATION=${EXPECTED_CONFIRMATION}.`,
  );
}

function getUsers() {
  const users = USER_DEFINITIONS.map((definition) => {
    const email = normalizeEmail(
      process.env[definition.emailEnv] || definition.defaultEmail,
    );

    const password = getRequiredEnv(definition.passwordEnv);

    assert(email.includes("@"), `${definition.emailEnv} inválido.`);

    return {
      role: definition.role,
      email,
      password,
    };
  });

  assert(
    new Set(users.map((user) => user.email)).size === users.length,
    "Os emails das três contas demo têm de ser diferentes.",
  );

  return users;
}

function getSetCookies(headers) {
  if (typeof headers?.getSetCookie === "function") {
    return headers.getSetCookie();
  }

  const setCookie = headers?.get("set-cookie");

  return setCookie ? [setCookie] : [];
}

function extractCookieHeader(headers) {
  return getSetCookies(headers)
    .flatMap((value) => String(value).split(/,(?=\s*[^;,=\s]+=[^;,]+)/g))
    .map((cookie) => cookie.split(";")[0].trim())
    .filter(Boolean)
    .join("; ");
}

function getResponseUser(body) {
  return body?.user || body?.data?.user || body?.data || body || null;
}

function getResponseRole(body) {
  return getResponseUser(body)?.role || null;
}

function getResponseEmail(body) {
  return normalizeEmail(getResponseUser(body)?.email);
}

function assertCors(headers, frontendOrigin) {
  assert(
    headers.get("access-control-allow-origin") === frontendOrigin,
    "Access-Control-Allow-Origin inesperado.",
    {
      expected: frontendOrigin,
      received: headers.get("access-control-allow-origin"),
    },
  );

  assert(
    headers.get("access-control-allow-credentials") === "true",
    "Access-Control-Allow-Credentials devia ser true.",
    {
      received: headers.get("access-control-allow-credentials"),
    },
  );
}

function assertSessionCookie(headers) {
  const setCookies = getSetCookies(headers);
  const combined = setCookies.join("; ");

  assert(setCookies.length > 0, "O login não devolveu Set-Cookie.");
  assert(/httponly/i.test(combined), "O cookie não contém HttpOnly.");
  assert(/secure/i.test(combined), "O cookie não contém Secure.");
  assert(/samesite=none/i.test(combined), "O cookie não contém SameSite=None.");
  assert(/path=\//i.test(combined), "O cookie não contém Path=/.");
}

function assertClearedCookie(headers) {
  const setCookies = getSetCookies(headers);
  const combined = setCookies.join("; ");

  assert(setCookies.length > 0, "O logout não devolveu Set-Cookie.");

  assert(
    /expires=thu,\s*01 jan 1970/i.test(combined) ||
      /max-age=0/i.test(combined),
    "O logout não devolveu um cookie expirado.",
  );
}

async function parseResponseBody(response) {
  const text = await response.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function request(
  apiBaseUrl,
  frontendOrigin,
  method,
  path,
  options = {},
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const hasBody = options.body !== undefined;

    const response = await fetch(`${apiBaseUrl}${path}`, {
      method,
      redirect: "manual",
      signal: controller.signal,
      headers: {
        Origin: options.origin || frontendOrigin,
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
        ...(options.cookie ? { Cookie: options.cookie } : {}),
        ...(options.requestId ? { "X-Request-Id": options.requestId } : {}),
        ...(options.headers || {}),
      },
      body: hasBody ? JSON.stringify(options.body) : undefined,
    });

    const body = await parseResponseBody(response);

    console.log(`${method} ${path} -> ${response.status}`);

    return {
      status: response.status,
      ok: response.ok,
      headers: response.headers,
      body,
      cookie: extractCookieHeader(response.headers),
    };
  } catch (error) {
    if (error?.name === "AbortError") {
      fail(`Timeout ao chamar ${method} ${path}.`);
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function expectStatus(
  apiBaseUrl,
  frontendOrigin,
  method,
  path,
  expectedStatus,
  options = {},
) {
  const result = await request(
    apiBaseUrl,
    frontendOrigin,
    method,
    path,
    options,
  );

  assert(
    result.status === expectedStatus,
    `Esperava HTTP ${expectedStatus} em ${method} ${path}, recebeu HTTP ${result.status}.`,
    result.body,
  );

  return result;
}

async function login(apiBaseUrl, frontendOrigin, user) {
  const result = await expectStatus(
    apiBaseUrl,
    frontendOrigin,
    "POST",
    "/auth/login",
    200,
    {
      body: {
        email: user.email,
        password: user.password,
      },
    },
  );

  assertCors(result.headers, frontendOrigin);
  assertSessionCookie(result.headers);

  assert(
    getResponseRole(result.body) === user.role,
    `O login de ${user.role} devolveu uma role inesperada.`,
    { receivedRole: getResponseRole(result.body) },
  );

  assert(
    getResponseEmail(result.body) === user.email,
    `O login de ${user.role} devolveu um email inesperado.`,
    { receivedEmail: getResponseEmail(result.body) },
  );

  assert(result.cookie, `O login de ${user.role} não produziu cookie.`);

  logOk(`Login ${user.role}`);

  return result.cookie;
}

async function verifyCurrentUser(
  apiBaseUrl,
  frontendOrigin,
  user,
  cookie,
) {
  const result = await expectStatus(
    apiBaseUrl,
    frontendOrigin,
    "GET",
    "/auth/me",
    200,
    { cookie },
  );

  assertCors(result.headers, frontendOrigin);

  assert(
    getResponseRole(result.body) === user.role,
    `/auth/me devolveu role inesperada para ${user.role}.`,
    { receivedRole: getResponseRole(result.body) },
  );

  assert(
    getResponseEmail(result.body) === user.email,
    `/auth/me devolveu email inesperado para ${user.role}.`,
    { receivedEmail: getResponseEmail(result.body) },
  );

  logOk(`/auth/me ${user.role}`);
}

async function verifyRoleAccess(
  apiBaseUrl,
  frontendOrigin,
  sessions,
) {
  const adminHealth = await expectStatus(
    apiBaseUrl,
    frontendOrigin,
    "GET",
    "/health",
    200,
    { cookie: sessions.ADMIN },
  );

  assertCors(adminHealth.headers, frontendOrigin);
  logOk("ADMIN acede ao health administrativo");

  const santaCasaHealth = await expectStatus(
    apiBaseUrl,
    frontendOrigin,
    "GET",
    "/santacasa/health",
    200,
    { cookie: sessions.SANTACASA },
  );

  assertCors(santaCasaHealth.headers, frontendOrigin);
  logOk("SANTACASA acede ao respetivo health");

  const farmaciaHealth = await expectStatus(
    apiBaseUrl,
    frontendOrigin,
    "GET",
    "/farmacia/health",
    200,
    { cookie: sessions.FARMACIA },
  );

  assertCors(farmaciaHealth.headers, frontendOrigin);
  logOk("FARMACIA acede ao respetivo health");

  await expectStatus(
    apiBaseUrl,
    frontendOrigin,
    "GET",
    "/farmacia/health",
    403,
    { cookie: sessions.SANTACASA },
  );

  await expectStatus(
    apiBaseUrl,
    frontendOrigin,
    "GET",
    "/santacasa/health",
    403,
    { cookie: sessions.FARMACIA },
  );

  logOk("Bloqueios cruzados entre SANTACASA e FARMACIA");
}

async function logout(
  apiBaseUrl,
  frontendOrigin,
  role,
  cookie,
) {
  const result = await expectStatus(
    apiBaseUrl,
    frontendOrigin,
    "POST",
    "/auth/logout",
    200,
    { cookie },
  );

  assertCors(result.headers, frontendOrigin);
  assertClearedCookie(result.headers);

  logOk(`Logout ${role}`);
}

async function main() {
  assertSafeRuntime();

  const apiBaseUrl = normalizeApiBaseUrl(
    process.env.STAGING_API_BASE_URL || DEFAULT_API_BASE_URL,
  );

  const frontendOrigin = normalizeFrontendOrigin(
    process.env.STAGING_FRONTEND_ORIGIN || DEFAULT_FRONTEND_ORIGIN,
  );

  const users = getUsers();

  console.log("[staging-auth-smoke] API:", apiBaseUrl);
  console.log("[staging-auth-smoke] Frontend origin:", frontendOrigin);
  console.log("[staging-auth-smoke] Modo: read-only");

  logStep("Health checks públicos");

  const customRequestId = `staging-smoke-${Date.now()}`;

  const live = await expectStatus(
    apiBaseUrl,
    frontendOrigin,
    "GET",
    "/health/live",
    200,
    { requestId: customRequestId },
  );

  assertCors(live.headers, frontendOrigin);

  assert(
    live.headers.get("x-request-id") === customRequestId,
    "O backend não preservou o X-Request-Id enviado.",
    {
      expected: customRequestId,
      received: live.headers.get("x-request-id"),
    },
  );

  assert(
    !live.headers.get("x-powered-by"),
    "A resposta não devia expor X-Powered-By.",
  );

  assert(
    String(live.headers.get("x-content-type-options") || "").toLowerCase() ===
      "nosniff",
    "Header X-Content-Type-Options inválido.",
  );

  logOk("/health/live, request ID e security headers");

  const ready = await expectStatus(
    apiBaseUrl,
    frontendOrigin,
    "GET",
    "/health/ready",
    200,
  );

  assertCors(ready.headers, frontendOrigin);
  logOk("/health/ready");

  logStep("Preflight CORS");

  const preflight = await expectStatus(
    apiBaseUrl,
    frontendOrigin,
    "OPTIONS",
    "/auth/login",
    204,
    {
      headers: {
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type,x-request-id",
      },
    },
  );

  assertCors(preflight.headers, frontendOrigin);

  assert(
    String(preflight.headers.get("access-control-allow-methods") || "")
      .toUpperCase()
      .includes("POST"),
    "O preflight não autorizou POST.",
  );

  logOk("Preflight CORS");

  logStep("Sessão inexistente");

  const unauthenticatedMe = await expectStatus(
    apiBaseUrl,
    frontendOrigin,
    "GET",
    "/auth/me",
    401,
  );

  assertCors(unauthenticatedMe.headers, frontendOrigin);

  assert(
    unauthenticatedMe.headers.get("x-request-id"),
    "A resposta 401 não contém X-Request-Id.",
  );

  logOk("/auth/me bloqueado sem sessão");

  logStep("Origem não autorizada");

  const unauthorizedOrigin = await expectStatus(
    apiBaseUrl,
    frontendOrigin,
    "POST",
    "/auth/logout",
    403,
    {
      origin: "https://origem-nao-autorizada.example",
    },
  );

  assert(
    !unauthorizedOrigin.headers.get("access-control-allow-origin"),
    "Uma origem não autorizada não devia receber Access-Control-Allow-Origin.",
  );

  logOk("Origin guard bloqueou origem não autorizada");

  logStep("Login e validação das três roles");

  const sessions = {};

  for (const user of users) {
    const cookie = await login(apiBaseUrl, frontendOrigin, user);

    sessions[user.role] = cookie;

    await verifyCurrentUser(apiBaseUrl, frontendOrigin, user, cookie);
  }

  logStep("Permissões por role");

  await verifyRoleAccess(apiBaseUrl, frontendOrigin, sessions);

  logStep("Logout das três roles");

  for (const user of users) {
    await logout(
      apiBaseUrl,
      frontendOrigin,
      user.role,
      sessions[user.role],
    );
  }

  console.log("\n✅ STAGING AUTH SMOKE PASSOU");
  console.log({
    apiBaseUrl,
    frontendOrigin,
    roles: users.map((user) => user.role),
    mode: "read-only",
  });
}

main().catch((error) => {
  fail("Erro inesperado no staging auth smoke.", {
    name: error?.name,
    message: error?.message,
  });
});
