// src/features/system/users/config/systemUsersPage.config.js

export const SYSTEM_USERS_ROLES = Object.freeze({
  SANTACASA: "SANTACASA",
  FARMACIA: "FARMACIA",
  ADMIN: "ADMIN",
});

export const SYSTEM_USERS_PAGE = Object.freeze({
  header: {
    eyebrow: "Administração",
    title: "Gestão de acessos",
    description:
      "Cria e gere contas com acesso à Santa Casa, Farmácia e área administrativa.",
  },

  sections: {
    filters: {
      title: "Filtros",
      description: "Pesquisa contas por nome, email, perfil ou estado.",
    },

    list: {
      title: "Contas de utilizador",
      description:
        "Pessoas com acesso autorizado às áreas da Farmácia Santa Casa.",
      loadingTitle: "A carregar utilizadores...",
      loadingDescription: "Aguarda enquanto os utilizadores são carregados.",
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
    ADMIN: "Administrador",
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

  labels: {
    profile: "Perfil",
    createdAt: "Criado em",
    updatedAt: "Atualizado em",
    isCurrentUser: "Conta atual",
    yes: "Sim",
    no: "Não",
    total: "Total",
  },

  pagination: {
    ariaLabel: "Paginação de utilizadores do sistema",
    noResults: "Sem resultados.",
    getPaginationLabel({ start, end, total, currentPage, totalPages }) {
      return `A mostrar ${start}-${end} de ${total} utilizador(es). Página ${currentPage} de ${totalPages}.`;
    },
  },

  confirm: {
    status: {
      eyebrow: "Confirmação necessária",
      getTitleLabel(action) {
        return `${action} utilizador?`;
      },
      inactivateDescription:
        "Esta conta ficará inativa e deixará de conseguir iniciar sessão no sistema.",
      activateDescription:
        "Esta conta voltará a ficar ativa e poderá iniciar sessão no sistema.",
    },
    delete: {
      eyebrow: "Remoção segura",
      title: "Remover utilizador?",
      description:
        "Esta ação só será permitida se a conta estiver desativada e não tiver histórico associado. Caso tenha histórico de validações ou rejeições, o sistema vai bloquear a remoção.",
    },
    fields: {
      name: "Nome",
      email: "Email",
      status: "Estado atual",
    },
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
