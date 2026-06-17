// src/features/santacasa/receitas/components/ReceitasList/ReceitaCodesPanel.jsx
import BarcodeValue from "../../../../../shared/ui/BarcodeValue/BarcodeValue";

import { RECEITAS_PAGE } from "../../config/receitasPage.config";

import styles from "./ReceitaCodesPanel.module.css";

function ReceitaCodeCell({ label, value, size = "compact" }) {
  return (
    <div className={styles.codeCell}>
      <BarcodeValue
        label={label}
        value={value}
        caption=""
        size={size}
        className={styles.codeBarcode}
      />
    </div>
  );
}

export default function ReceitaCodesPanel({ linha, panelId }) {
  return (
    <section
      id={panelId}
      className={styles.codesPanel}
      aria-label={RECEITAS_PAGE.list.codes.title}
    >
      <div className={styles.codesHeader}>
        <h4>{RECEITAS_PAGE.list.codes.title}</h4>
      </div>

      <div className={styles.codesGrid}>
        <ReceitaCodeCell
          label={RECEITAS_PAGE.fields.numero19.label}
          value={linha.numero19}
        />

        <ReceitaCodeCell
          label={RECEITAS_PAGE.fields.pinAcesso6.label}
          value={linha.pinAcesso6}
        />

        <ReceitaCodeCell
          label={RECEITAS_PAGE.fields.pinOpcao4.label}
          value={linha.pinOpcao4}
        />
      </div>
    </section>
  );
}
