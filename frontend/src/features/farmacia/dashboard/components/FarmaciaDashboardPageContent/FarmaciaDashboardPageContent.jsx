import PageHeader from "../../../../../shared/ui/PageHeader/PageHeader";

import { FARMACIA_DASHBOARD_PAGE } from "../../config/farmaciaDashboardPage.config";
import { useFarmaciaDashboard } from "../../hooks/useFarmaciaDashboard";

import FarmaciaDashboardSignals from "../FarmaciaDashboardSignals/FarmaciaDashboardSignals";

import styles from "./FarmaciaDashboardPageContent.module.css";

export default function FarmaciaDashboardPageContent() {
  const {
    dashboard,

    isLoading,
    isRefreshing,
    error,

    refreshDashboard,
  } = useFarmaciaDashboard();

  return (
    <section className={styles.page} aria-labelledby="farmacia-dashboard-title">
      <PageHeader
        titleId="farmacia-dashboard-title"
        eyebrow={FARMACIA_DASHBOARD_PAGE.header.eyebrow}
        title={FARMACIA_DASHBOARD_PAGE.header.title}
        description={FARMACIA_DASHBOARD_PAGE.header.description}
      />

      <FarmaciaDashboardSignals
        dashboard={dashboard}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        error={error}
        onRefresh={refreshDashboard}
      />
    </section>
  );
}
