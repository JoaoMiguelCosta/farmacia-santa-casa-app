// src/features/santacasa/extras/components/ExtrasList/ExtraQuantitySummary.jsx
import { EXTRAS_PAGE } from "../../config/extrasPage.config";

import {
  getExtraDispensedQuantity,
  getExtraRequestedQuantity,
} from "../../utils/extrasList.utils";

import styles from "./ExtraQuantitySummary.module.css";

export default function ExtraQuantitySummary({
  item,
  quantidadeDisponivel,
  quantidadeEmPedido,
}) {
  const quantidadeSolicitada = getExtraRequestedQuantity(item);
  const quantidadeDispensada = getExtraDispensedQuantity(item);

  return (
    <div className={styles.quantitySummary}>
      <div className={styles.quantityAvailable}>
        <span>{EXTRAS_PAGE.list.columns.quantidade}</span>
        <strong>{quantidadeDisponivel}</strong>
      </div>

      <div className={styles.quantityDetails}>
        <span>
          {EXTRAS_PAGE.list.labels.total}{" "}
          <strong>{quantidadeSolicitada}</strong>
        </span>

        <span>
          {EXTRAS_PAGE.list.labels.dispensada}{" "}
          <strong>{quantidadeDispensada}</strong>
        </span>

        <span>
          {EXTRAS_PAGE.list.labels.emPedido}{" "}
          <strong>{quantidadeEmPedido}</strong>
        </span>
      </div>
    </div>
  );
}
