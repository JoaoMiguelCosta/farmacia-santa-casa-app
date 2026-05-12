import { createBrowserRouter } from "react-router-dom";

import AppShell from "../shared/layouts/AppShell/AppShell.jsx";

import HomePage from "../pages/HomePage.jsx";
import SantaCasaHomePage from "../pages/santacasa/SantaCasaHomePage.jsx";
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
