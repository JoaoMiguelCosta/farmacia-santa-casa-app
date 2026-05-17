import { Navigate, createBrowserRouter } from "react-router-dom";

import AppShell from "../shared/layouts/AppShell/AppShell.jsx";

import HomePage from "../pages/HomePage.jsx";
import SantaCasaHomePage from "../pages/santacasa/SantaCasaHomePage.jsx";
import SantaCasaUtentesPage from "../pages/santacasa/SantaCasaUtentesPage.jsx";
import SantaCasaOperacaoPage from "../pages/santacasa/SantaCasaOperacaoPage.jsx";
import SantaCasaHistoricoPage from "../pages/santacasa/SantaCasaHistoricoPage.jsx";
import FarmaciaHomePage from "../pages/farmacia/FarmaciaHomePage.jsx";
import FarmaciaDashboardPage from "../pages/farmacia/FarmaciaDashboardPage.jsx";
import NotFoundPage from "../pages/NotFoundPage.jsx";
import SantaCasaPedidosPage from "../pages/santacasa/SantaCasaPedidosPage.jsx";
import FarmaciaPedidosPage from "../pages/farmacia/FarmaciaPedidosPage.jsx";
import FarmaciaHistoricoPage from "../pages/farmacia/FarmaciaHistoricoPage.jsx";
import FarmaciaRegularizacoesPage from "../pages/farmacia/FarmaciaRegularizacoesPage.jsx";
import SantaCasaRegularizacoesPage from "../pages/santacasa/SantaCasaRegularizacoesPage.jsx";
import SantaCasaDashboardPage from "../pages/santacasa/SantaCasaDashboardPage.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "santacasa",
        element: <SantaCasaHomePage />,
      },
      {
        path: "santacasa/dashboard",
        element: <SantaCasaDashboardPage />,
      },
      {
        path: "santacasa/utentes",
        element: <SantaCasaUtentesPage />,
      },
      {
        path: "santacasa/operacao",
        element: <SantaCasaOperacaoPage />,
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
        element: <SantaCasaPedidosPage />,
      },
      {
        path: "santacasa/regularizacoes",
        element: <SantaCasaRegularizacoesPage />,
      },

      {
        path: "santacasa/historico",
        element: <SantaCasaHistoricoPage />,
      },
      {
        path: "farmacia",
        element: <FarmaciaHomePage />,
      },
      {
        path: "farmacia/dashboard",
        element: <FarmaciaDashboardPage />,
      },
      {
        path: "farmacia/pedidos",
        element: <FarmaciaPedidosPage />,
      },
      {
        path: "farmacia/historico",
        element: <FarmaciaHistoricoPage />,
      },
      {
        path: "farmacia/regularizacoes",
        element: <FarmaciaRegularizacoesPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
