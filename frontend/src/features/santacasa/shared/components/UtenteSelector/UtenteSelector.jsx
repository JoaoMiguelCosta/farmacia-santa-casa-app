import FormField from "../../../../../shared/ui/FormField/FormField";
import SurfaceCard from "../../../../../shared/ui/SurfaceCard/SurfaceCard";

export default function UtenteSelector({
  utentes = [],
  value = "",
  onChange,
  isLoading = false,
  error = null,
}) {
  const hasUtentes = utentes.length > 0;
  const isDisabled = isLoading || !hasUtentes;

  const hint = isLoading
    ? "A carregar utentes..."
    : hasUtentes
      ? "Escolhe o utente para carregar os dados da operação."
      : "Ainda não existem utentes disponíveis.";

  return (
    <SurfaceCard
      title="Selecionar utente"
      description="Escolhe o utente para consultar ou registar dados."
      tone="strong"
    >
      <FormField
        id="utente-selector"
        label="Utente"
        hint={hint}
        error={error}
        required
      >
        <select
          id="utente-selector"
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          disabled={isDisabled}
        >
          <option value="">
            {hasUtentes ? "Seleciona um utente" : "Nenhum utente disponível"}
          </option>

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
