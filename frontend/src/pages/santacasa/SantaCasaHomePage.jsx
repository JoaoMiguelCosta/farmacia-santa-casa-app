import AreaLanding from "../../shared/layouts/AreaLanding/AreaLanding.jsx";

const SANTACASA_DASHBOARD_PATH = "/santacasa/dashboard";
const SANTACASA_UTENTES_PATH = "/santacasa/utentes";
const SANTACASA_OPERACAO_PATH = "/santacasa/operacao";
const SANTACASA_PEDIDOS_PATH = "/santacasa/pedidos";
const SANTACASA_REGULARIZACOES_PATH = "/santacasa/regularizacoes";
const SANTACASA_HISTORICO_PATH = "/santacasa/historico";

const ACTIONS = [
  {
    title: "Dashboard",
    description: "Ver sinais operacionais e totais relevantes.",
    to: SANTACASA_DASHBOARD_PATH,
  },
  {
    title: "Utentes",
    description: "Criar, consultar e gerir utentes ativos.",
    to: SANTACASA_UTENTES_PATH,
  },
  {
    title: "Operação",
    description:
      "Gerir receitas, medicamentos não sujeitos a receita médica, vendas suspensas e preparação de pedidos.",
    to: SANTACASA_OPERACAO_PATH,
  },
  {
    title: "Pedidos",
    description: "Criar pedidos para enviar à Farmácia.",
    to: SANTACASA_PEDIDOS_PATH,
  },
  {
    title: "Regularizações",
    description:
      "Acompanhar vendas suspensas que aguardam receita futura ou já foram regularizadas.",
    to: SANTACASA_REGULARIZACOES_PATH,
  },
  {
    title: "Histórico",
    description: "Consultar pedidos validados ou rejeitados pela Farmácia.",
    to: SANTACASA_HISTORICO_PATH,
  },
];

export default function SantaCasaHomePage() {
  return (
    <AreaLanding
      eyebrow="Área Santa Casa"
      title="Gestão assistencial com controlo de pedidos."
      description="Dashboard, utentes, operação diária, pedidos, regularizações e histórico num fluxo único e rastreável."
      tone="green"
      actions={ACTIONS}
    />
  );
}
