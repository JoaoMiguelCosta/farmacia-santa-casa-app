import AreaLanding from "../../shared/layouts/AreaLanding/AreaLanding.jsx";

const ACTIONS = [
  {
    title: "Utentes",
    description: "Criar, consultar e gerir utentes ativos.",
  },
  {
    title: "Receitas",
    description: "Adicionar receitas e controlar linhas disponíveis.",
  },
  {
    title: "Sem Receita",
    description: "Registar medicamentos disponíveis sem receita.",
  },
  {
    title: "Extras",
    description: "Gerir vendas suspensas e saldos por regularizar.",
  },
  {
    title: "Criar Pedido",
    description: "Enviar pedidos para validação da Farmácia.",
  },
  {
    title: "Histórico",
    description: "Consultar pedidos fechados e movimentos anteriores.",
  },
];

export default function SantaCasaHomePage() {
  return (
    <AreaLanding
      eyebrow="Área Santa Casa"
      title="Operação diária da Santa Casa."
      description="Gestão de utentes, medicamentos, receitas, Extras e criação de pedidos para a Farmácia."
      tone="green"
      actions={ACTIONS}
    />
  );
}
