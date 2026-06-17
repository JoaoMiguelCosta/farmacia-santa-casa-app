/* eslint-disable react-refresh/only-export-components */
import { lazy } from "react";

import { AUTH_ROLES } from "../../../features/auth/config/auth.config";
import { FARMACIA_ROUTER_PATHS } from "../../../features/farmacia/shared/config/farmaciaRoutes.config";

import { protectedElement } from "../router.utils";

const FarmaciaHomePage = lazy(() =>
  import("../../../pages/farmacia/FarmaciaHomePage.jsx"),
);
const FarmaciaDashboardPage = lazy(() =>
  import("../../../pages/farmacia/FarmaciaDashboardPage.jsx"),
);
const FarmaciaPedidosPage = lazy(() =>
  import("../../../pages/farmacia/FarmaciaPedidosPage.jsx"),
);
const FarmaciaPedidoDetailPage = lazy(() =>
  import("../../../pages/farmacia/FarmaciaPedidoDetailPage.jsx"),
);
const FarmaciaHistoricoPage = lazy(() =>
  import("../../../pages/farmacia/FarmaciaHistoricoPage.jsx"),
);
const FarmaciaHistoricoDetailPage = lazy(() =>
  import("../../../pages/farmacia/FarmaciaHistoricoDetailPage.jsx"),
);
const FarmaciaRegularizacoesPage = lazy(() =>
  import("../../../pages/farmacia/FarmaciaRegularizacoesPage.jsx"),
);
const FarmaciaRegularizacoesUtentePage = lazy(() =>
  import("../../../pages/farmacia/FarmaciaRegularizacoesUtentePage.jsx"),
);
const FarmaciaRegularizacoesHistoricoUtentePage = lazy(() =>
  import(
    "../../../pages/farmacia/FarmaciaRegularizacoesHistoricoUtentePage.jsx"
  ),
);

const FARMACIA_ROLES = [AUTH_ROLES.FARMACIA, AUTH_ROLES.ADMIN];

export const farmaciaRoutes = [
  {
    path: FARMACIA_ROUTER_PATHS.home,
    element: protectedElement(<FarmaciaHomePage />, FARMACIA_ROLES),
  },
  {
    path: FARMACIA_ROUTER_PATHS.dashboard,
    element: protectedElement(<FarmaciaDashboardPage />, FARMACIA_ROLES),
  },
  {
    path: FARMACIA_ROUTER_PATHS.pedidos,
    element: protectedElement(<FarmaciaPedidosPage />, FARMACIA_ROLES),
  },
  {
    path: FARMACIA_ROUTER_PATHS.pedidoDetail,
    element: protectedElement(<FarmaciaPedidoDetailPage />, FARMACIA_ROLES),
  },
  {
    path: FARMACIA_ROUTER_PATHS.historico,
    element: protectedElement(<FarmaciaHistoricoPage />, FARMACIA_ROLES),
  },
  {
    path: FARMACIA_ROUTER_PATHS.historicoDetail,
    element: protectedElement(<FarmaciaHistoricoDetailPage />, FARMACIA_ROLES),
  },
  {
    path: FARMACIA_ROUTER_PATHS.regularizacoes,
    element: protectedElement(<FarmaciaRegularizacoesPage />, FARMACIA_ROLES),
  },
  {
    path: FARMACIA_ROUTER_PATHS.regularizacoesUtente,
    element: protectedElement(
      <FarmaciaRegularizacoesUtentePage />,
      FARMACIA_ROLES,
    ),
  },
  {
    path: FARMACIA_ROUTER_PATHS.regularizacoesHistoricoUtente,
    element: protectedElement(
      <FarmaciaRegularizacoesHistoricoUtentePage />,
      FARMACIA_ROLES,
    ),
  },
];
