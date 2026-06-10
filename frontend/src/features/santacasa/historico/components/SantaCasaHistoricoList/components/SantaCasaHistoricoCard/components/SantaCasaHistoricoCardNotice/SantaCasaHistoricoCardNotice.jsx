// src/features/santacasa/historico/components/SantaCasaHistoricoList/components/SantaCasaHistoricoCard/components/SantaCasaHistoricoCardNotice/SantaCasaHistoricoCardNotice.jsx

import { SANTACASA_HISTORICO_PAGE } from "../../../../../../config/santaCasaHistoricoPage.config";

import styles from "../../SantaCasaHistoricoCard.module.css";

export default function SantaCasaHistoricoCardNotice({
  message,
  hasExpirationWarning,
  expirationWarningLabel,
  showReason,
  reasonTitle,
  reasonValue,
}) {
  return (
    <>
      {message ? <p className={styles.message}>{message}</p> : null}

      {hasExpirationWarning ? (
        <aside className={styles.warning} role="status">
          <div>
            <strong>
              {SANTACASA_HISTORICO_PAGE.labels.validatedWithWarningsNoticeTitle}
            </strong>

            <p>
              {SANTACASA_HISTORICO_PAGE.messages.validatedWithWarningsNotice}
            </p>
          </div>

          <span>{expirationWarningLabel}</span>
        </aside>
      ) : null}

      {showReason ? (
        <div className={styles.reason}>
          <strong>{reasonTitle}</strong>

          <p>{reasonValue}</p>
        </div>
      ) : null}
    </>
  );
}
