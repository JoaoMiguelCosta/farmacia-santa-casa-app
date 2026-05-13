import AreaLanding from "../../shared/layouts/AreaLanding/AreaLanding.jsx";

const ACTIONS = [
  {
    title: "Pedidos Pendentes",
    description: "Consultar pedidos enviados pela Santa Casa.",
  },
  {
    title: "Validação",
    description: "Validar pedidos e aplicar os efeitos nas quantidades.",
  },
  {
    title: "Rejeição",
    description: "Rejeitar pedidos com motivo registado.",
  },
  {
    title: "Regularizações",
    description: "Acompanhar Extras regularizados por receitas futuras.",
  },
  {
    title: "Dashboard",
    description: "Ver sinais operacionais e totais relevantes.",
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
      description="Pedidos pendentes, validações, rejeições, regularizações, histórico e sinais operacionais."
      tone="blue"
      actions={ACTIONS}
    />
  );
}
