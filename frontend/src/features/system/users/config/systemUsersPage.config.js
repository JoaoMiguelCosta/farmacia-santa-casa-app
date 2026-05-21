// src/features/system/users/config/systemUsersPage.config.js
export const SYSTEM_USERS_ROLES = Object.freeze({
  SANTACASA: "SANTACASA",
  FARMACIA: "FARMACIA",
  ADMIN: "ADMIN",
});

export const SYSTEM_USERS_PAGE = Object.freeze({
  header: {
    eyebrow: "Sistema/Admin",
    title: "Utilizadores",
    description:
      "Gestão de acessos ao sistema. Cria, edita, ativa ou desativa contas da Santa Casa, Farmácia e Administração.",
  },

  sections: {
    filters: {
      title: "Filtros",
      description: "Pesquisa utilizadores por nome, email, role ou estado.",
    },

    list: {
      title: "Contas de utilizador",
      description:
        "Utilizadores com acesso ao sistema interno da Farmácia Santa Casa.",
      loadingTitle: "A carregar utilizadores...",
      errorTitle: "Não foi possível carregar os utilizadores.",
      emptyTitle: "Sem utilizadores encontrados.",
      emptyDescription:
        "Ajusta os filtros ou cria uma nova conta de utilizador.",
    },

    form: {
      createTitle: "Criar utilizador",
      editTitle: "Editar utilizador",
      passwordTitle: "Alterar password",
    },
  },

  roles: {
    SANTACASA: "Santa Casa",
    FARMACIA: "Farmácia",
    ADMIN: "Sistema/Admin",
  },

  status: {
    active: "Ativo",
    inactive: "Inativo",
  },

  filters: {
    search: {
      label: "Pesquisa",
      placeholder: "Nome ou email",
    },

    role: {
      label: "Perfil",
      all: "Todos",
    },

    isActive: {
      label: "Estado",
      all: "Todos",
      active: "Ativos",
      inactive: "Inativos",
    },
  },

  fields: {
    name: {
      label: "Nome",
      placeholder: "Nome do utilizador",
    },

    email: {
      label: "Email",
      placeholder: "email@sistema.local",
    },

    role: {
      label: "Perfil",
    },

    password: {
      label: "Password",
      placeholder: "Mínimo 8 caracteres",
    },
  },

  actions: {
    refresh: "Atualizar",
    refreshing: "A atualizar...",

    create: "Criar utilizador",
    creating: "A criar...",

    edit: "Editar",
    save: "Guardar alterações",
    saving: "A guardar...",

    changePassword: "Alterar password",
    changingPassword: "A alterar...",

    activate: "Ativar",
    deactivate: "Desativar",

    remove: "Remover",
    removing: "A remover...",

    previous: "Anterior",
    next: "Seguinte",

    cancel: "Cancelar",
    clear: "Limpar",
    close: "Fechar",
  },
  feedback: {
    genericError: "Ocorreu um erro inesperado.",
    createSuccess: "Utilizador criado com sucesso.",
    updateSuccess: "Utilizador atualizado com sucesso.",
    passwordSuccess: "Password alterada com sucesso.",
    statusSuccess: "Estado do utilizador atualizado com sucesso.",
    deleteSuccess: "Utilizador removido com sucesso.",
    deleteActiveBlocked: "Só podes remover utilizadores desativados.",
    selfDeactivateBlocked: "Não podes desativar a tua própria conta.",
    selfDeleteBlocked: "Não podes remover a tua própria conta.",
    missingRequiredFields: "Preenche todos os campos obrigatórios.",
  },
});
