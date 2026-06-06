// src/features/santacasa/historico/components/SantaCasaHistoricoCard/SantaCasaHistoricoItem/SantaCasaHistoricoItemBarcodes/SantaCasaHistoricoItemBarcodes.jsx

import BarcodeValue from "../../../../../../../shared/ui/BarcodeValue/BarcodeValue";

import styles from "./SantaCasaHistoricoItemBarcodes.module.css";

import {
  getBarcodePanelClassName,
  getHistoricoReceitaBarcodeItems,
  getReceitaBarcodesAriaLabel,
} from "./santaCasaHistoricoItemBarcodes.utils";

export default function SantaCasaHistoricoItemBarcodes({
  receita,
  isDanger = false,
}) {
  const codes = getHistoricoReceitaBarcodeItems(receita);

  if (codes.length === 0) {
    return null;
  }

  return (
    <div
      className={getBarcodePanelClassName(isDanger, styles)}
      aria-label={getReceitaBarcodesAriaLabel()}
    >
      {codes.map((code) => (
        <BarcodeValue
          key={code.key}
          size="compact"
          label={code.label}
          value={code.value}
          caption={code.value}
          height={28}
          width={code.width}
          displayValue={false}
        />
      ))}
    </div>
  );
}
