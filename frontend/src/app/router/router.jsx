import {createBrowserRouter } from "react-router-dom";

import AuthHomeRedirect from "../../features/auth/components/AuthHomeRedirect";
import LoginPage from "../../pages/auth/LoginPage.jsx";
import NotFoundPage from "../../pages/NotFoundPage.jsx";
import AppShell from "../../shared/layouts/AppShell/AppShell.jsx";

import { farmaciaRoutes } from "./routes/farmacia.routes";
import { santaCasaRoutes } from "./routes/santaCasa.routes";
import { systemRoutes } from "./routes/system.routes";

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

      ...santaCasaRoutes,
      ...farmaciaRoutes,
      ...systemRoutes,

      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
