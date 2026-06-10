import BarcodeValue from "../../../../../shared/ui/BarcodeValue/BarcodeValue";

import {
  getReceitaBarcodeCodes,
  hasReceitaBarcodeData,
} from "./pedidoGeralList.utils";

import styles from "./PedidoGeralItem.module.css";

export default function PedidoGeralReceitaBarcodes({ receita }) {
  if (!hasReceitaBarcodeData(receita)) return null;

  const codes = getReceitaBarcodeCodes(receita);

  return (
    <div className={styles.barcodePanel} aria-label="Códigos da receita">
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
