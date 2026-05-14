import PageHeader from "../../shared/ui/PageHeader/PageHeader";
import SurfaceCard from "../../shared/ui/SurfaceCard/SurfaceCard";

import SantaCasaSectionNav from "../../features/santacasa/shared/components/SantaCasaSectionNav/SantaCasaSectionNav";

import styles from "./SantaCasaPlaceholderPage.module.css";

export default function SantaCasaPlaceholderPage({
  title,
  description,
  nextStep,
}) {
  return (
    <section className={styles.page} aria-labelledby="placeholder-title">
      <PageHeader
        titleId="placeholder-title"
        eyebrow="Santa Casa"
        title={title}
        description={description}
      />

      <SantaCasaSectionNav />

      <SurfaceCard
        eyebrow="Módulo em preparação"
        title="Página ainda não implementada"
        description={nextStep}
        tone="gold"
      >
        <p className={styles.text}>
          A rota já está preparada para manter a navegação consistente. O módulo
          será construído no próximo passo, com ligação real à API e componentes
          reutilizáveis.
        </p>
      </SurfaceCard>
    </section>
  );
}
