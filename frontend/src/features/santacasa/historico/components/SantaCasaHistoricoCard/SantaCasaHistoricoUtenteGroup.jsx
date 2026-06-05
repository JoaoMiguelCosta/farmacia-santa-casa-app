import SantaCasaHistoricoItem from "./SantaCasaHistoricoItem";

import styles from "./SantaCasaHistoricoUtenteGroup.module.css";

import { SANTACASA_HISTORICO_PAGE } from "../../config/santaCasaHistoricoPage.config";

import { useSantaCasaHistoricoUtenteGroup } from "./useSantaCasaHistoricoUtenteGroup";

function getGroupClassName(group) {
  return [styles.group, group.warningItems > 0 ? styles.groupWarning : ""]
    .filter(Boolean)
    .join(" ");
}

export default function SantaCasaHistoricoUtenteGroup({
  group,
  isSearchActive = false,
}) {
  const {
    visibleItems,
    canShowControls,
    canShowInitial,
    canShowMore,
    canShowAll,
    canHideAll,
    showingItemsLabel,
    showMoreLabel,
    showInitialLabel,
    handleShowInitial,
    handleShowMore,
    handleShowAll,
    handleHideAll,
  } = useSantaCasaHistoricoUtenteGroup(group, { isSearchActive });

  if (!group) return null;

  const shouldShowActions =
    canShowControls &&
    (canShowInitial || canShowMore || canShowAll || canHideAll);

  return (
    <article className={getGroupClassName(group)}>
      <header className={styles.groupHeader}>
        <div className={styles.identity}>
          <span className={styles.eyebrow}>
            {SANTACASA_HISTORICO_PAGE.labels.utente}
          </span>

          <strong className={styles.utente}>{group.utenteLabel}</strong>
        </div>

        <div className={styles.summary}>
          <span>{group.summary}</span>
        </div>
      </header>

      {visibleItems.length > 0 ? (
        <ul className={styles.itemsList}>
          {visibleItems.map((item) => (
            <SantaCasaHistoricoItem
              key={item.id}
              item={item}
              showUtente={false}
            />
          ))}
        </ul>
      ) : null}

      {shouldShowActions ? (
        <footer className={styles.itemsToolbar}>
          <span className={styles.itemsCounter}>{showingItemsLabel}</span>

          <div className={styles.itemsActions}>
            {canShowInitial ? (
              <button
                type="button"
                className={styles.itemsButton}
                onClick={handleShowInitial}
              >
                {showInitialLabel}
              </button>
            ) : null}

            {canShowMore ? (
              <button
                type="button"
                className={styles.itemsButton}
                onClick={handleShowMore}
              >
                {showMoreLabel}
              </button>
            ) : null}

            {canShowAll ? (
              <button
                type="button"
                className={styles.itemsButton}
                onClick={handleShowAll}
              >
                {SANTACASA_HISTORICO_PAGE.actions.showAllItems}
              </button>
            ) : null}

            {canHideAll ? (
              <button
                type="button"
                className={styles.itemsButton}
                onClick={handleHideAll}
              >
                {SANTACASA_HISTORICO_PAGE.actions.hideAllItems}
              </button>
            ) : null}
          </div>
        </footer>
      ) : null}
    </article>
  );
}
