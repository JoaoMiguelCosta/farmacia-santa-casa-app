// src/shared/utils/pagination.js
function parsePagination(query = {}, options = {}) {
  const defaultPage = options.defaultPage || 1;
  const defaultPageSize = options.defaultPageSize || 20;
  const maxPageSize = options.maxPageSize || 100;

  const page = Math.max(1, Number(query.page || defaultPage));

  const requestedPageSize = Number(
    query.pageSize || query.take || defaultPageSize,
  );

  const pageSize = Math.min(
    Math.max(
      1,
      Number.isFinite(requestedPageSize) ? requestedPageSize : defaultPageSize,
    ),
    maxPageSize,
  );

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}

function buildPaginationMeta({ page, pageSize, total }) {
  return {
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

module.exports = {
  parsePagination,
  buildPaginationMeta,
};
