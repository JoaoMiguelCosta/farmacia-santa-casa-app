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
      "Gerir receitas, medicamentos sem receita e Extras por utente.",
    to: "/santacasa/operacao",
  },
  {
    title: "Pedidos",
    description:
      "Rever a lista geral multiutente e enviar um único pedido para a Farmácia.",
    to: "/santacasa/pedidos",
  },
  {
    title: "Histórico",
    description: "Consultar pedidos fechados e movimentos anteriores.",
    to: "/santacasa/historico",
  },
];

export default function SantaCasaHomePage() {
  return (
    <section
      className={styles.page}
      aria-label="Área operacional da Santa Casa"
    >
      <SantaCasaSectionNav />

      <AreaLanding
        eyebrow="Área Santa Casa"
        title="Operação diária da Santa Casa."
        description="Gestão de utentes, medicamentos, receitas, Extras e criação de pedidos para a Farmácia."
        tone="green"
        actions={ACTIONS}
      />
    </section>
  );
}
