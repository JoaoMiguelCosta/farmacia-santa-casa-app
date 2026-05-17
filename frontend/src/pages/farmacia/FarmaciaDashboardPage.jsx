import PageHeader from "../../shared/ui/PageHeader/PageHeader";

import FarmaciaDashboardQuickLinks from "../../features/farmacia/dashboard/components/FarmaciaDashboardQuickLinks/FarmaciaDashboardQuickLinks";
import FarmaciaDashboardSignals from "../../features/farmacia/dashboard/components/FarmaciaDashboardSignals/FarmaciaDashboardSignals";

import { FARMACIA_DASHBOARD_PAGE } from "../../features/farmacia/dashboard/config/farmaciaDashboardPage.config";
import { useFarmaciaDashboard } from "../../features/farmacia/dashboard/hooks/useFarmaciaDashboard";

import styles from "./FarmaciaDashboardPage.module.css";

export default function FarmaciaDashboardPage() {
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

      <FarmaciaDashboardQuickLinks />
    </section>
  );
}
