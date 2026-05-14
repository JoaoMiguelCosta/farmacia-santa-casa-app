import { useEffect, useMemo, useState } from "react";

import { getSystemHealth } from "../../api/systemApi";
import { SYSTEM_HEALTH_CHECKS } from "../../config/systemHealth.config";

import styles from "./SystemHealthPanel.module.css";

const STATUS = Object.freeze({
  idle: "idle",
  loading: "loading",
  online: "online",
  offline: "offline",
});

function getInitialItems() {
  return SYSTEM_HEALTH_CHECKS.map((item) => ({
    ...item,
    status: STATUS.loading,
    payload: null,
    error: null,
  }));
}

function getStatusLabel(status) {
  if (status === STATUS.loading) return "A verificar";
  if (status === STATUS.online) return "Online";
  if (status === STATUS.offline) return "Offline";

  return "Pendente";
}

function getStatusClassName(status) {
  return `${styles.statusDot} ${styles[status] || styles.idle}`;
}

function buildOfflineItems(errorMessage = "Erro ao contactar a API.") {
  return SYSTEM_HEALTH_CHECKS.map((item) => ({
    ...item,
    status: STATUS.offline,
    payload: null,
    error: errorMessage,
  }));
}

function buildUpdatedItems(results) {
  return SYSTEM_HEALTH_CHECKS.map((item, index) => {
    const result = results[index];

    if (result.status === "fulfilled") {
      return {
        ...item,
        status: STATUS.online,
        payload: result.value,
        error: null,
      };
    }

    return {
      ...item,
      status: STATUS.offline,
      payload: null,
      error: result.reason?.message || "Erro ao contactar a API.",
    };
  });
}

async function fetchHealthItems() {
  try {
    const results = await Promise.allSettled(
      SYSTEM_HEALTH_CHECKS.map((item) => getSystemHealth(item.endpointKey)),
    );

    return buildUpdatedItems(results);
  } catch (error) {
    return buildOfflineItems(error?.message || "Erro ao contactar a API.");
  }
}

export default function SystemHealthPanel() {
  const [items, setItems] = useState(getInitialItems);
  const [isRefreshing, setIsRefreshing] = useState(true);

  const hasOfflineServices = useMemo(
    () => items.some((item) => item.status === STATUS.offline),
    [items],
  );

  const isChecking = useMemo(
    () => items.some((item) => item.status === STATUS.loading),
    [items],
  );

  async function handleRefresh() {
    setIsRefreshing(true);

    setItems((currentItems) =>
      currentItems.map((item) => ({
        ...item,
        status: STATUS.loading,
        payload: null,
        error: null,
      })),
    );

    const updatedItems = await fetchHealthItems();

    setItems(updatedItems);
    setIsRefreshing(false);
  }

  useEffect(() => {
    let isMounted = true;

    async function loadInitialHealthChecks() {
      try {
        const updatedItems = await fetchHealthItems();

        if (!isMounted) return;

        setItems(updatedItems);
      } finally {
        if (isMounted) {
          setIsRefreshing(false);
        }
      }
    }

    loadInitialHealthChecks();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section
      className={styles.panel}
      aria-labelledby="system-health-title"
      aria-busy={isChecking}
    >
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <p className={styles.kicker}>Ligação ao backend</p>

          <h2 id="system-health-title" className={styles.title}>
            Estado dos serviços
          </h2>

          <p className={styles.description}>
            Confirma se o frontend está a comunicar corretamente com a API.
          </p>
        </div>

        <button
          className={styles.refreshButton}
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          aria-label="Atualizar estado dos serviços"
        >
          {isRefreshing ? "A verificar..." : "Atualizar"}
        </button>
      </div>

      {hasOfflineServices ? (
        <p className={styles.warning} role="alert">
          Há serviços indisponíveis. Confirma se o backend está ativo em
          http://localhost:3001.
        </p>
      ) : null}

      <div className={styles.grid} role="list" aria-live="polite">
        {items.map((item) => (
          <article key={item.key} className={styles.card} role="listitem">
            <div className={styles.cardTop}>
              <span
                className={getStatusClassName(item.status)}
                aria-hidden="true"
              />

              <span className={styles.statusText}>
                {getStatusLabel(item.status)}
              </span>
            </div>

            <h3 className={styles.cardTitle}>{item.title}</h3>

            <p className={styles.cardDescription}>{item.description}</p>

            {item.payload ? (
              <pre className={styles.payload}>
                {JSON.stringify(item.payload, null, 2)}
              </pre>
            ) : null}

            {item.error ? <p className={styles.error}>{item.error}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
