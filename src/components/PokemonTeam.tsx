import { Pokemon, PokemonSpecies, Stat, Type } from "pokenode-ts";
import { useCallback, useState } from "react";
import usePokeApi from "src/hooks/usePokeApi";
import { PokemonItemPlaceholder } from "./PokemonItemPlaceholder";
import { PokemonItem } from "./PokemonItem";

export const MAX_TEAM_SIZE = 6;

export function usePokemonTeam() {
  const [team, setTeam] = useState<number[]>([]);

  const addToTeam = useCallback(
    (id: number) => {
      if (team.includes(id)) return;

      setTeam([...team, id].slice(0, MAX_TEAM_SIZE));
    },
    [setTeam, team]
  );

  const removeFromTeam = useCallback(
    (id: number) => {
      setTeam(team.filter((_id) => _id !== id));
    },
    [setTeam, team]
  );

  return {
    team,
    addToTeam,
    removeFromTeam,
  };
}

export function PokemonTeam({ team, removeFromTeam }: { team: number[]; removeFromTeam: (id: number) => void }) {
  const teamData = Array.from(Array(MAX_TEAM_SIZE).keys()).map((i) => {
    const id = team[i];

    // To avoid reloading of the entire list every time one pokemon changes,
    // and because we know we have a fixed number of pokemon,
    // we make one usePokeApi call per pokemon in the team.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return usePokeApi<{ pokemon: Pokemon; species: PokemonSpecies; types: Type[]; stats: Stat[] } | null>(
      async (api) => {
        if (id !== undefined) {
          const pokemon = await api.pokemon.getPokemonById(id);

          const [species, types, stats] = await Promise.all([
            api.utility.getResourceByUrl<PokemonSpecies>(pokemon.species.url),
            Promise.all(pokemon.types.map(({ type }) => api.utility.getResourceByUrl<Type>(type.url))),
            Promise.all(pokemon.stats.map(({ stat }) => api.utility.getResourceByUrl<Stat>(stat.url))),
          ]);

          return { pokemon, species, types, stats };
        } else {
          return null;
        }
      },
      { queryKey: ["team", id] }
    );
  });

  return (
    <table className="PokemonTeam">
      <thead>
        <tr>
          <th colSpan={3}>Mon équipe</th>
        </tr>
      </thead>
      <tbody>
        {teamData.map((member) => {
          if (!member.isLoading && member.data) {
            const id = member.data.pokemon.id;
            return <PokemonItem key={id} pokemon={member.data.pokemon} onRemove={() => removeFromTeam(id)} />;
          } else {
            return <PokemonItemPlaceholder />;
          }
        })}
      </tbody>
    </table>
  );
}
