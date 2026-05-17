import AreaLanding from "../../shared/layouts/AreaLanding/AreaLanding.jsx";

const FARMACIA_DASHBOARD_PATH = "/farmacia/dashboard";
const FARMACIA_PEDIDOS_PATH = "/farmacia/pedidos";
const FARMACIA_HISTORICO_PATH = "/farmacia/historico";
const FARMACIA_REGULARIZACOES_PATH = "/farmacia/regularizacoes";

const ACTIONS = [
  {
    title: "Pedidos Pendentes",
    description:
      "Consultar, validar ou rejeitar pedidos enviados pela Santa Casa.",
    to: FARMACIA_PEDIDOS_PATH,
  },
  {
    title: "Histórico",
    description: "Consultar pedidos validados ou rejeitados.",
    to: FARMACIA_HISTORICO_PATH,
  },
  {
    title: "Regularizações",
    description: "Acompanhar Extras regularizados por receitas futuras.",
    to: FARMACIA_REGULARIZACOES_PATH,
  },
  {
    title: "Dashboard",
    description: "Ver sinais operacionais e totais relevantes.",
    to: FARMACIA_DASHBOARD_PATH,
  },
  {
    title: "Manutenção",
    description: "Aceder a previews e execução controlada de jobs.",
  },
];

export default function FarmaciaHomePage() {
  return (
    <AreaLanding
      eyebrow="Área Farmácia"
      title="Controlo farmacêutico com rastreabilidade."
      description="Dashboard, pedidos pendentes, histórico, regularizações, manutenção e sinais operacionais."
      tone="blue"
      actions={ACTIONS}
    />
  );
}
