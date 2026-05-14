import { Navigate, createBrowserRouter } from "react-router-dom";

import AppShell from "../shared/layouts/AppShell/AppShell.jsx";

import HomePage from "../pages/HomePage.jsx";
import SantaCasaHomePage from "../pages/santacasa/SantaCasaHomePage.jsx";
import SantaCasaUtentesPage from "../pages/santacasa/SantaCasaUtentesPage.jsx";
import SantaCasaOperacaoPage from "../pages/santacasa/SantaCasaOperacaoPage.jsx";
import SantaCasaPlaceholderPage from "../pages/santacasa/SantaCasaPlaceholderPage.jsx";
import FarmaciaHomePage from "../pages/farmacia/FarmaciaHomePage.jsx";
import NotFoundPage from "../pages/NotFoundPage.jsx";

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
        element: <Navigate to="/santacasa/operacao" replace />,
      },

      {
        path: "santacasa/historico",
        element: (
          <SantaCasaPlaceholderPage
            title="Histórico"
            description="Consulta de pedidos fechados e movimentos anteriores."
            nextStep="Este módulo será implementado quando os fluxos principais estiverem fechados."
          />
        ),
      },
      {
        path: "farmacia",
        element: <FarmaciaHomePage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
