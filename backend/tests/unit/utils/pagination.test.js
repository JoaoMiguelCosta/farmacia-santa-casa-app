const {
  parsePagination,
  buildPaginationMeta,
} = require("../../../src/shared/utils/pagination");

describe("pagination utils", () => {
  describe("parsePagination", () => {
    it("deve aplicar valores padrão", () => {
      const result = parsePagination({});

      expect(result).toEqual({
        page: 1,
        pageSize: 20,
        skip: 0,
        take: 20,
      });
    });

    it("deve aceitar page e pageSize válidos", () => {
      const result = parsePagination({
        page: "3",
        pageSize: "10",
      });

      expect(result).toEqual({
        page: 3,
        pageSize: 10,
        skip: 20,
        take: 10,
      });
    });

    it("deve aceitar take como alias de pageSize", () => {
      const result = parsePagination({
        page: "2",
        take: "15",
      });

      expect(result).toEqual({
        page: 2,
        pageSize: 15,
        skip: 15,
        take: 15,
      });
    });

    it("deve dar prioridade a pageSize sobre take", () => {
      const result = parsePagination({
        page: "2",
        pageSize: "10",
        take: "50",
      });

      expect(result).toEqual({
        page: 2,
        pageSize: 10,
        skip: 10,
        take: 10,
      });
    });

    it("deve normalizar page menor que 1 para 1", () => {
      const result = parsePagination({
        page: "0",
        pageSize: "10",
      });

      expect(result.page).toBe(1);
      expect(result.skip).toBe(0);
    });

    it("deve normalizar page negativa para 1", () => {
      const result = parsePagination({
        page: "-5",
        pageSize: "10",
      });

      expect(result.page).toBe(1);
      expect(result.skip).toBe(0);
    });

    it("deve normalizar pageSize menor que 1 para 1", () => {
      const result = parsePagination({
        page: "1",
        pageSize: "0",
      });

      expect(result.pageSize).toBe(1);
      expect(result.take).toBe(1);
      expect(result.skip).toBe(0);
    });

    it("deve limitar pageSize ao máximo padrão", () => {
      const result = parsePagination({
        page: "1",
        pageSize: "999",
      });

      expect(result.pageSize).toBe(100);
      expect(result.take).toBe(100);
    });

    it("deve usar defaultPage definido nas opções", () => {
      const result = parsePagination(
        {},
        {
          defaultPage: 2,
        },
      );

      expect(result.page).toBe(2);
      expect(result.skip).toBe(20);
    });

    it("deve usar defaultPageSize definido nas opções", () => {
      const result = parsePagination(
        {},
        {
          defaultPageSize: 50,
        },
      );

      expect(result.pageSize).toBe(50);
      expect(result.take).toBe(50);
      expect(result.skip).toBe(0);
    });

    it("deve usar maxPageSize definido nas opções", () => {
      const result = parsePagination(
        {
          pageSize: "500",
        },
        {
          maxPageSize: 75,
        },
      );

      expect(result.pageSize).toBe(75);
      expect(result.take).toBe(75);
    });

    it("deve usar defaultPageSize quando pageSize é inválido", () => {
      const result = parsePagination({
        pageSize: "abc",
      });

      expect(result.pageSize).toBe(20);
      expect(result.take).toBe(20);
    });

    it("deve calcular skip corretamente", () => {
      const result = parsePagination({
        page: "5",
        pageSize: "25",
      });

      expect(result.skip).toBe(100);
      expect(result.take).toBe(25);
    });
  });

  describe("buildPaginationMeta", () => {
    it("deve construir meta de paginação", () => {
      const result = buildPaginationMeta({
        page: 2,
        pageSize: 10,
        total: 35,
      });

      expect(result).toEqual({
        page: 2,
        pageSize: 10,
        total: 35,
        totalPages: 4,
      });
    });

    it("deve devolver pelo menos 1 página quando total é 0", () => {
      const result = buildPaginationMeta({
        page: 1,
        pageSize: 10,
        total: 0,
      });

      expect(result).toEqual({
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 1,
      });
    });

    it("deve calcular totalPages com arredondamento para cima", () => {
      const result = buildPaginationMeta({
        page: 1,
        pageSize: 20,
        total: 41,
      });

      expect(result.totalPages).toBe(3);
    });

    it("deve calcular totalPages exato quando total divide por pageSize", () => {
      const result = buildPaginationMeta({
        page: 1,
        pageSize: 20,
        total: 40,
      });

      expect(result.totalPages).toBe(2);
    });
  });
});
