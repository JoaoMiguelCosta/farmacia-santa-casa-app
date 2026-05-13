import { createBrowserRouter } from "react-router-dom";

import AppShell from "../shared/layouts/AppShell/AppShell.jsx";

import HomePage from "../pages/HomePage.jsx";
import SantaCasaHomePage from "../pages/santacasa/SantaCasaHomePage.jsx";
import SantaCasaUtentesPage from "../pages/santacasa/SantaCasaUtentesPage.jsx";
import SantaCasaPlaceholderPage from "../pages/santacasa/SantaCasaPlaceholderPage.jsx";
import FarmaciaHomePage from "../pages/farmacia/FarmaciaHomePage.jsx";
import NotFoundPage from "../pages/NotFoundPage.jsx";
import SantaCasaReceitasPage from "../pages/santacasa/SantaCasaReceitasPage.jsx";
import SantaCasaSemReceitaPage from "../pages/santacasa/SantaCasaSemReceitaPage.jsx";
import SantaCasaExtrasPage from "../pages/santacasa/SantaCasaExtrasPage.jsx";

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
        path: "santacasa/receitas",
        element: <SantaCasaReceitasPage />,
      },
      {
        path: "santacasa/sem-receita",
        element: <SantaCasaSemReceitaPage />,
      },
      {
        path: "santacasa/extras",
        element: <SantaCasaExtrasPage />,
      },
      {
        path: "santacasa/pedidos",
        element: (
          <SantaCasaPlaceholderPage
            title="Pedidos"
            description="Criação de pedidos para validação pela Farmácia."
            nextStep="Este módulo será construído depois dos medicamentos e Extras."
          />
        ),
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
