import { Link } from "react-router-dom";

import styles from "./SantaCasaDashboardQuickLinks.module.css";

import { SANTACASA_DASHBOARD_PAGE } from "../../config/santaCasaDashboardPage.config";
import { getDashboardQuickLinks } from "../../utils/santaCasaDashboard.utils";

export default function SantaCasaDashboardQuickLinks() {
  const links = getDashboardQuickLinks();

  return (
    <section
      className={styles.section}
      aria-labelledby="santacasa-dashboard-quick-links-title"
    >
      <header className={styles.header}>
        <div className={styles.heading}>
          <h2
            id="santacasa-dashboard-quick-links-title"
            className={styles.title}
          >
            {SANTACASA_DASHBOARD_PAGE.sections.quickLinks.title}
          </h2>

          <p className={styles.description}>
            {SANTACASA_DASHBOARD_PAGE.sections.quickLinks.description}
          </p>
        </div>
      </header>

      <div className={styles.grid}>
        {links.map((link) => (
          <Link key={link.to} className={styles.card} to={link.to}>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>{link.title}</h3>
              <p className={styles.cardDescription}>{link.description}</p>
            </div>

            <span className={styles.cardAction}>{link.actionLabel}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
