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
      "Cria, edita, ativa ou desativa contas da Santa Casa, Farmácia e Administração.",
    actionLabel: "Gerir utilizadores",
    to: SYSTEM_ROUTES.users,
    variant: "primary",
    tone: "green",
  }),

  Object.freeze({
    id: "manutencao",
    eyebrow: "Operações técnicas",
    title: "Manutenção",
    description:
      "Executa jobs técnicos com pré-visualização obrigatória, confirmação e controlo de risco.",
    actionLabel: "Abrir manutenção",
    to: SYSTEM_ROUTES.manutencao,
    variant: "secondary",
    tone: "gold",
  }),

  Object.freeze({
    id: "health",
    eyebrow: "Diagnóstico",
    title: "Estado dos serviços",
    description:
      "Confirma se a API Geral, Santa Casa e Farmácia estão a responder corretamente.",
    actionLabel: "Ver estado dos serviços",
    to: SYSTEM_ROUTES.health,
    variant: "secondary",
    tone: "blue",
  }),
]);

export const SYSTEM_HOME_PAGE = Object.freeze({
  header: Object.freeze({
    eyebrow: "Sistema",
    title: "Gestão técnica e administrativa",
    description:
      "Controla acessos, acompanha o estado dos serviços e executa operações técnicas protegidas.",
  }),

  featured: Object.freeze({
    ariaLabel: "Áreas principais do Sistema",
    actions: FEATURED_ACTIONS,
  }),
});
