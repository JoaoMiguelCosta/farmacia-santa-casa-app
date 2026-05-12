import { NavLink, Outlet } from "react-router-dom";

import BrandMark from "../../components/BrandMark/BrandMark.jsx";

import styles from "./AppShell.module.css";

const NAV_ITEMS = [
  {
    label: "Início",
    to: "/",
    end: true,
  },
  {
    label: "Santa Casa",
    to: "/santacasa",
  },
  {
    label: "Farmácia",
    to: "/farmacia",
  },
];

function getNavLinkClassName({ isActive }) {
  return isActive ? `${styles.navLink} ${styles.active}` : styles.navLink;
}

export default function AppShell() {
  return (
    <div className={styles.shell}>
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
            {NAV_ITEMS.map((item) => (
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

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
