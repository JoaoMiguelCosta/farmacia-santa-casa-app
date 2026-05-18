import { NavLink, Outlet } from "react-router-dom";

import { AUTH_ROLES } from "../../../features/auth/config/auth.config";
import AuthSessionBar from "../../../features/auth/components/AuthSessionBar/AuthSessionBar";
import IdleSessionWarning from "../../../features/auth/components/IdleSessionWarning/IdleSessionWarning";
import { useAuth } from "../../../features/auth/hooks/useAuth";

import BrandMark from "../../components/BrandMark/BrandMark.jsx";

import styles from "./AppShell.module.css";

const NAV_ITEMS = [
  {
    label: "Início",
    to: "/",
    end: true,
    authOnly: true,
  },
  {
    label: "Entrar",
    to: "/login",
    publicOnly: true,
  },
  {
    label: "Santa Casa",
    to: "/santacasa",
    allowedRoles: [AUTH_ROLES.SANTACASA, AUTH_ROLES.ADMIN],
  },
  {
    label: "Farmácia",
    to: "/farmacia",
    allowedRoles: [AUTH_ROLES.FARMACIA, AUTH_ROLES.ADMIN],
  },
  {
    label: "Sistema",
    to: "/sistema",
    allowedRoles: [AUTH_ROLES.ADMIN],
  },
];

function getNavLinkClassName({ isActive }) {
  return isActive ? `${styles.navLink} ${styles.active}` : styles.navLink;
}

function getVisibleNavItems({ isAuthenticated, role }) {
  return NAV_ITEMS.filter((item) => {
    if (item.publicOnly) {
      return !isAuthenticated;
    }

    if (item.authOnly) {
      return isAuthenticated;
    }

    if (!Array.isArray(item.allowedRoles)) {
      return true;
    }

    return isAuthenticated && item.allowedRoles.includes(role);
  });
}

export default function AppShell() {
  const { isAuthenticated, role } = useAuth();

  const visibleNavItems = getVisibleNavItems({
    isAuthenticated,
    role,
  });

  return (
    <div className={styles.shell}>
      <a href="#main-content" className={styles.skipLink}>
        Saltar para o conteúdo
      </a>

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <NavLink
            to="/"
            className={styles.brandLink}
            aria-label="Ir para o início"
          >
            <BrandMark />
          </NavLink>

          <nav className={styles.nav} aria-label="Navegação principal">
            {visibleNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={getNavLinkClassName}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <AuthSessionBar />

      <main id="main-content" className={styles.main}>
        <Outlet />
      </main>

      <IdleSessionWarning />
    </div>
  );
}
