// src/shared/layouts/AppShell/components/AppPrimaryNav/AppPrimaryNav.jsx
import { NavLink } from "react-router-dom";

import styles from "./AppPrimaryNav.module.css";

function getNavLinkClassName({ isActive }) {
  return isActive ? `${styles.link} ${styles.active}` : styles.link;
}

export default function AppPrimaryNav({ items = [], ariaLabel }) {
  if (items.length === 0) return null;

  return (
    <nav className={styles.nav} aria-label={ariaLabel}>
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
    </nav>
  );
}
