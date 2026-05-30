import PageHeader from "../../shared/ui/PageHeader/PageHeader";


import SantaCasaDashboardQuickLinks from "../../features/santacasa/dashboard/components/SantaCasaDashboardQuickLinks/SantaCasaDashboardQuickLinks";
import SantaCasaDashboardSignals from "../../features/santacasa/dashboard/components/SantaCasaDashboardSignals/SantaCasaDashboardSignals";

import { SANTACASA_DASHBOARD_PAGE } from "../../features/santacasa/dashboard/config/santaCasaDashboardPage.config";
import { useSantaCasaDashboard } from "../../features/santacasa/dashboard/hooks/useSantaCasaDashboard";

import styles from "./SantaCasaDashboardPage.module.css";

export default function SantaCasaDashboardPage() {
  const { dashboard, isLoading, isRefreshing, error, refreshDashboard } =
    useSantaCasaDashboard();

  return (
    <section
      className={styles.page}
      aria-labelledby="santacasa-dashboard-title"
    >
      <PageHeader
        titleId="santacasa-dashboard-title"
        eyebrow={SANTACASA_DASHBOARD_PAGE.header.eyebrow}
        title={SANTACASA_DASHBOARD_PAGE.header.title}
        description={SANTACASA_DASHBOARD_PAGE.header.description}
      />

     

      <SantaCasaDashboardSignals
        dashboard={dashboard}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        error={error}
        onRefresh={refreshDashboard}
      />

      <SantaCasaDashboardQuickLinks />
    </section>
  );
}
