// src/shared/layouts/AppShell/components/AppHeader/AppHeader.jsx
import { NavLink } from "react-router-dom";

import BrandMark from "../../../../components/BrandMark/BrandMark.jsx";

import AppPrimaryNav from "../AppPrimaryNav/AppPrimaryNav";

import styles from "./AppHeader.module.css";

export default function AppHeader({
  labels,
  primaryNavItems = [],
  sessionBar = null,
  sectionNav = null,
}) {
  const hasHeaderActions = Boolean(sessionBar || primaryNavItems.length > 0);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.topRow}>
          <div className={styles.identityGroup}>
            <NavLink
              to="/"
              className={styles.brandLink}
              aria-label={labels.brandHome}
            >
              <BrandMark />
            </NavLink>

            {sessionBar ? (
              <div className={styles.sessionSlot}>{sessionBar}</div>
            ) : null}
          </div>

          {hasHeaderActions ? (
            <div className={styles.navigationGroup}>
              <AppPrimaryNav
                items={primaryNavItems}
                ariaLabel={labels.mainNavigation}
              />
            </div>
          ) : null}
        </div>

        {sectionNav ? (
          <div className={styles.sectionRow}>{sectionNav}</div>
        ) : null}
      </div>
    </header>
  );
}
