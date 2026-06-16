import { FARMACIA_HOME_PAGE } from "../../config/farmaciaHomePage.config";

import HomeActionCard from "../../../../../shared/ui/HomeActionCard/HomeActionCard";

import styles from "./FarmaciaHomePageContent.module.css";

export default function FarmaciaHomePageContent() {
  const { header, featured, quickAccess } = FARMACIA_HOME_PAGE;

  return (
    <section className={styles.page} aria-labelledby="farmacia-home-title">
      <header className={styles.header}>
        <p className={styles.eyebrow}>{header.eyebrow}</p>

        <h1 id="farmacia-home-title" className={styles.title}>
          {header.title}
        </h1>

        <p className={styles.description}>{header.description}</p>
      </header>

      <section className={styles.featured} aria-label={featured.ariaLabel}>
        <HomeActionCard {...featured.pedidos} />

        <HomeActionCard {...featured.dashboard} />
      </section>

      <section
        className={styles.quickAccess}
        aria-labelledby="farmacia-home-quick-access-title"
      >
        <header className={styles.quickAccessHeader}>
          <p className={styles.sectionEyebrow}>{quickAccess.eyebrow}</p>

          <h2
            id="farmacia-home-quick-access-title"
            className={styles.sectionTitle}
          >
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
    </section>
  );
}
