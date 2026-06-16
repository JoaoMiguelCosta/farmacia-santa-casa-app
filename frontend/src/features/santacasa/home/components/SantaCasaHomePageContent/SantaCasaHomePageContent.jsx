import { useId } from "react";

import { SANTACASA_HOME_PAGE } from "../../config/santaCasaHomePage.config";

import HomeActionCard from "../../../../../shared/ui/HomeActionCard/HomeActionCard";

import styles from "./SantaCasaHomePageContent.module.css";

export default function SantaCasaHomePageContent() {
  const pageTitleId = useId();
  const quickAccessTitleId = useId();

  const { header, featured, quickAccess } = SANTACASA_HOME_PAGE;

  return (
    <main className={styles.page} aria-labelledby={pageTitleId}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>{header.eyebrow}</p>

        <h1 id={pageTitleId} className={styles.title}>
          {header.title}
        </h1>

        <p className={styles.description}>{header.description}</p>
      </header>

      <section className={styles.featured} aria-label={featured.ariaLabel}>
        <HomeActionCard {...featured.operation} />

        <HomeActionCard {...featured.dashboard} />
      </section>

      <section
        className={styles.quickAccess}
        aria-labelledby={quickAccessTitleId}
      >
        <header className={styles.quickAccessHeader}>
          <p className={styles.sectionEyebrow}>{quickAccess.eyebrow}</p>

          <h2 id={quickAccessTitleId} className={styles.sectionTitle}>
            {quickAccess.title}
          </h2>

          <p className={styles.sectionDescription}>{quickAccess.description}</p>
        </header>

        <div className={styles.quickAccessGrid}>
          {quickAccess.actions.map((action) => (
            <HomeActionCard key={action.id} {...action} />
          ))}
        </div>
      </section>
    </main>
  );
}
