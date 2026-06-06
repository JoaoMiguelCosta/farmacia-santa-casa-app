const SANTACASA_BASE_PATH = "santacasa";

export const SANTACASA_ROUTER_PATHS = Object.freeze({
  home: SANTACASA_BASE_PATH,
  dashboard: `${SANTACASA_BASE_PATH}/dashboard`,
  utentes: `${SANTACASA_BASE_PATH}/utentes`,
  operacao: `${SANTACASA_BASE_PATH}/operacao`,
  pedidos: `${SANTACASA_BASE_PATH}/pedidos`,
  regularizacoes: `${SANTACASA_BASE_PATH}/regularizacoes`,
  historico: `${SANTACASA_BASE_PATH}/historico`,

  legacyReceitas: `${SANTACASA_BASE_PATH}/receitas`,
  legacySemReceita: `${SANTACASA_BASE_PATH}/sem-receita`,
  legacyExtras: `${SANTACASA_BASE_PATH}/extras`,
});

export const SANTACASA_ROUTES = Object.freeze(
  Object.fromEntries(
    Object.entries(SANTACASA_ROUTER_PATHS).map(([key, path]) => [
      key,
      `/${path}`,
    ]),
  ),
);
