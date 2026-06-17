// src/features/santacasa/regularizacoes/components/SantaCasaRegularizacaoCard/SantaCasaRegularizacaoUnitValue.jsx

import styles from "./SantaCasaRegularizacaoUnitValue.module.css";

import {
  getSafeUnitValue,
  getUnidadeLabel,
} from "./santaCasaRegularizacaoCard.utils";

function getClassName({ variant, tone }) {
  return [
    styles.unitValue,
    variant === "featured" ? styles.unitValueFeatured : "",
    tone === "success" ? styles.unitValueSuccess : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export default function SantaCasaRegularizacaoUnitValue({
  value,
  variant = "default",
  tone = "default",
}) {
  return (
    <span className={getClassName({ variant, tone })}>
      <strong>{getSafeUnitValue(value)}</strong>
      <span>{getUnidadeLabel(value)}</span>
    </span>
  );
}
