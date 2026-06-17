const SYSTEM_BASE_PATH = "sistema";

export const SYSTEM_ROUTER_PATHS = Object.freeze({
  home: SYSTEM_BASE_PATH,
  utilizadores: `${SYSTEM_BASE_PATH}/utilizadores`,
  manutencao: `${SYSTEM_BASE_PATH}/manutencao`,
  estadoServicos: `${SYSTEM_BASE_PATH}/estado-servicos`,

  legacyUsers: `${SYSTEM_BASE_PATH}/users`,
  legacyHealth: `${SYSTEM_BASE_PATH}/health`,
});

export const SYSTEM_ROUTES = Object.freeze(
  Object.fromEntries(
    Object.entries(SYSTEM_ROUTER_PATHS).map(([key, path]) => [key, `/${path}`]),
  ),
);
