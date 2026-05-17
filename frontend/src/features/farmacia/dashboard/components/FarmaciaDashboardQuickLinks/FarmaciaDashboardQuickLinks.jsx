import { Link } from "react-router-dom";

import styles from "./FarmaciaDashboardQuickLinks.module.css";

import { FARMACIA_DASHBOARD_PAGE } from "../../config/farmaciaDashboardPage.config";
import { getDashboardQuickLinks } from "../../utils/farmaciaDashboard.utils";

export default function FarmaciaDashboardQuickLinks() {
  const links = getDashboardQuickLinks();

  return (
    <section
      className={styles.section}
      aria-labelledby="farmacia-dashboard-quick-links-title"
    >
      <header className={styles.header}>
        <div className={styles.heading}>
          <h2
            id="farmacia-dashboard-quick-links-title"
            className={styles.title}
          >
            {FARMACIA_DASHBOARD_PAGE.sections.quickLinks.title}
          </h2>

          <p className={styles.description}>
            {FARMACIA_DASHBOARD_PAGE.sections.quickLinks.description}
          </p>
        </div>
      </header>

      <div className={styles.grid}>
        {links.map((link) => {
          if (link.disabled) {
            return (
              <article
                key={link.title}
                className={`${styles.card} ${styles.cardDisabled}`}
                aria-disabled="true"
              >
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{link.title}</h3>
                  <p className={styles.cardDescription}>{link.description}</p>
                </div>

                <span className={styles.cardAction}>Brevemente</span>
              </article>
            );
          }

          return (
            <Link key={link.to} className={styles.card} to={link.to}>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{link.title}</h3>
                <p className={styles.cardDescription}>{link.description}</p>
              </div>

              <span className={styles.cardAction}>{link.actionLabel}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
