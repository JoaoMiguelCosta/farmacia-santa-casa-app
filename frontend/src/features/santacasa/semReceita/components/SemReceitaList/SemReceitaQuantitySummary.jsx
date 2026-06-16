// src/features/santacasa/sem-receita/components/SemReceitaList/SemReceitaQuantitySummary.jsx
import { SEM_RECEITA_PAGE } from "../../config/semReceitaPage.config";

import { getSemReceitaDispensedQuantity } from "../../utils/semReceitaList.utils";

import styles from "./SemReceitaQuantitySummary.module.css";

export default function SemReceitaQuantitySummary({
  item,
  quantidadeDisponivel,
  quantidadeEmPedido,
}) {
  const quantidadeDispensada = getSemReceitaDispensedQuantity(item);

  return (
    <div className={styles.quantitySummary}>
      <div className={styles.quantityAvailable}>
        <span>{SEM_RECEITA_PAGE.list.columns.quantidade}</span>
        <strong>{quantidadeDisponivel}</strong>
      </div>

      <div className={styles.quantityDetails}>
        <span>
          {SEM_RECEITA_PAGE.list.labels.total}{" "}
          <strong>{item.quantidade}</strong>
        </span>

        <span>
          {SEM_RECEITA_PAGE.list.labels.dispensada}{" "}
          <strong>{quantidadeDispensada}</strong>
        </span>

        <span>
          {SEM_RECEITA_PAGE.list.labels.emPedido}{" "}
          <strong>{quantidadeEmPedido}</strong>
        </span>
      </div>
    </div>
  );
}
