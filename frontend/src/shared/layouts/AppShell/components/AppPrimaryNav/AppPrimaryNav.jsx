// src/shared/layouts/AppShell/components/AppPrimaryNav/AppPrimaryNav.jsx

import { NavLink } from "react-router-dom";

import styles from "./AppPrimaryNav.module.css";

function hasAreaPresentation(items) {
  return items.some((item) => item.presentation === "area");
}

function getNavClassName(items) {
  return hasAreaPresentation(items)
    ? `${styles.nav} ${styles.areaNav}`
    : styles.nav;
}

function getNavLinkClassName(item) {
  return ({ isActive }) => {
    return [
      styles.link,
      item.presentation === "area" ? styles.areaLink : "",
      isActive ? styles.active : "",
    ]
      .filter(Boolean)
      .join(" ");
  };
}

export default function AppPrimaryNav({ items = [], ariaLabel }) {
  if (items.length === 0) return null;

  return (
    <nav className={getNavClassName(items)} aria-label={ariaLabel}>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={getNavLinkClassName(item)}
        >
          {item.eyebrow ? (
            <span className={styles.eyebrow}>{item.eyebrow}</span>
          ) : null}

          <span className={styles.linkLabel}>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
