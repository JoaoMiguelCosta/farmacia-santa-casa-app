// src/features/santacasa/regularizacoes/components/SantaCasaRegularizacaoCard/SantaCasaRegularizacaoDetailsToggle.jsx

import { SANTACASA_REGULARIZACOES_PAGE } from "../../config/santaCasaRegularizacoesPage.config";

import { classNames } from "../../../../../shared/utils/classNames";

import styles from "./SantaCasaRegularizacaoDetailsToggle.module.css";

function getButtonClassName(isHistory) {
  return classNames(styles.detailsToggleButton, isHistory && styles.detailsToggleButtonHistory);
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
