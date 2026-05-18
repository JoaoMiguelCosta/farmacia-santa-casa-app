import { Navigate, createBrowserRouter } from "react-router-dom";

import { AUTH_ROLES } from "../features/auth/config/auth.config";
import AuthHomeRedirect from "../features/auth/components/AuthHomeRedirect";
import RequireAuth from "../features/auth/components/RequireAuth";
import RequireRole from "../features/auth/components/RequireRole";

import AppShell from "../shared/layouts/AppShell/AppShell.jsx";

import NotFoundPage from "../pages/NotFoundPage.jsx";

import LoginPage from "../pages/auth/LoginPage.jsx";

import SantaCasaHomePage from "../pages/santacasa/SantaCasaHomePage.jsx";
import SantaCasaDashboardPage from "../pages/santacasa/SantaCasaDashboardPage.jsx";
import SantaCasaUtentesPage from "../pages/santacasa/SantaCasaUtentesPage.jsx";
import SantaCasaOperacaoPage from "../pages/santacasa/SantaCasaOperacaoPage.jsx";
import SantaCasaPedidosPage from "../pages/santacasa/SantaCasaPedidosPage.jsx";
import SantaCasaRegularizacoesPage from "../pages/santacasa/SantaCasaRegularizacoesPage.jsx";
import SantaCasaHistoricoPage from "../pages/santacasa/SantaCasaHistoricoPage.jsx";

import FarmaciaHomePage from "../pages/farmacia/FarmaciaHomePage.jsx";
import FarmaciaDashboardPage from "../pages/farmacia/FarmaciaDashboardPage.jsx";
import FarmaciaPedidosPage from "../pages/farmacia/FarmaciaPedidosPage.jsx";
import FarmaciaHistoricoPage from "../pages/farmacia/FarmaciaHistoricoPage.jsx";
import FarmaciaRegularizacoesPage from "../pages/farmacia/FarmaciaRegularizacoesPage.jsx";

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
        path: "santacasa",
        element: protectedElement(<SantaCasaHomePage />, SANTACASA_ROLES),
      },
      {
        path: "santacasa/dashboard",
        element: protectedElement(<SantaCasaDashboardPage />, SANTACASA_ROLES),
      },
      {
        path: "santacasa/utentes",
        element: protectedElement(<SantaCasaUtentesPage />, SANTACASA_ROLES),
      },
      {
        path: "santacasa/operacao",
        element: protectedElement(<SantaCasaOperacaoPage />, SANTACASA_ROLES),
      },
      {
        path: "santacasa/receitas",
        element: <Navigate to="/santacasa/operacao" replace />,
      },
      {
        path: "santacasa/sem-receita",
        element: <Navigate to="/santacasa/operacao" replace />,
      },
      {
        path: "santacasa/extras",
        element: <Navigate to="/santacasa/operacao" replace />,
      },
      {
        path: "santacasa/pedidos",
        element: protectedElement(<SantaCasaPedidosPage />, SANTACASA_ROLES),
      },
      {
        path: "santacasa/regularizacoes",
        element: protectedElement(
          <SantaCasaRegularizacoesPage />,
          SANTACASA_ROLES,
        ),
      },
      {
        path: "santacasa/historico",
        element: protectedElement(<SantaCasaHistoricoPage />, SANTACASA_ROLES),
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
        path: "farmacia/historico",
        element: protectedElement(<FarmaciaHistoricoPage />, FARMACIA_ROLES),
      },
      {
        path: "farmacia/regularizacoes",
        element: protectedElement(
          <FarmaciaRegularizacoesPage />,
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
        path: "sistema/manutencao",
        element: protectedElement(<SystemManutencaoPage />, ADMIN_ROLES),
      },

      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
