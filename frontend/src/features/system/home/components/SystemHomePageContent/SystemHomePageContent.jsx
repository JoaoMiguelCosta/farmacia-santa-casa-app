// src/features/system/home/components/SystemHomePageContent/SystemHomePageContent.jsx

import { SYSTEM_HOME_PAGE } from "../../config/systemHomePage.config";

import SystemHomeActionCard from "../SystemHomeActionCard/SystemHomeActionCard";

import styles from "./SystemHomePageContent.module.css";

export default function SystemHomePageContent() {
  const { header, featured } = SYSTEM_HOME_PAGE;

  return (
    <section className={styles.page} aria-labelledby="system-home-title">
      <header className={styles.header}>
        <p className={styles.eyebrow}>{header.eyebrow}</p>

        <h1 id="system-home-title" className={styles.title}>
          {header.title}
        </h1>

        <p className={styles.description}>{header.description}</p>
      </header>

      <section className={styles.featured} aria-label={featured.ariaLabel}>
        {featured.actions.map((action) => (
          <SystemHomeActionCard key={action.id} {...action} />
        ))}
      </section>
    </section>
  );
}
