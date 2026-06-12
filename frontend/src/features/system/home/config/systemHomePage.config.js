// src/features/system/home/config/systemHomePage.config.js

const SYSTEM_ROUTES = Object.freeze({
  home: "/sistema",
  users: "/sistema/utilizadores",
  manutencao: "/sistema/manutencao",
  health: "/sistema/estado-servicos",
});

const FEATURED_ACTIONS = Object.freeze([
  Object.freeze({
    id: "users",
    eyebrow: "Gestão de acessos",
    title: "Utilizadores",
    description:
      "Cria, edita, ativa ou desativa contas com acesso à Santa Casa, Farmácia e Administração.",
    actionLabel: "Gerir utilizadores",
    to: SYSTEM_ROUTES.users,
    variant: "primary",
    tone: "green",
  }),

  Object.freeze({
    id: "manutencao",
    eyebrow: "Operações protegidas",
    title: "Manutenção",
    description:
      "Executa tarefas de manutenção com pré-visualização obrigatória, confirmação e controlo de risco.",
    actionLabel: "Abrir manutenção",
    to: SYSTEM_ROUTES.manutencao,
    variant: "secondary",
    tone: "gold",
  }),

  Object.freeze({
    id: "health",
    eyebrow: "Diagnóstico",
    title: "Estado da plataforma",
    description:
      "Confirma se os serviços principais da Santa Casa e da Farmácia estão a responder corretamente.",
    actionLabel: "Ver estado da plataforma",
    to: SYSTEM_ROUTES.health,
    variant: "secondary",
    tone: "blue",
  }),
]);

export const SYSTEM_HOME_PAGE = Object.freeze({
  header: Object.freeze({
    eyebrow: "Administração",
    title: "Gestão da plataforma",
    description:
      "Gere acessos, acompanha o estado da plataforma e executa operações protegidas da Farmácia Santa Casa.",
  }),

  featured: Object.freeze({
    ariaLabel: "Áreas principais da Administração",
    actions: FEATURED_ACTIONS,
  }),
});
