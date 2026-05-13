import { NavLink } from "react-router-dom";

import { SANTACASA_NAV_ITEMS } from "../../config/santaCasaNavigation.config";

import styles from "./SantaCasaSectionNav.module.css";

function getNavLinkClassName({ isActive }) {
  return isActive ? `${styles.link} ${styles.active}` : styles.link;
}

export default function SantaCasaSectionNav() {
  return (
    <nav className={styles.nav} aria-label="Navegação interna da Santa Casa">
      <div className={styles.inner}>
        {SANTACASA_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={getNavLinkClassName}
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
