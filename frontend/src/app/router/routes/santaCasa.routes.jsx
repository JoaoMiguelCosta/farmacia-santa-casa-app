/* eslint-disable react-refresh/only-export-components */
import { lazy } from "react";
import { Navigate } from "react-router-dom";

import { AUTH_ROLES } from "../../../features/auth/config/auth.config";
import { SANTACASA_ROUTER_PATHS } from "../../../features/santacasa/shared/config/santaCasaRoutes.config";

import { protectedElement } from "../router.utils";

const SantaCasaHomePage = lazy(() =>
  import("../../../pages/santacasa/SantaCasaHomePage.jsx"),
);
const SantaCasaDashboardPage = lazy(() =>
  import("../../../pages/santacasa/SantaCasaDashboardPage.jsx"),
);
const SantaCasaUtentesPage = lazy(() =>
  import("../../../pages/santacasa/SantaCasaUtentesPage.jsx"),
);
const SantaCasaOperacaoPage = lazy(() =>
  import("../../../pages/santacasa/SantaCasaOperacaoPage.jsx"),
);
const SantaCasaPedidosPage = lazy(() =>
  import("../../../pages/santacasa/SantaCasaPedidosPage.jsx"),
);
const SantaCasaPedidoDetailPage = lazy(() =>
  import("../../../pages/santacasa/SantaCasaPedidoDetailPage.jsx"),
);
const SantaCasaRegularizacoesPage = lazy(() =>
  import("../../../pages/santacasa/SantaCasaRegularizacoesPage.jsx"),
);
const SantaCasaRegularizacoesUtentePage = lazy(() =>
  import("../../../pages/santacasa/SantaCasaRegularizacoesUtentePage.jsx"),
);
const SantaCasaRegularizacoesHistoricoUtentePage = lazy(() =>
  import(
    "../../../pages/santacasa/SantaCasaRegularizacoesHistoricoUtentePage.jsx"
  ),
);
const SantaCasaHistoricoPage = lazy(() =>
  import("../../../pages/santacasa/SantaCasaHistoricoPage.jsx"),
);
const SantaCasaHistoricoDetailPage = lazy(() =>
  import("../../../pages/santacasa/SantaCasaHistoricoDetailPage.jsx"),
);

const SANTACASA_ROLES = [AUTH_ROLES.SANTACASA, AUTH_ROLES.ADMIN];

export const santaCasaRoutes = [
  {
    path: SANTACASA_ROUTER_PATHS.home,
    element: protectedElement(<SantaCasaHomePage />, SANTACASA_ROLES),
  },
  {
    path: SANTACASA_ROUTER_PATHS.dashboard,
    element: protectedElement(<SantaCasaDashboardPage />, SANTACASA_ROLES),
  },
  {
    path: SANTACASA_ROUTER_PATHS.utentes,
    element: protectedElement(<SantaCasaUtentesPage />, SANTACASA_ROLES),
  },
  {
    path: SANTACASA_ROUTER_PATHS.operacao,
    element: protectedElement(<SantaCasaOperacaoPage />, SANTACASA_ROLES),
  },
  {
    path: SANTACASA_ROUTER_PATHS.legacyReceitas,
    element: <Navigate to={`/${SANTACASA_ROUTER_PATHS.operacao}`} replace />,
  },
  {
    path: SANTACASA_ROUTER_PATHS.legacySemReceita,
    element: <Navigate to={`/${SANTACASA_ROUTER_PATHS.operacao}`} replace />,
  },
  {
    path: SANTACASA_ROUTER_PATHS.legacyExtras,
    element: <Navigate to={`/${SANTACASA_ROUTER_PATHS.operacao}`} replace />,
  },
  {
    path: SANTACASA_ROUTER_PATHS.pedidos,
    element: protectedElement(<SantaCasaPedidosPage />, SANTACASA_ROLES),
  },
  {
    path: SANTACASA_ROUTER_PATHS.pedidoDetail,
    element: protectedElement(<SantaCasaPedidoDetailPage />, SANTACASA_ROLES),
  },
  {
    path: SANTACASA_ROUTER_PATHS.regularizacoes,
    element: protectedElement(
      <SantaCasaRegularizacoesPage />,
      SANTACASA_ROLES,
    ),
  },
  {
    path: SANTACASA_ROUTER_PATHS.regularizacoesUtente,
    element: protectedElement(
      <SantaCasaRegularizacoesUtentePage />,
      SANTACASA_ROLES,
    ),
  },
  {
    path: SANTACASA_ROUTER_PATHS.regularizacoesHistoricoUtente,
    element: protectedElement(
      <SantaCasaRegularizacoesHistoricoUtentePage />,
      SANTACASA_ROLES,
    ),
  },
  {
    path: SANTACASA_ROUTER_PATHS.historico,
    element: protectedElement(<SantaCasaHistoricoPage />, SANTACASA_ROLES),
  },
  {
    path: SANTACASA_ROUTER_PATHS.historicoDetail,
    element: protectedElement(
      <SantaCasaHistoricoDetailPage />,
      SANTACASA_ROLES,
    ),
  },
];
