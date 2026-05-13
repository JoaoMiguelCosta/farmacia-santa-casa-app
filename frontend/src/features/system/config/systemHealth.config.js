export const SYSTEM_HEALTH_CHECKS = Object.freeze([
  {
    key: "api",
    title: "API Geral",
    description: "Estado principal do backend.",
    endpointKey: "health",
  },
  {
    key: "santacasa",
    title: "Santa Casa",
    description: "Rotas operacionais da Santa Casa.",
    endpointKey: "santacasaHealth",
  },
  {
    key: "farmacia",
    title: "Farmácia",
    description: "Rotas operacionais da Farmácia.",
    endpointKey: "farmaciaHealth",
  },
]);
