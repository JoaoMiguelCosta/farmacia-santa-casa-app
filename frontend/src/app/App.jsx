import { RouterProvider } from "react-router-dom";

import { PedidoDraftProvider } from "../features/santacasa/pedidos/state/PedidoDraftProvider";
import { router } from "./router";

export default function App() {
  return (
    <PedidoDraftProvider>
      <RouterProvider router={router} />
    </PedidoDraftProvider>
  );
}
