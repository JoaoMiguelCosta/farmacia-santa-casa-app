// src/app/router.jsx

import { Navigate, createBrowserRouter } from "react-router-dom";

import AuthHomeRedirect from "../features/auth/components/AuthHomeRedirect";
import RequireAuth from "../features/auth/components/RequireAuth";
import RequireRole from "../features/auth/components/RequireRole";
import { AUTH_ROLES } from "../features/auth/config/auth.config";

import { SANTACASA_ROUTER_PATHS } from "../features/santacasa/shared/config/santaCasaRoutes.config";

import AppShell from "../shared/layouts/AppShell/AppShell.jsx";

import NotFoundPage from "../pages/NotFoundPage.jsx";

import LoginPage from "../pages/auth/LoginPage.jsx";

import SantaCasaHomePage from "../pages/santacasa/SantaCasaHomePage.jsx";
import SantaCasaDashboardPage from "../pages/santacasa/SantaCasaDashboardPage.jsx";
import SantaCasaUtentesPage from "../pages/santacasa/SantaCasaUtentesPage.jsx";
import SantaCasaOperacaoPage from "../pages/santacasa/SantaCasaOperacaoPage.jsx";
import SantaCasaPedidosPage from "../pages/santacasa/SantaCasaPedidosPage.jsx";
import SantaCasaPedidoDetailPage from "../pages/santacasa/SantaCasaPedidoDetailPage.jsx";
import SantaCasaRegularizacoesPage from "../pages/santacasa/SantaCasaRegularizacoesPage.jsx";
import SantaCasaRegularizacoesUtentePage from "../pages/santacasa/SantaCasaRegularizacoesUtentePage.jsx";
import SantaCasaRegularizacoesHistoricoUtentePage from "../pages/santacasa/SantaCasaRegularizacoesHistoricoUtentePage.jsx";
import SantaCasaHistoricoPage from "../pages/santacasa/SantaCasaHistoricoPage.jsx";
import SantaCasaHistoricoDetailPage from "../pages/santacasa/SantaCasaHistoricoDetailPage.jsx";

import FarmaciaHomePage from "../pages/farmacia/FarmaciaHomePage.jsx";
import FarmaciaDashboardPage from "../pages/farmacia/FarmaciaDashboardPage.jsx";
import FarmaciaPedidosPage from "../pages/farmacia/FarmaciaPedidosPage.jsx";
import FarmaciaPedidoDetailPage from "../pages/farmacia/FarmaciaPedidoDetailPage.jsx";
import FarmaciaHistoricoPage from "../pages/farmacia/FarmaciaHistoricoPage.jsx";
import FarmaciaHistoricoDetailPage from "../pages/farmacia/FarmaciaHistoricoDetailPage.jsx";
import FarmaciaRegularizacoesPage from "../pages/farmacia/FarmaciaRegularizacoesPage.jsx";
import FarmaciaRegularizacoesUtentePage from "../pages/farmacia/FarmaciaRegularizacoesUtentePage.jsx";
import FarmaciaRegularizacoesHistoricoUtentePage from "../pages/farmacia/FarmaciaRegularizacoesHistoricoUtentePage.jsx";

import SystemHealthPage from "../pages/system/SystemHealthPage.jsx";
import SystemHomePage from "../pages/system/SystemHomePage.jsx";
import SystemManutencaoPage from "../pages/system/SystemManutencaoPage.jsx";
import SystemUsersPage from "../pages/system/SystemUsersPage.jsx";

const SANTACASA_ROLES = [AUTH_ROLES.SANTACASA, AUTH_ROLES.ADMIN];

const FARMACIA_ROLES = [AUTH_ROLES.FARMACIA, AUTH_ROLES.ADMIN];

const ADMIN_ROLES = [AUTH_ROLES.ADMIN];

function protectedElement(element, allowedRoles) {
  return (
    <RequireAuth>
      <RequireRole allowedRoles={allowedRoles}>{element}</RequireRole>
    </RequireAuth>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,

    children: [
      {
        index: true,
        element: <AuthHomeRedirect />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },

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
        element: <Navigate to={SANTACASA_ROUTER_PATHS.operacao} replace />,
      },
      {
        path: SANTACASA_ROUTER_PATHS.legacySemReceita,
        element: <Navigate to={SANTACASA_ROUTER_PATHS.operacao} replace />,
      },
      {
        path: SANTACASA_ROUTER_PATHS.legacyExtras,
        element: <Navigate to={SANTACASA_ROUTER_PATHS.operacao} replace />,
      },
      {
        path: SANTACASA_ROUTER_PATHS.pedidos,
        element: protectedElement(<SantaCasaPedidosPage />, SANTACASA_ROLES),
      },
      {
        path: SANTACASA_ROUTER_PATHS.pedidoDetail,
        element: protectedElement(
          <SantaCasaPedidoDetailPage />,
          SANTACASA_ROLES,
        ),
      },
      {
        path: SANTACASA_ROUTER_PATHS.regularizacoes,
        element: protectedElement(
          <SantaCasaRegularizacoesPage />,
          SANTACASA_ROLES,
        ),
      },
      {
        path: "santacasa/regularizacoes/utente/:utenteId",
        element: protectedElement(
          <SantaCasaRegularizacoesUtentePage />,
          SANTACASA_ROLES,
        ),
      },
      {
        path: "santacasa/regularizacoes/utente/:utenteId/historico",
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

      {
        path: "farmacia",
        element: protectedElement(<FarmaciaHomePage />, FARMACIA_ROLES),
      },
      {
        path: "farmacia/dashboard",
        element: protectedElement(<FarmaciaDashboardPage />, FARMACIA_ROLES),
      },
      {
        path: "farmacia/pedidos",
        element: protectedElement(<FarmaciaPedidosPage />, FARMACIA_ROLES),
      },
      {
        path: "farmacia/pedidos/:pedidoId",
        element: protectedElement(<FarmaciaPedidoDetailPage />, FARMACIA_ROLES),
      },
      {
        path: "farmacia/historico",
        element: protectedElement(<FarmaciaHistoricoPage />, FARMACIA_ROLES),
      },
      {
        path: "farmacia/historico/:pedidoId",
        element: protectedElement(
          <FarmaciaHistoricoDetailPage />,
          FARMACIA_ROLES,
        ),
      },
      {
        path: "farmacia/regularizacoes",
        element: protectedElement(
          <FarmaciaRegularizacoesPage />,
          FARMACIA_ROLES,
        ),
      },
      {
        path: "farmacia/regularizacoes/utente/:utenteId",
        element: protectedElement(
          <FarmaciaRegularizacoesUtentePage />,
          FARMACIA_ROLES,
        ),
      },
      {
        path: "farmacia/regularizacoes/utente/:utenteId/historico",
        element: protectedElement(
          <FarmaciaRegularizacoesHistoricoUtentePage />,
          FARMACIA_ROLES,
        ),
      },

      {
        path: "sistema",
        element: protectedElement(<SystemHomePage />, ADMIN_ROLES),
      },
      {
        path: "sistema/utilizadores",
        element: protectedElement(<SystemUsersPage />, ADMIN_ROLES),
      },
      {
        path: "sistema/users",
        element: <Navigate to="/sistema/utilizadores" replace />,
      },
      {
        path: "sistema/manutencao",
        element: protectedElement(<SystemManutencaoPage />, ADMIN_ROLES),
      },
      {
        path: "sistema/estado-servicos",
        element: protectedElement(<SystemHealthPage />, ADMIN_ROLES),
      },
      {
        path: "sistema/health",
        element: <Navigate to="/sistema/estado-servicos" replace />,
      },

      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
