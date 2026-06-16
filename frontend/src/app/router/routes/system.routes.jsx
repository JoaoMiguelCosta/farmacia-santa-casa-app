/* eslint-disable react-refresh/only-export-components */
import { lazy } from "react";
import { Navigate } from "react-router-dom";

import { AUTH_ROLES } from "../../../features/auth/config/auth.config";
import {
  SYSTEM_ROUTER_PATHS,
  SYSTEM_ROUTES,
} from "../../../features/system/shared/config/systemRoutes.config";

import { protectedElement } from "../router.utils";

const SystemHomePage = lazy(() =>
  import("../../../pages/system/SystemHomePage.jsx"),
);
const SystemUsersPage = lazy(() =>
  import("../../../pages/system/SystemUsersPage.jsx"),
);
const SystemManutencaoPage = lazy(() =>
  import("../../../pages/system/SystemManutencaoPage.jsx"),
);
const SystemHealthPage = lazy(() =>
  import("../../../pages/system/SystemHealthPage.jsx"),
);

const ADMIN_ROLES = [AUTH_ROLES.ADMIN];

export const systemRoutes = [
  {
    path: SYSTEM_ROUTER_PATHS.home,
    element: protectedElement(<SystemHomePage />, ADMIN_ROLES),
  },
  {
    path: SYSTEM_ROUTER_PATHS.utilizadores,
    element: protectedElement(<SystemUsersPage />, ADMIN_ROLES),
  },
  {
    path: SYSTEM_ROUTER_PATHS.legacyUsers,
    element: <Navigate to={SYSTEM_ROUTES.utilizadores} replace />,
  },
  {
    path: SYSTEM_ROUTER_PATHS.manutencao,
    element: protectedElement(<SystemManutencaoPage />, ADMIN_ROLES),
  },
  {
    path: SYSTEM_ROUTER_PATHS.estadoServicos,
    element: protectedElement(<SystemHealthPage />, ADMIN_ROLES),
  },
  {
    path: SYSTEM_ROUTER_PATHS.legacyHealth,
    element: <Navigate to={SYSTEM_ROUTES.estadoServicos} replace />,
  },
];
