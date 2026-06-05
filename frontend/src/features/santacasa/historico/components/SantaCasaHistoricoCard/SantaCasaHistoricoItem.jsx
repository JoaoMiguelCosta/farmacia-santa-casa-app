import SantaCasaHistoricoItemBarcodes from "./SantaCasaHistoricoItemBarcodes";

import styles from "./SantaCasaHistoricoItem.module.css";

import { SANTACASA_HISTORICO_PAGE } from "../../config/santaCasaHistoricoPage.config";

import {
  getHistoricoItemReceita,
  getHistoricoItemViewModel,
} from "./santaCasaHistoricoItem.utils";

export default function SantaCasaHistoricoItem({ item, showUtente = true }) {
  const receita = getHistoricoItemReceita(item);
  const viewModel = getHistoricoItemViewModel(item, styles);

  return (
    <li className={viewModel.itemClassName}>
      <div className={styles.itemMain}>
        <div className={styles.itemHeader}>
          <span className={viewModel.itemTypeClassName}>
            {viewModel.typeLabel}
          </span>

          <span className={viewModel.itemStatusClassName}>
            {viewModel.statusLabel}
          </span>
        </div>

        <strong className={styles.itemTitle}>
          {viewModel.medicamentoLabel}
        </strong>

        {viewModel.validadeLabel ? (
          <span className={styles.itemValidity}>{viewModel.validadeLabel}</span>
        ) : null}

        {receita ? (
          <SantaCasaHistoricoItemBarcodes
            receita={receita}
            isDanger={viewModel.isDanger}
          />
        ) : (
          <>
            {viewModel.shouldShowReference ? (
              <span className={styles.itemReference}>
                {viewModel.referenceLabel}
              </span>
            ) : null}

            {viewModel.shouldShowMeta ? (
              <span className={styles.itemMeta}>{viewModel.metaLabel}</span>
            ) : null}
          </>
        )}

        {viewModel.expiryNotice ? (
          <span className={styles.itemExpiryNotice}>
            {viewModel.expiryNotice}
          </span>
        ) : null}
      </div>

      <div className={styles.itemSide}>
        <span>{SANTACASA_HISTORICO_PAGE.labels.quantidade}</span>
        <strong>{viewModel.quantityLabel}</strong>
      </div>

      {showUtente ? (
        <div className={styles.itemFooter}>
          <span>{SANTACASA_HISTORICO_PAGE.labels.utente}</span>
          <strong>{viewModel.utenteLabel}</strong>
        </div>
      ) : null}
    </li>
  );
}
