import { useEffect, useMemo, useRef } from "react";
import JsBarcode from "jsbarcode";

import { classNames } from "../../utils/classNames";

import { BARCODE_VALUE_CONFIG } from "./BarcodeValue.config";
import {
  getBarcodeAriaLabel,
  normalizeBarcodeValue,
} from "./BarcodeValue.utils";

import styles from "./BarcodeValue.module.css";

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
    return getBarcodeAriaLabel({
      label,
      value: barcodeValue,
    });
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
        font: BARCODE_VALUE_CONFIG.font,
        fontSize,
        textMargin,
        lineColor: BARCODE_VALUE_CONFIG.lineColor,
        background: BARCODE_VALUE_CONFIG.background,
      });

      svgElement.removeAttribute(BARCODE_VALUE_CONFIG.errorAttribute);
    } catch {
      svgElement.replaceChildren();
      svgElement.setAttribute(BARCODE_VALUE_CONFIG.errorAttribute, "true");
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
