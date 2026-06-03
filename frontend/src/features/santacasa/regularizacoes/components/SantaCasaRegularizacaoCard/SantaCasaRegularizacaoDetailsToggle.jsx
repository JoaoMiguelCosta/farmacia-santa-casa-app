// src/features/santacasa/regularizacoes/components/SantaCasaRegularizacaoCard/SantaCasaRegularizacaoDetailsToggle.jsx

import { SANTACASA_REGULARIZACOES_PAGE } from "../../config/santaCasaRegularizacoesPage.config";

import styles from "./SantaCasaRegularizacaoDetailsToggle.module.css";

function getButtonClassName(isHistory) {
  return isHistory
    ? `${styles.detailsToggleButton} ${styles.detailsToggleButtonHistory}`
    : styles.detailsToggleButton;
}

export default function SantaCasaRegularizacaoDetailsToggle({
  isHistory,
  onToggleDetails,
}) {
  return (
    <footer className={styles.actions}>
      <button
        type="button"
        className={getButtonClassName(isHistory)}
        onClick={onToggleDetails}
      >
        {SANTACASA_REGULARIZACOES_PAGE.actions.viewDetails}
      </button>
    </footer>
  );
}
