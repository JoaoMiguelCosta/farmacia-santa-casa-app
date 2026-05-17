const DEFAULT_QUERY = Object.freeze({
  status: "TODOS",
  search: "",
  from: "",
  to: "",
  skip: 0,
  take: 50,
});

export function buildFarmaciaHistoricoQuery({
  status = DEFAULT_QUERY.status,
  search = DEFAULT_QUERY.search,
  from = DEFAULT_QUERY.from,
  to = DEFAULT_QUERY.to,
  skip = DEFAULT_QUERY.skip,
  take = DEFAULT_QUERY.take,
} = {}) {
  return {
    status: String(status || DEFAULT_QUERY.status)
      .trim()
      .toUpperCase(),
    search: String(search || "").trim(),
    from: String(from || "").trim(),
    to: String(to || "").trim(),
    skip,
    take,
  };
}
