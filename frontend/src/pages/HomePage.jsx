import { Link } from "react-router-dom";

import SystemHealthPanel from "../features/system/components/SystemHealthPanel/SystemHealthPanel";

import styles from "./HomePage.module.css";

const AREAS = [
  {
    title: "Santa Casa",
    description:
      "Gestão de utentes, receitas, medicamentos sem receita, Extras e criação de pedidos.",
    to: "/santacasa",
    label: "Entrar na Santa Casa",
  },
  {
    title: "Farmácia",
    description:
      "Validação de pedidos, regularizações, histórico, dashboard e manutenção operacional.",
    to: "/farmacia",
    label: "Entrar na Farmácia",
  },
];

export default function HomePage() {
  return (
    <section className={styles.page} aria-labelledby="home-title">
      <div className={styles.hero}>
        <p className={styles.kicker}>Sistema interno</p>

        <h1 id="home-title" className={styles.title}>
          Gestão clínica simples, segura e organizada.
        </h1>

        <p className={styles.lead}>
          Plataforma para gerir utentes, pedidos, receitas, vendas suspensas e
          regularizações entre Santa Casa e Farmácia.
        </p>
      </div>

      <div className={styles.grid} role="list" aria-label="Áreas principais">
        {AREAS.map((area) => (
          <article key={area.to} className={styles.card} role="listitem">
            <div className={styles.cardContent}>
              <p className={styles.cardEyebrow}>Área</p>

              <h2 className={styles.cardTitle}>{area.title}</h2>

              <p className={styles.cardText}>{area.description}</p>
            </div>

            <Link
              className={styles.cardLink}
              to={area.to}
              aria-label={area.label}
            >
              {area.label}
            </Link>
          </article>
        ))}
      </div>

      <SystemHealthPanel />
    </section>
  );
}
