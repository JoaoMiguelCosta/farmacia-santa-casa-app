const {
  cleanId,
  normalizeText,
} = require("../../../src/shared/utils/normalize");

describe("normalize utils", () => {
  describe("cleanId", () => {
    it("deve converter valor para string e remover espaços", () => {
      const result = cleanId("  abc-123  ");

      expect(result).toBe("abc-123");
    });

    it("deve converter número para string", () => {
      const result = cleanId(123);

      expect(result).toBe("123");
    });

    it("deve devolver string vazia quando valor é null", () => {
      const result = cleanId(null);

      expect(result).toBe("");
    });

    it("deve devolver string vazia quando valor é undefined", () => {
      const result = cleanId(undefined);

      expect(result).toBe("");
    });

    it("deve devolver string vazia quando valor é vazio", () => {
      const result = cleanId("");

      expect(result).toBe("");
    });
  });

  describe("normalizeText", () => {
    it("deve converter texto para lowercase", () => {
      const result = normalizeText("PARACETAMOL");

      expect(result).toBe("paracetamol");
    });

    it("deve remover espaços no início e fim", () => {
      const result = normalizeText("  Paracetamol  ");

      expect(result).toBe("paracetamol");
    });

    it("deve remover acentos", () => {
      const result = normalizeText("Ácido Fólico");

      expect(result).toBe("acido folico");
    });

    it("deve manter hífen e números", () => {
      const result = normalizeText("Ben-u-ron 1000mg");

      expect(result).toBe("ben-u-ron 1000mg");
    });

    it("deve devolver string vazia quando valor é null", () => {
      const result = normalizeText(null);

      expect(result).toBe("");
    });

    it("deve devolver string vazia quando valor é undefined", () => {
      const result = normalizeText(undefined);

      expect(result).toBe("");
    });

    it("deve converter número para string", () => {
      const result = normalizeText(123);

      expect(result).toBe("123");
    });

    it("deve normalizar texto misto", () => {
      const result = normalizeText("  ÁCIDO FÓLICO 5mg  ");

      expect(result).toBe("acido folico 5mg");
    });
  });
});
