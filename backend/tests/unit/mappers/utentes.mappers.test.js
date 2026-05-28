const { toUtenteDTO } = require("../../../src/modules/utentes/utentes.mappers");

describe("utentes.mappers", () => {
  describe("toUtenteDTO", () => {
    it("deve devolver null quando utente é null", () => {
      expect(toUtenteDTO(null)).toBeNull();
    });

    it("deve mapear utente ativo", () => {
      const utente = {
        id: "utente-1",
        numero9: "123456789",
        nome: "João Costa",

        status: "ATIVO",
        archivedAt: null,
        archivedReason: null,
        archivedById: null,
        archivedBy: null,

        isValid: true,
        invalidReason: null,
        deletedAt: null,

        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
      };

      const result = toUtenteDTO(utente);

      expect(result).toEqual({
        id: "utente-1",
        numero9: "123456789",
        nome: "João Costa",

        status: "ATIVO",
        isArchived: false,

        archivedAt: null,
        archivedReason: null,
        archivedById: null,
        archivedBy: null,

        isValid: true,
        invalidReason: null,
        deletedAt: null,

        createdAt: utente.createdAt,
        updatedAt: utente.updatedAt,
      });
    });

    it("deve mapear utente arquivado", () => {
      const archivedAt = new Date("2026-02-01T10:00:00.000Z");

      const utente = {
        id: "utente-1",
        numero9: "123456789",
        nome: "João Costa",

        status: "ARQUIVADO",
        archivedAt,
        archivedReason: "Utente deixou de estar abrangido.",
        archivedById: "user-1",
        archivedBy: null,

        isValid: true,
        invalidReason: null,
        deletedAt: null,

        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
      };

      const result = toUtenteDTO(utente);

      expect(result.status).toBe("ARQUIVADO");
      expect(result.isArchived).toBe(true);
      expect(result.archivedAt).toBe(archivedAt);
      expect(result.archivedReason).toBe("Utente deixou de estar abrangido.");
      expect(result.archivedById).toBe("user-1");
    });

    it("deve mapear utilizador que arquivou o utente", () => {
      const utente = {
        id: "utente-1",
        numero9: "123456789",
        nome: "João Costa",

        status: "ARQUIVADO",
        archivedAt: new Date("2026-02-01T10:00:00.000Z"),
        archivedReason: "Arquivo por teste.",
        archivedById: "user-1",
        archivedBy: {
          id: "user-1",
          name: "Admin",
          email: "admin@sistema.local",
          role: "ADMIN",
        },

        isValid: true,
        invalidReason: null,
        deletedAt: null,

        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
      };

      const result = toUtenteDTO(utente);

      expect(result.archivedBy).toEqual({
        id: "user-1",
        name: "Admin",
        email: "admin@sistema.local",
        role: "ADMIN",
      });
    });

    it("deve mapear utente removido logicamente", () => {
      const deletedAt = new Date("2026-03-01T10:00:00.000Z");

      const utente = {
        id: "utente-1",
        numero9: "123456789",
        nome: "João Costa",

        status: "ATIVO",
        archivedAt: null,
        archivedReason: null,
        archivedById: null,
        archivedBy: null,

        isValid: false,
        invalidReason: "Removido sem dados associados.",
        deletedAt,

        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
      };

      const result = toUtenteDTO(utente);

      expect(result.isValid).toBe(false);
      expect(result.invalidReason).toBe("Removido sem dados associados.");
      expect(result.deletedAt).toBe(deletedAt);
    });

    it("deve devolver archivedBy null quando archivedBy não existe", () => {
      const utente = {
        id: "utente-1",
        numero9: "123456789",
        nome: "João Costa",

        status: "ARQUIVADO",
        archivedAt: new Date("2026-02-01T10:00:00.000Z"),
        archivedReason: "Arquivo por teste.",
        archivedById: null,
        archivedBy: null,

        isValid: true,
        invalidReason: null,
        deletedAt: null,

        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
      };

      const result = toUtenteDTO(utente);

      expect(result.archivedBy).toBeNull();
    });

    it("deve manter campos opcionais como undefined quando não existem no objeto", () => {
      const utente = {
        id: "utente-1",
        numero9: "123456789",
        nome: "João Costa",
        status: "ATIVO",
      };

      const result = toUtenteDTO(utente);

      expect(result).toEqual({
        id: "utente-1",
        numero9: "123456789",
        nome: "João Costa",

        status: "ATIVO",
        isArchived: false,

        archivedAt: undefined,
        archivedReason: undefined,
        archivedById: undefined,
        archivedBy: null,

        isValid: undefined,
        invalidReason: undefined,
        deletedAt: undefined,

        createdAt: undefined,
        updatedAt: undefined,
      });
    });
  });
});
