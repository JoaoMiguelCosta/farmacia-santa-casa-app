import BarcodeValue from "../../../../../shared/ui/BarcodeValue/BarcodeValue";

import { FARMACIA_REGULARIZACOES_PAGE } from "../../config/farmaciaRegularizacoesPage.config";

import styles from "./FarmaciaRegularizacaoCard.module.css";

export default function FarmaciaRegularizacaoReceitaBarcodes({ receita }) {
  if (!receita) return null;

  const codes = [
    {
      key: "numero19",
      label: FARMACIA_REGULARIZACOES_PAGE.labels.receitaNumber,
      value: receita.numero19,
      width: 0.72,
    },
    {
      key: "pinAcesso6",
      label: FARMACIA_REGULARIZACOES_PAGE.labels.pinAcesso,
      value: receita.pinAcesso6,
      width: 1.08,
    },
    {
      key: "pinOpcao4",
      label: FARMACIA_REGULARIZACOES_PAGE.labels.pinOpcao,
      value: receita.pinOpcao4,
      width: 1.16,
    },
  ];

  return (
    <div
      className={styles.barcodePanel}
      aria-label={FARMACIA_REGULARIZACOES_PAGE.accessibility.receitaBarcodes}
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
