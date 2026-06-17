const {
  getStartOfDay,
  isDateBeforeToday,
} = require("../../../src/shared/utils/date");

describe("shared/utils/date", () => {
  it("deve devolver o início do dia da data recebida", () => {
    const result = getStartOfDay(new Date("2026-06-10T23:59:59.999"));

    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(5);
    expect(result.getDate()).toBe(10);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });

  it("deve considerar válida uma data igual ao dia atual", () => {
    const now = new Date(2026, 5, 10, 23, 59, 59, 999);
    const validade = new Date(2026, 5, 10, 0, 0, 0, 0);

    expect(isDateBeforeToday(validade, now)).toBe(false);
  });

  it("deve considerar expirada uma data anterior ao dia atual", () => {
    const now = new Date(2026, 5, 11, 0, 0, 0, 0);
    const validade = new Date(2026, 5, 10, 0, 0, 0, 0);

    expect(isDateBeforeToday(validade, now)).toBe(true);
  });

  it("deve devolver false para datas inválidas", () => {
    expect(isDateBeforeToday("data-invalida")).toBe(false);
  });
});
