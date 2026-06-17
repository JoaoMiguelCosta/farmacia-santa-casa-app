import { RouterProvider } from "react-router-dom";

import AuthProvider from "../features/auth/context/AuthProvider.jsx";
import { PedidoDraftProvider } from "../features/santacasa/pedidos/state/PedidoDraftProvider";

import { router } from "./router/router";

export default function App() {
  return (
    <AuthProvider>
      <PedidoDraftProvider>
        <RouterProvider router={router} />
      </PedidoDraftProvider>
    </AuthProvider>
  );
}
