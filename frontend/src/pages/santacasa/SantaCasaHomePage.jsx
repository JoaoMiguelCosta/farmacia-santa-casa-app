import AreaLanding from "../../shared/layouts/AreaLanding/AreaLanding.jsx";

import SantaCasaSectionNav from "../../features/santacasa/shared/components/SantaCasaSectionNav/SantaCasaSectionNav.jsx";

import styles from "./SantaCasaHomePage.module.css";

const ACTIONS = [
  {
    title: "Utentes",
    description: "Criar, consultar e gerir utentes ativos.",
    to: "/santacasa/utentes",
  },
  {
    title: "Operação diária",
    description:
      "Gerir receitas, medicamentos sem receita, Extras e pedidos numa página única.",
    to: "/santacasa/operacao",
  },
  {
    title: "Histórico",
    description: "Consultar pedidos fechados e movimentos anteriores.",
    to: "/santacasa/historico",
  },
];

export default function SantaCasaHomePage() {
  return (
    <div className={styles.page}>
      <SantaCasaSectionNav />

      <AreaLanding
        eyebrow="Área Santa Casa"
        title="Operação diária da Santa Casa."
        description="Gestão de utentes, medicamentos, receitas, Extras e criação de pedidos para a Farmácia."
        tone="green"
        actions={ACTIONS}
      />
    </div>
  );
}
