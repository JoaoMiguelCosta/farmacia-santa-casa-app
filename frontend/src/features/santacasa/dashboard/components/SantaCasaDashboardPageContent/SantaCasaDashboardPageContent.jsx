import PageHeader from "../../../../../shared/ui/PageHeader/PageHeader";

import { SANTACASA_DASHBOARD_PAGE } from "../../config/santaCasaDashboardPage.config";
import { useSantaCasaDashboard } from "../../hooks/useSantaCasaDashboard";

import SantaCasaDashboardSignals from "../SantaCasaDashboardSignals/SantaCasaDashboardSignals";

import styles from "./SantaCasaDashboardPageContent.module.css";

export default function SantaCasaDashboardPageContent() {
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
    </section>
  );
}
