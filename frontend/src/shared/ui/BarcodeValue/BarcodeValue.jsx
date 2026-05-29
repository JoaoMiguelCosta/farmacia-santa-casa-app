import { useEffect, useMemo, useRef } from "react";
import JsBarcode from "jsbarcode";

import { classNames } from "../../utils/classNames";

import styles from "./BarcodeValue.module.css";

function normalizeBarcodeValue(value) {
  return String(value ?? "").trim();
}

export default function BarcodeValue({
  label,
  value,
  caption,
  format = "CODE128",
  width = 1,
  height = 34,
  margin = 0,
  displayValue = true,
  fontSize = 11,
  textMargin = 5,
  size = "default",
  className = "",
}) {
  const svgRef = useRef(null);
  const barcodeValue = normalizeBarcodeValue(value);

  const ariaLabel = useMemo(() => {
    if (!label) return `Código de barras ${barcodeValue}`;

    return `${label}: ${barcodeValue}`;
  }, [barcodeValue, label]);

  useEffect(() => {
    const svgElement = svgRef.current;

    if (!svgElement || !barcodeValue) return;

    try {
      JsBarcode(svgElement, barcodeValue, {
        format,
        width,
        height,
        margin,
        displayValue,
        font: "system-ui",
        fontSize,
        textMargin,
        lineColor: "currentColor",
        background: "transparent",
      });

      svgElement.removeAttribute("data-barcode-error");
    } catch {
      svgElement.replaceChildren();
      svgElement.setAttribute("data-barcode-error", "true");
    }
  }, [
    barcodeValue,
    displayValue,
    fontSize,
    format,
    height,
    margin,
    textMargin,
    width,
  ]);

  if (!barcodeValue) return null;

  return (
    <article
      className={classNames(styles.barcodeValue, styles[size], className)}
    >
      {label ? <span className={styles.label}>{label}</span> : null}

      <div className={styles.frame}>
        <svg
          ref={svgRef}
          className={styles.svg}
          role="img"
          aria-label={ariaLabel}
        />
      </div>

      {caption ? <span className={styles.caption}>{caption}</span> : null}
    </article>
  );
}
