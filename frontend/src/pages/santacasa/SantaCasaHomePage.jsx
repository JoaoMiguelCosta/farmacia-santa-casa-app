import styles from "./SantaCasaHomePage.module.css";

const ACTIONS = [
  "Utentes",
  "Receitas",
  "Sem Receita",
  "Extras",
  "Criar Pedido",
  "Histórico",
];

export default function SantaCasaHomePage() {
  return (
    <section className={styles.page} aria-labelledby="santacasa-title">
      <div className={styles.header}>
        <p className={styles.kicker}>Área Santa Casa</p>
        <h1 id="santacasa-title" className={styles.title}>
          Operação diária da Santa Casa.
        </h1>
        <p className={styles.lead}>
          Esta área vai concentrar a gestão de utentes, medicamentos, receitas,
          Extras e criação de pedidos para a Farmácia.
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
