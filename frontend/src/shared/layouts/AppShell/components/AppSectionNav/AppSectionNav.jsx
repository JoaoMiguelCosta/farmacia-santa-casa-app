// src/shared/layouts/AppShell/components/AppSectionNav/AppSectionNav.jsx

import { NavLink } from "react-router-dom";

import styles from "./AppSectionNav.module.css";

function getNavLinkClassName({ isActive }) {
  return isActive ? `${styles.link} ${styles.active}` : styles.link;
}

function getNavItemClassName(item) {
  if (item.placement === "end") {
    return `${styles.item} ${styles.endItem}`;
  }

  return styles.item;
}

export default function AppSectionNav({ items = [], ariaLabel }) {
  if (items.length === 0) return null;

  return (
    <nav className={styles.nav} aria-label={ariaLabel}>
      <div className={styles.inner}>
        {items.map((item) => (
          <div key={item.to} className={getNavItemClassName(item)}>
            <NavLink
              to={item.to}
              end={item.end}
              className={getNavLinkClassName}
            >
              {item.label}
            </NavLink>
          </div>
        ))}
      </div>
    </nav>
  );
}
