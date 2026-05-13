import { createBrowserRouter } from "react-router-dom";

import AppShell from "../shared/layouts/AppShell/AppShell.jsx";

import HomePage from "../pages/HomePage.jsx";
import SantaCasaHomePage from "../pages/santacasa/SantaCasaHomePage.jsx";
import SantaCasaUtentesPage from "../pages/santacasa/SantaCasaUtentesPage.jsx";
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
        path: "santacasa/receitas",
        element: (
          <SantaCasaPlaceholderPage
            title="Receitas"
            description="Criação e consulta de receitas associadas a utentes."
            nextStep="Este será o próximo módulo real a implementar."
          />
        ),
      },
      {
        path: "santacasa/sem-receita",
        element: (
          <SantaCasaPlaceholderPage
            title="Sem Receita"
            description="Gestão de medicamentos disponíveis sem receita."
            nextStep="Este módulo será implementado depois das receitas."
          />
        ),
      },
      {
        path: "santacasa/extras",
        element: (
          <SantaCasaPlaceholderPage
            title="Extras"
            description="Gestão de vendas suspensas e saldos por regularizar."
            nextStep="Este módulo será implementado depois de Sem Receita."
          />
        ),
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
