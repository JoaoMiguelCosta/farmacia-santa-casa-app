// src/pages/santacasa/SantaCasaUtentesPage.jsx
import UtentesPageContent from "../../features/santacasa/utentes/components/UtentesPageContent/UtentesPageContent";
import { useSantaCasaUtentes } from "../../features/santacasa/utentes/hooks/useSantaCasaUtentes";

export default function SantaCasaUtentesPage() {
  const utentesState = useSantaCasaUtentes();

  return <UtentesPageContent {...utentesState} />;
}
