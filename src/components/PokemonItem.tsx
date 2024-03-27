import { Pokemon, PokemonSpecies } from "pokenode-ts";
import usePokeApi, { getLocalizedName } from "src/hooks/usePokeApi";
import { PokemonItemPlaceholder } from "./PokemonItemPlaceholder";

export function PokemonItem({
  pokemon,
  onClick,
  onRemove,
  onAdd,
  inTeam,
}: {
  pokemon: Pokemon;
  onClick?: () => void;
  onRemove?: () => void;
  onAdd?: () => void;
  inTeam?: boolean;
}) {
  const { data: species } = usePokeApi((api) => api.utility.getResourceByUrl<PokemonSpecies>(pokemon.species.url));

  if (!species) return <PokemonItemPlaceholder />;

  return (
    <tr
      onClick={onClick}
      style={{
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <td width="1">
        <img
          src={pokemon.sprites.other?.["official-artwork"].front_default ?? "src/assets/pokeball.png"}
          style={{
            height: "3em",
          }}
        />
      </td>

      <td>{getLocalizedName(species)}</td>

      {onRemove && (
        <td style={{ width: 80 }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            ❌
          </button>
        </td>
      )}

      {onAdd && (
        <td style={{ width: 80 }}>
          {inTeam ? (
            <span>☑️</span>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAdd();
              }}
            >
              Ajouter ➕
            </button>
          )}
        </td>
      )}
    </tr>
  );
}
