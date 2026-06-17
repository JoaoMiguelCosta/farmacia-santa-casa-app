export const SANTACASA_REGULARIZACOES_TABS = Object.freeze({
  pending: "pending",
  history: "history",
});

const REGULARIZACOES_VIEW_PARAM = "view";

const ALLOWED_REGULARIZACOES_VIEWS = new Set(
  Object.values(SANTACASA_REGULARIZACOES_TABS),
);

export function normalizeRegularizacoesView(view) {
  const normalizedView = String(view || SANTACASA_REGULARIZACOES_TABS.pending)
    .trim()
    .toLowerCase();

  if (!ALLOWED_REGULARIZACOES_VIEWS.has(normalizedView)) {
    return SANTACASA_REGULARIZACOES_TABS.pending;
  }

  return normalizedView;
}

export function getRegularizacoesViewFromSearchParams(searchParams) {
  const safeSearchParams =
    searchParams instanceof URLSearchParams
      ? searchParams
      : new URLSearchParams(searchParams);

  return normalizeRegularizacoesView(
    safeSearchParams.get(REGULARIZACOES_VIEW_PARAM),
  );
}

export function buildRegularizacoesViewSearchParams({
  currentSearchParams,
  view,
}) {
  const nextSearchParams = new URLSearchParams(currentSearchParams);

  const normalizedView = normalizeRegularizacoesView(view);

  if (normalizedView === SANTACASA_REGULARIZACOES_TABS.pending) {
    nextSearchParams.delete(REGULARIZACOES_VIEW_PARAM);

    return nextSearchParams;
  }

  nextSearchParams.set(REGULARIZACOES_VIEW_PARAM, normalizedView);

  return nextSearchParams;
}

export function buildRegularizacoesViewRoute(baseRoute, view) {
  const searchParams = buildRegularizacoesViewSearchParams({
    currentSearchParams: new URLSearchParams(),
    view,
  });

  const queryString = searchParams.toString();

  if (!queryString) {
    return baseRoute;
  }

  return `${baseRoute}?${queryString}`;
}
