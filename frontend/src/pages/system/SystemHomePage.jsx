import { Link } from "react-router-dom";

import PageHeader from "../../shared/ui/PageHeader/PageHeader";

import SystemHealthPanel from "../../features/system/health/components/SystemHealthPanel/SystemHealthPanel";

import styles from "./SystemHomePage.module.css";

const SYSTEM_PAGE = Object.freeze({
  header: {
    eyebrow: "Sistema/Admin",
    title: "Área técnica do sistema",
    description:
      "Consulta o estado dos serviços e acede a operações administrativas protegidas.",
  },

  sections: {
    quickLinks: {
      title: "Acessos administrativos",
      description:
        "Atalhos para áreas técnicas que não devem estar misturadas com a operação diária.",
    },
  },

  cards: [
    {
      title: "Utilizadores",
      description:
        "Criar, editar, ativar ou desativar contas da Santa Casa, Farmácia e Administração.",
      to: "/sistema/utilizadores",
      actionLabel: "Gerir utilizadores",
    },
    {
      title: "Manutenção",
      description:
        "Executar jobs técnicos com pré-visualização obrigatória e confirmação.",
      to: "/sistema/manutencao",
      actionLabel: "Abrir manutenção",
    },
  ],
});

export default function SystemHomePage() {
  return (
    <section className={styles.page} aria-labelledby="system-home-title">
      <PageHeader
        titleId="system-home-title"
        eyebrow={SYSTEM_PAGE.header.eyebrow}
        title={SYSTEM_PAGE.header.title}
        description={SYSTEM_PAGE.header.description}
      />

      <SystemHealthPanel />

      <section
        className={styles.quickLinks}
        aria-labelledby="system-quick-links-title"
      >
        <header className={styles.sectionHeader}>
          <h2 id="system-quick-links-title" className={styles.sectionTitle}>
            {SYSTEM_PAGE.sections.quickLinks.title}
          </h2>

          <p className={styles.sectionDescription}>
            {SYSTEM_PAGE.sections.quickLinks.description}
          </p>
        </header>

        <div className={styles.grid}>
          {SYSTEM_PAGE.cards.map((card) => (
            <Link key={card.to} className={styles.card} to={card.to}>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{card.title}</h3>
                <p className={styles.cardDescription}>{card.description}</p>
              </div>

              <span className={styles.cardAction}>{card.actionLabel}</span>
            </Link>
          ))}
        </div>
      </section>
    </section>
  );
}
