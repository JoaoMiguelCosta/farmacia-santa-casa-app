const {
  USER_ROLES,
  parseListUsersQuery,
  parseCreateUserPayload,
  parseUpdateUserPayload,
  parseUpdatePasswordPayload,
  parseUpdateStatusPayload,
} = require("../../../src/modules/admin-users/adminUsers.validators");

describe("adminUsers.validators", () => {
  describe("USER_ROLES", () => {
    it("deve conter as roles suportadas", () => {
      expect(USER_ROLES).toEqual(["SANTACASA", "FARMACIA", "ADMIN"]);
    });
  });

  describe("parseListUsersQuery", () => {
    it("deve aplicar valores padrão", () => {
      const result = parseListUsersQuery({});

      expect(result).toEqual({
        search: null,
        role: null,
        isActive: undefined,
        skip: 0,
        take: 50,
      });
    });

    it("deve aceitar paginação por page e pageSize", () => {
      const result = parseListUsersQuery({
        page: "2",
        pageSize: "10",
      });

      expect(result.skip).toBe(10);
      expect(result.take).toBe(10);
    });

    it("deve dar prioridade a skip/take quando enviados", () => {
      const result = parseListUsersQuery({
        page: "5",
        pageSize: "10",
        skip: "20",
        take: "15",
      });

      expect(result.skip).toBe(20);
      expect(result.take).toBe(15);
    });

    it("deve normalizar skip negativo para 0", () => {
      const result = parseListUsersQuery({
        skip: "-10",
      });

      expect(result.skip).toBe(0);
    });

    it("deve limitar take ao máximo permitido", () => {
      const result = parseListUsersQuery({
        take: "999",
      });

      expect(result.take).toBe(100);
    });

    it("deve normalizar take menor que 1 para 1", () => {
      const result = parseListUsersQuery({
        take: "0",
      });

      expect(result.take).toBe(1);
    });

    it("deve rejeitar skip inválido", () => {
      expect(() => {
        parseListUsersQuery({
          skip: "abc",
        });
      }).toThrow("O parâmetro 'skip' deve ser um número válido.");
    });

    it("deve rejeitar page inválido", () => {
      expect(() => {
        parseListUsersQuery({
          page: "abc",
        });
      }).toThrow("O parâmetro 'page' deve ser um número válido.");
    });

    it("deve aceitar role válida", () => {
      const result = parseListUsersQuery({
        role: "admin",
      });

      expect(result.role).toBe("ADMIN");
    });

    it("deve converter role TODOS para null", () => {
      const result = parseListUsersQuery({
        role: "todos",
      });

      expect(result.role).toBeNull();
    });

    it("deve rejeitar role inválida", () => {
      expect(() => {
        parseListUsersQuery({
          role: "GESTOR",
        });
      }).toThrow("Role inválida.");
    });

    it("deve aceitar isActive true", () => {
      const result = parseListUsersQuery({
        isActive: "true",
      });

      expect(result.isActive).toBe(true);
    });

    it("deve aceitar isActive false", () => {
      const result = parseListUsersQuery({
        isActive: "false",
      });

      expect(result.isActive).toBe(false);
    });

    it("deve converter isActive todos para undefined", () => {
      const result = parseListUsersQuery({
        isActive: "todos",
      });

      expect(result.isActive).toBeUndefined();
    });

    it("deve rejeitar isActive inválido", () => {
      expect(() => {
        parseListUsersQuery({
          isActive: "talvez",
        });
      }).toThrow("O filtro 'isActive' deve ser booleano.");
    });

    it("deve limpar search", () => {
      const result = parseListUsersQuery({
        search: " João ",
      });

      expect(result.search).toBe("João");
    });

    it("deve devolver search null quando vazio", () => {
      const result = parseListUsersQuery({
        search: "   ",
      });

      expect(result.search).toBeNull();
    });

    it("deve rejeitar search demasiado longo", () => {
      expect(() => {
        parseListUsersQuery({
          search: "a".repeat(161),
        });
      }).toThrow("O parâmetro 'search' não pode exceder 160 caracteres.");
    });
  });

  describe("parseCreateUserPayload", () => {
    it("deve aceitar payload válido", () => {
      const result = parseCreateUserPayload({
        name: "João Costa",
        email: "joao@example.com",
        password: "Password123",
        role: "ADMIN",
      });

      expect(result).toEqual({
        name: "João Costa",
        email: "joao@example.com",
        password: "Password123",
        role: "ADMIN",
      });
    });

    it("deve limpar name e normalizar email/role", () => {
      const result = parseCreateUserPayload({
        name: " João Costa ",
        email: " JOAO@EXAMPLE.COM ",
        password: "Password123",
        role: " farmacia ",
      });

      expect(result).toEqual({
        name: "João Costa",
        email: "joao@example.com",
        password: "Password123",
        role: "FARMACIA",
      });
    });

    it("deve rejeitar nome vazio", () => {
      expect(() => {
        parseCreateUserPayload({
          name: "",
          email: "joao@example.com",
          password: "Password123",
          role: "ADMIN",
        });
      }).toThrow("Nome obrigatório.");
    });

    it("deve rejeitar email vazio", () => {
      expect(() => {
        parseCreateUserPayload({
          name: "João Costa",
          email: "",
          password: "Password123",
          role: "ADMIN",
        });
      }).toThrow("Email obrigatório.");
    });

    it("deve rejeitar email inválido", () => {
      expect(() => {
        parseCreateUserPayload({
          name: "João Costa",
          email: "email-invalido",
          password: "Password123",
          role: "ADMIN",
        });
      }).toThrow("Email inválido.");
    });

    it("deve rejeitar password vazia", () => {
      expect(() => {
        parseCreateUserPayload({
          name: "João Costa",
          email: "joao@example.com",
          password: "",
          role: "ADMIN",
        });
      }).toThrow("Password obrigatória.");
    });

    it("deve rejeitar password com menos de 8 caracteres", () => {
      expect(() => {
        parseCreateUserPayload({
          name: "João Costa",
          email: "joao@example.com",
          password: "1234567",
          role: "ADMIN",
        });
      }).toThrow("A password deve ter pelo menos 8 caracteres.");
    });

    it("deve rejeitar role inválida", () => {
      expect(() => {
        parseCreateUserPayload({
          name: "João Costa",
          email: "joao@example.com",
          password: "Password123",
          role: "GESTOR",
        });
      }).toThrow("Role inválida.");
    });
  });

  describe("parseUpdateUserPayload", () => {
    it("deve aceitar payload válido", () => {
      const result = parseUpdateUserPayload({
        name: "João Costa",
        email: "joao@example.com",
        role: "SANTACASA",
      });

      expect(result).toEqual({
        name: "João Costa",
        email: "joao@example.com",
        role: "SANTACASA",
      });
    });

    it("deve limpar name e normalizar email/role", () => {
      const result = parseUpdateUserPayload({
        name: " João Costa ",
        email: " JOAO@EXAMPLE.COM ",
        role: " farmacia ",
      });

      expect(result).toEqual({
        name: "João Costa",
        email: "joao@example.com",
        role: "FARMACIA",
      });
    });

    it("deve rejeitar nome vazio", () => {
      expect(() => {
        parseUpdateUserPayload({
          name: "",
          email: "joao@example.com",
          role: "ADMIN",
        });
      }).toThrow("Nome obrigatório.");
    });

    it("deve rejeitar email inválido", () => {
      expect(() => {
        parseUpdateUserPayload({
          name: "João Costa",
          email: "email-invalido",
          role: "ADMIN",
        });
      }).toThrow("Email inválido.");
    });

    it("deve rejeitar role inválida", () => {
      expect(() => {
        parseUpdateUserPayload({
          name: "João Costa",
          email: "joao@example.com",
          role: "GESTOR",
        });
      }).toThrow("Role inválida.");
    });
  });

  describe("parseUpdatePasswordPayload", () => {
    it("deve aceitar password válida", () => {
      const result = parseUpdatePasswordPayload({
        password: "Password123",
      });

      expect(result).toEqual({
        password: "Password123",
      });
    });

    it("deve rejeitar password vazia", () => {
      expect(() => {
        parseUpdatePasswordPayload({
          password: "",
        });
      }).toThrow("Password obrigatória.");
    });

    it("deve rejeitar password com menos de 8 caracteres", () => {
      expect(() => {
        parseUpdatePasswordPayload({
          password: "1234567",
        });
      }).toThrow("A password deve ter pelo menos 8 caracteres.");
    });
  });

  describe("parseUpdateStatusPayload", () => {
    it("deve aceitar isActive true", () => {
      const result = parseUpdateStatusPayload({
        isActive: true,
      });

      expect(result).toEqual({
        isActive: true,
      });
    });

    it("deve aceitar isActive false", () => {
      const result = parseUpdateStatusPayload({
        isActive: false,
      });

      expect(result).toEqual({
        isActive: false,
      });
    });

    it("deve rejeitar isActive em string", () => {
      expect(() => {
        parseUpdateStatusPayload({
          isActive: "true",
        });
      }).toThrow("O campo 'isActive' deve ser booleano.");
    });

    it("deve rejeitar isActive em falta", () => {
      expect(() => {
        parseUpdateStatusPayload({});
      }).toThrow("O campo 'isActive' deve ser booleano.");
    });
  });
});
