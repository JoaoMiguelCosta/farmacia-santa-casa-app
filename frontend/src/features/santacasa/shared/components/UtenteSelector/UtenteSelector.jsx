import FormField from "../../../../../shared/ui/FormField/FormField";
import SurfaceCard from "../../../../../shared/ui/SurfaceCard/SurfaceCard";

export default function UtenteSelector({
  utentes = [],
  value = "",
  onChange,
  isLoading = false,
  error = null,
}) {
  return (
    <SurfaceCard
      title="Selecionar utente"
      description="Escolhe o utente para consultar ou registar dados."
      tone="strong"
    >
      <FormField
        id="utente-selector"
        label="Utente"
        hint={
          isLoading
            ? "A carregar utentes..."
            : "A lista mostra apenas utentes ativos."
        }
        error={error}
        required
      >
        <select
          id="utente-selector"
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          disabled={isLoading || Boolean(error)}
        >
          <option value="">Seleciona um utente</option>

          {utentes.map((utente) => (
            <option key={utente.id} value={utente.id}>
              {utente.nome} — {utente.numero9}
            </option>
          ))}
        </select>
      </FormField>
    </SurfaceCard>
  );
}
