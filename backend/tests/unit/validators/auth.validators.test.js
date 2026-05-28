const {
  parseLoginPayload,
} = require("../../../src/modules/auth/auth.validators");

describe("auth.validators", () => {
  describe("parseLoginPayload", () => {
    it("deve aceitar login válido", () => {
      const result = parseLoginPayload({
        email: "admin@sistema.local",
        password: "Admin123!",
      });

      expect(result).toEqual({
        email: "admin@sistema.local",
        password: "Admin123!",
      });
    });

    it("deve normalizar email para lowercase", () => {
      const result = parseLoginPayload({
        email: " ADMIN@SISTEMA.LOCAL ",
        password: "Admin123!",
      });

      expect(result).toEqual({
        email: "admin@sistema.local",
        password: "Admin123!",
      });
    });

    it("deve manter a password como string", () => {
      const result = parseLoginPayload({
        email: "admin@sistema.local",
        password: 12345678,
      });

      expect(result).toEqual({
        email: "admin@sistema.local",
        password: "12345678",
      });
    });

    it("deve rejeitar email vazio", () => {
      expect(() => {
        parseLoginPayload({
          email: "",
          password: "Admin123!",
        });
      }).toThrow("Email obrigatório.");
    });

    it("deve rejeitar email só com espaços", () => {
      expect(() => {
        parseLoginPayload({
          email: "   ",
          password: "Admin123!",
        });
      }).toThrow("Email obrigatório.");
    });

    it("deve rejeitar email inválido", () => {
      expect(() => {
        parseLoginPayload({
          email: "admin-sistema-local",
          password: "Admin123!",
        });
      }).toThrow("Email inválido.");
    });

    it("deve rejeitar password vazia", () => {
      expect(() => {
        parseLoginPayload({
          email: "admin@sistema.local",
          password: "",
        });
      }).toThrow("Password obrigatória.");
    });

    it("deve rejeitar password em falta", () => {
      expect(() => {
        parseLoginPayload({
          email: "admin@sistema.local",
        });
      }).toThrow("Password obrigatória.");
    });

    it("deve aceitar campos extra sem os devolver", () => {
      const result = parseLoginPayload({
        email: "admin@sistema.local",
        password: "Admin123!",
        role: "ADMIN",
      });

      expect(result).toEqual({
        email: "admin@sistema.local",
        password: "Admin123!",
      });
    });
  });
});
