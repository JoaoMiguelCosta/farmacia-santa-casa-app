import Button from "../../../../../shared/ui/Button/Button";

import styles from "./SystemUsersFilters.module.css";

import { SYSTEM_USERS_PAGE } from "../../config/systemUsersPage.config";
import {
  SYSTEM_USERS_ROLE_OPTIONS,
  SYSTEM_USERS_STATUS_OPTIONS,
} from "../../utils/systemUsers.utils";

export default function SystemUsersFilters({
  filters = {},
  isRefreshing = false,
  isDisabled = false,
  onFilterChange,
  onClearFilters,
  onRefresh,
  onCreate,
}) {
  return (
    <section
      className={styles.section}
      aria-labelledby="system-users-filters-title"
    >
      <header className={styles.header}>
        <div className={styles.heading}>
          <h2 id="system-users-filters-title" className={styles.title}>
            {SYSTEM_USERS_PAGE.sections.filters.title}
          </h2>

          <p className={styles.description}>
            {SYSTEM_USERS_PAGE.sections.filters.description}
          </p>
        </div>

        <div className={styles.headerActions}>
          <Button
            variant="secondary"
            size="sm"
            disabled={isDisabled}
            onClick={onClearFilters}
          >
            {SYSTEM_USERS_PAGE.actions.clear}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            disabled={isDisabled || isRefreshing}
            onClick={onRefresh}
          >
            {isRefreshing
              ? SYSTEM_USERS_PAGE.actions.refreshing
              : SYSTEM_USERS_PAGE.actions.refresh}
          </Button>

          <Button
            variant="primary"
            size="sm"
            disabled={isDisabled}
            onClick={onCreate}
          >
            {SYSTEM_USERS_PAGE.actions.create}
          </Button>
        </div>
      </header>

      <div className={styles.filters}>
        <label className={styles.field}>
          <span>{SYSTEM_USERS_PAGE.filters.search.label}</span>

          <input
            type="search"
            value={filters.search ?? ""}
            placeholder={SYSTEM_USERS_PAGE.filters.search.placeholder}
            disabled={isDisabled}
            onChange={(event) => onFilterChange?.("search", event.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span>{SYSTEM_USERS_PAGE.filters.role.label}</span>

          <select
            value={filters.role ?? ""}
            disabled={isDisabled}
            onChange={(event) => onFilterChange?.("role", event.target.value)}
          >
            <option value="">{SYSTEM_USERS_PAGE.filters.role.all}</option>

            {SYSTEM_USERS_ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span>{SYSTEM_USERS_PAGE.filters.isActive.label}</span>

          <select
            value={filters.isActive ?? ""}
            disabled={isDisabled}
            onChange={(event) =>
              onFilterChange?.("isActive", event.target.value)
            }
          >
            {SYSTEM_USERS_STATUS_OPTIONS.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
