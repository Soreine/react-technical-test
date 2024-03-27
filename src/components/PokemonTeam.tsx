import { Pokemon, PokemonSpecies, Stat, Type } from "pokenode-ts";
import { useCallback, useState } from "react";
import usePokeApi, { getLocalizedName, resolveResources } from "src/hooks/usePokeApi";
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

  const teamTypes: Type[] = teamData.reduce((_teamTypes: Type[], member) => {
    if (member.isLoading || !member.data) {
      return _teamTypes;
    }

    const newUniqueTypes = member.data.types.filter((type) => !_teamTypes.map((t) => t.id).includes(type.id));

    return [..._teamTypes, ...newUniqueTypes];
  }, []);

  return (
    <div className="PokemonTeam">
      <h3>Mon équipe</h3>

      <div className="TeamMembers">
        {teamData.map((member) => {
          if (!member.isLoading && member.data) {
            const { pokemon, types } = member.data;
            return (
              <div className="Member">
                <img
                  className="MemberPicture"
                  src={pokemon.sprites.other?.["official-artwork"].front_default ?? "src/assets/pokeball.png"}
                />
                <div className="MemberTypes">
                  {types?.map((t) => (
                    <span key={t.id} className={"pokeType " + t.name}>
                      {getLocalizedName(t)}
                    </span>
                  ))}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromTeam(pokemon.id);
                  }}
                >
                  ❌
                </button>
              </div>
            );
          } else {
            return (
              <div className="Member">
                <img className="MemberPicture" src={"src/assets/pokeball.png"} />;
              </div>
            );
          }
        })}
      </div>

      <TypeSummary types={teamTypes} />
    </div>
  );
}

function TypeSummary({ types }: { types: Type[] }) {
  const allTypesQuery = usePokeApi((api) => api.pokemon.listTypes().then(resolveResources<Type>));

  if (types.length == 0 || allTypesQuery.isLoading || !allTypesQuery.data) {
    return null;
  }

  const allTypes = allTypesQuery.data.results;

  return (
    <table className="TypeSummary">
      <tbody>
        <tr>
          <td colSpan={1}>Type</td>
          <td colSpan={1}>Fort</td>
          <td colSpan={1}>Faible</td>
        </tr>
        {types.map((type) => (
          <tr key={type.id}>
            <td className={"pokeType " + type.name}>{getLocalizedName(type)}</td>
            <td>
              <table style={{ width: "100%" }}>
                <tbody>
                  {type.damage_relations.double_damage_to
                    .map((otherType) => allTypes.find((t) => t.name === otherType.name))
                    .map(
                      (otherType) =>
                        otherType && <tr className={"pokeType " + otherType.name}>{getLocalizedName(otherType)}</tr>
                    )}
                </tbody>
              </table>
            </td>

            <td>
              <table style={{ width: "100%" }}>
                <tbody>
                  {type.damage_relations.double_damage_from
                    .map((otherType) => allTypes.find((t) => t.name === otherType.name))
                    .map(
                      (otherType) =>
                        otherType && <tr className={"pokeType " + otherType.name}>{getLocalizedName(otherType)}</tr>
                    )}
                </tbody>
              </table>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function onlyUnique<T>(value: T, index: number, array: Array<T>): boolean {
  return array.indexOf(value) === index;
}
