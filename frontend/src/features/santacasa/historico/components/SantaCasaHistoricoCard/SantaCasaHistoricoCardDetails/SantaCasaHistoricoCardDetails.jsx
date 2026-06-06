// src/features/santacasa/historico/components/SantaCasaHistoricoCard/
// SantaCasaHistoricoCardDetails/SantaCasaHistoricoCardDetails.jsx

import { useId } from "react";

import SantaCasaHistoricoUtenteGroup from "./SantaCasaHistoricoUtenteGroup/SantaCasaHistoricoUtenteGroup";

import styles from "./SantaCasaHistoricoCardDetails.module.css";

import { SANTACASA_HISTORICO_PAGE } from "../../../config/santaCasaHistoricoPage.config";

import { useSantaCasaHistoricoCardDetails } from "./useSantaCasaHistoricoCardDetails";

function getItemsDescription(totalItems) {
  const safeTotalItems = Math.max(0, Number(totalItems) || 0);

  const description =
    safeTotalItems === 1
      ? SANTACASA_HISTORICO_PAGE.details.itemCountSingular
      : SANTACASA_HISTORICO_PAGE.details.itemCountPlural;

  return `${safeTotalItems} ${description}`;
}

function getSearchResultsDescription({ filteredItemsCount, totalItems }) {
  return [
    `${SANTACASA_HISTORICO_PAGE.labels.itemSearchResults}:`,
    filteredItemsCount,
    SANTACASA_HISTORICO_PAGE.labels.of,
    `${totalItems}.`,
  ].join(" ");
}

export default function SantaCasaHistoricoCardDetails({ items = [] }) {
  const searchInputId = useId();

  const {
    search,
    groups,

    totalItems,
    filteredItemsCount,

    hasSearch,
    hasGroups,

    handleSearchChange,
    handleClearSearch,
  } = useSantaCasaHistoricoCardDetails(items);

  const detailsDescription = hasSearch
    ? getSearchResultsDescription({
        filteredItemsCount,
        totalItems,
      })
    : getItemsDescription(totalItems);

  return (
    <section className={styles.details}>
      <header className={styles.detailsHeader}>
        <div className={styles.heading}>
          <h4 className={styles.detailsTitle}>
            {SANTACASA_HISTORICO_PAGE.labels.items}
          </h4>

          <p className={styles.detailsDescription}>{detailsDescription}</p>
        </div>

        <div className={styles.searchBox}>
          <label className={styles.searchLabel} htmlFor={searchInputId}>
            {SANTACASA_HISTORICO_PAGE.labels.itemSearch}
          </label>

          <div className={styles.searchControl}>
            <input
              id={searchInputId}
              type="search"
              value={search}
              placeholder={
                SANTACASA_HISTORICO_PAGE.filters.itemSearchPlaceholder
              }
              onChange={handleSearchChange}
            />

            {hasSearch ? (
              <button type="button" onClick={handleClearSearch}>
                {SANTACASA_HISTORICO_PAGE.filters.clear}
              </button>
            ) : null}
          </div>
        </div>
      </header>

      {hasGroups ? (
        <div className={styles.itemsList}>
          {groups.map((group) => (
            <SantaCasaHistoricoUtenteGroup
              key={group.key}
              group={group}
              isSearchActive={hasSearch}
            />
          ))}
        </div>
      ) : (
        <div className={styles.emptySearch}>
          <strong>{SANTACASA_HISTORICO_PAGE.labels.itemSearchEmpty}</strong>
        </div>
      )}
    </section>
  );
}
