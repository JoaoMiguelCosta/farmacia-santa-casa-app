// src/shared/layouts/AppShell/components/AppSectionNav/AppSectionNav.jsx
import { NavLink } from "react-router-dom";

import styles from "./AppSectionNav.module.css";

function getNavLinkClassName({ isActive }) {
  return isActive ? `${styles.link} ${styles.active}` : styles.link;
}

export default function AppSectionNav({ items = [], ariaLabel }) {
  if (items.length === 0) return null;

  return (
    <nav className={styles.nav} aria-label={ariaLabel}>
      <div className={styles.inner}>
        {items.map((item) => (
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
