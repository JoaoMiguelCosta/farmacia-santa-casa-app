// src/features/santacasa/receitas/components/ReceitasList/ReceitaQuantitySummary.jsx
import { RECEITAS_PAGE } from "../../config/receitasPage.config";

import {
  getReceitaDispensedQuantity,
  getReceitaUsedInRegularizationQuantity,
} from "../../utils/receitasList.utils";

import styles from "./ReceitaQuantitySummary.module.css";

export default function ReceitaQuantitySummary({
  linha,
  quantidadeDisponivel,
  quantidadeEmPedido,
}) {
  const quantidadeDispensada = getReceitaDispensedQuantity(linha);
  const quantidadeUsadaRegularizacao =
    getReceitaUsedInRegularizationQuantity(linha);

  return (
    <div className={styles.quantitySummary}>
      <div className={styles.quantityAvailable}>
        <span>{RECEITAS_PAGE.list.columns.quantidade}</span>
        <strong>{quantidadeDisponivel}</strong>
      </div>

      <div className={styles.quantityDetails}>
        <span>
          {RECEITAS_PAGE.list.labels.total} <strong>{linha.quantidade}</strong>
        </span>

        <span>
          {RECEITAS_PAGE.list.labels.dispensada}{" "}
          <strong>{quantidadeDispensada}</strong>
        </span>

        <span>
          {RECEITAS_PAGE.list.labels.usadaRegularizacao}{" "}
          <strong>{quantidadeUsadaRegularizacao}</strong>
        </span>

        <span>
          {RECEITAS_PAGE.list.labels.emPedido}{" "}
          <strong>{quantidadeEmPedido}</strong>
        </span>
      </div>
    </div>
  );
}
