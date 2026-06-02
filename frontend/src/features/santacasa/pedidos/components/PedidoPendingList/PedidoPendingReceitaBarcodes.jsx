// src/features/santacasa/pedidos/components/PedidoPendingList/PedidoPendingReceitaBarcodes.jsx
import BarcodeValue from "../../../../../shared/ui/BarcodeValue/BarcodeValue";

import { PEDIDOS_PAGE } from "../../config/pedidosPage.config";

import {
  getReceitaBarcodeCodes,
  hasReceitaBarcodeData,
} from "./pedidoPendingList.utils";

import styles from "./PedidoPendingList.module.css";

export default function PedidoPendingReceitaBarcodes({ receita }) {
  if (!hasReceitaBarcodeData(receita)) return null;

  const codes = getReceitaBarcodeCodes(receita);

  return (
    <div
      className={styles.barcodePanel}
      aria-label={PEDIDOS_PAGE.sections.pending.barcodeAriaLabel}
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
