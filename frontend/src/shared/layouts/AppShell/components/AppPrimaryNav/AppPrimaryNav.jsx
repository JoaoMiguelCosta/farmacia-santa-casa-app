// src/shared/layouts/AppShell/components/AppPrimaryNav/AppPrimaryNav.jsx

import { NavLink } from "react-router-dom";

import { classNames } from "../../../../utils/classNames";

import styles from "./AppPrimaryNav.module.css";

function hasAreaPresentation(items) {
  return items.some((item) => item.presentation === "area");
}

function getNavClassName(items) {
  return classNames(styles.nav, hasAreaPresentation(items) && styles.areaNav);
}

function getNavLinkClassName(item) {
  return ({ isActive }) =>
    classNames(
      styles.link,
      item.presentation === "area" && styles.areaLink,
      isActive && styles.active,
    );
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
