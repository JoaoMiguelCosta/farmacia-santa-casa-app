// src/shared/layouts/AppShell/AppShell.jsx
import { Outlet, useLocation } from "react-router-dom";

import AuthSessionBar from "../../../features/auth/components/AuthSessionBar/AuthSessionBar";
import IdleSessionWarning from "../../../features/auth/components/IdleSessionWarning/IdleSessionWarning";
import { useAuth } from "../../../features/auth/hooks/useAuth";
import { FARMACIA_NAV_ITEMS } from "../../../features/farmacia/shared/config/farmaciaNavigation.config";
import FarmaciaAlertasTray from "../../../features/farmacia/alertas/components/FarmaciaAlertasTray/FarmaciaAlertasTray";
import { SANTACASA_NAV_ITEMS } from "../../../features/santacasa/shared/config/santaCasaNavigation.config";

import AppHeader from "./components/AppHeader/AppHeader";
import AppSectionNav from "./components/AppSectionNav/AppSectionNav";

import { APP_NAV_ITEMS, APP_SHELL_CONFIG } from "./AppShell.config";
import {
  canSeeFarmaciaAlertas,
  canSeeFarmaciaSectionNav,
  canSeeSantaCasaSectionNav,
  getVisibleNavItems,
  isFarmaciaPath,
  isSantaCasaPath,
} from "./AppShell.utils";

import styles from "./AppShell.module.css";

export default function AppShell() {
  const { isAuthenticated, role } = useAuth();
  const { pathname } = useLocation();

  const visibleNavItems = getVisibleNavItems({
    items: APP_NAV_ITEMS,
    isAuthenticated,
    role,
  });

  const shouldShowSantaCasaSectionNav =
    isSantaCasaPath(pathname) &&
    canSeeSantaCasaSectionNav({
      isAuthenticated,
      role,
    });

  const shouldShowFarmaciaSectionNav =
    isFarmaciaPath(pathname) &&
    canSeeFarmaciaSectionNav({
      isAuthenticated,
      role,
    });

  const shouldShowFarmaciaAlertas =
    isFarmaciaPath(pathname) &&
    canSeeFarmaciaAlertas({
      isAuthenticated,
      role,
    });

  const sectionNav = shouldShowSantaCasaSectionNav ? (
    <AppSectionNav
      items={SANTACASA_NAV_ITEMS}
      ariaLabel={APP_SHELL_CONFIG.sectionNavLabels.santacasa}
    />
  ) : shouldShowFarmaciaSectionNav ? (
    <AppSectionNav
      items={FARMACIA_NAV_ITEMS}
      ariaLabel={APP_SHELL_CONFIG.sectionNavLabels.farmacia}
    />
  ) : null;

  return (
    <div className={styles.shell}>
      <a
        href={`#${APP_SHELL_CONFIG.mainContentId}`}
        className={styles.skipLink}
      >
        {APP_SHELL_CONFIG.labels.skipToContent}
      </a>

      <AppHeader
        labels={APP_SHELL_CONFIG.labels}
        primaryNavItems={visibleNavItems}
        sessionBar={<AuthSessionBar />}
        sectionNav={sectionNav}
      />

      <FarmaciaAlertasTray enabled={shouldShowFarmaciaAlertas} />

      <main id={APP_SHELL_CONFIG.mainContentId} className={styles.main}>
        <Outlet />
      </main>

      <IdleSessionWarning />
    </div>
  );
}
