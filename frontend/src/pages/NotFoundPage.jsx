import { Link } from "react-router-dom";

import styles from "./NotFoundPage.module.css";

export default function NotFoundPage() {
  return (
    <section className={styles.page} aria-labelledby="not-found-title">
      <div className={styles.card}>
        <p className={styles.kicker}>404</p>

        <h1 id="not-found-title" className={styles.title}>
          Página não encontrada.
        </h1>

        <p className={styles.text}>
          A página que tentaste abrir não existe ou foi movida.
        </p>

        <Link className={styles.link} to="/">
          Voltar ao início
        </Link>
      </div>
    </section>
  );
}
