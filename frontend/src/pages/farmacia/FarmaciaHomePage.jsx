import styles from "./FarmaciaHomePage.module.css";

const ACTIONS = [
  "Pedidos Pendentes",
  "Validação",
  "Rejeição",
  "Regularizações",
  "Dashboard",
  "Manutenção",
];

export default function FarmaciaHomePage() {
  return (
    <section className={styles.page} aria-labelledby="farmacia-title">
      <div className={styles.header}>
        <p className={styles.kicker}>Área Farmácia</p>
        <h1 id="farmacia-title" className={styles.title}>
          Controlo farmacêutico com rastreabilidade.
        </h1>
        <p className={styles.lead}>
          Esta área vai reunir pedidos pendentes, validações, rejeições,
          regularizações, histórico e sinais operacionais.
        </p>
      </div>

      <div className={styles.panel}>
        {ACTIONS.map((action) => (
          <article key={action} className={styles.item}>
            <span className={styles.dot} aria-hidden="true" />
            <h2>{action}</h2>
            <p>Módulo a construir no próximo passo.</p>
          </article>
        ))}
      </div>
    </section>
  );
}
