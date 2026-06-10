import Button from "../../../../../shared/ui/Button/Button";

import { PEDIDOS_PAGE } from "../../config/pedidosPage.config";

import styles from "./PedidoGeralActionsBar.module.css";

function SummaryMetric({ label, value }) {
  return (
    <div className={styles.metric}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function PedidoGeralActionsBar({
  totalUtentes = 0,
  totalItems = 0,
  totalQuantity = 0,
  isSubmitting = false,
  onClearRequest,
}) {
  return (
    <footer className={styles.bar}>
      <dl
        className={styles.summary}
        aria-label={PEDIDOS_PAGE.sections.draft.title}
      >
        <SummaryMetric
          label={PEDIDOS_PAGE.labels.utentes}
          value={totalUtentes}
        />

        <SummaryMetric label={PEDIDOS_PAGE.labels.items} value={totalItems} />

        <SummaryMetric
          label={PEDIDOS_PAGE.labels.totalQuantity}
          value={totalQuantity}
        />
      </dl>

      <div className={styles.actions}>
        <div className={styles.clearAction}>
          <Button
            type="button"
            variant="danger"
            disabled={isSubmitting}
            onClick={onClearRequest}
          >
            {PEDIDOS_PAGE.actions.clearDraftGeneral}
          </Button>
        </div>

        <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
          {isSubmitting
            ? PEDIDOS_PAGE.sections.draft.submittingLabel
            : PEDIDOS_PAGE.sections.draft.submitLabel}
        </Button>
      </div>
    </footer>
  );
}
