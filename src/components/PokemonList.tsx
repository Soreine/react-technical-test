import { Pokemon } from "pokenode-ts";
import usePokeApi, { resolveResources } from "src/hooks/usePokeApi";
import usePokemonNameSearch from "src/hooks/usePokemonNameSearch";
import { PokemonItemPlaceholder } from "./PokemonItemPlaceholder";
import { PokemonItem } from "./PokemonItem";

export function PokemonList({
  searchInput,
  onOpenPokemon,
  team,
  addToTeam,
}: {
  searchInput: string;
  onOpenPokemon: (p: Pokemon | undefined) => void;
  team: number[];
  addToTeam: (id: number) => void;
}) {
  const defaultPokemonList = usePokeApi((api) => api.pokemon.listPokemons(0, 7).then(resolveResources<Pokemon>));

  const searchedPokemons = usePokemonNameSearch(searchInput);
  const placeholderList = Array.from(Array(7).keys()).map((i) => <PokemonItemPlaceholder key={i} />);

  if (searchInput) {
    return (
      <table className="PokemonList">
        <thead>
          <tr>
            <th colSpan={3}>Pokédex</th>
          </tr>
        </thead>
        <tbody>
          {!searchedPokemons.isLoading && !searchedPokemons.error && searchedPokemons.data
            ? searchedPokemons.data.map((pokemon) => (
                <PokemonItem
                  key={pokemon.id}
                  pokemon={pokemon}
                  onClick={() => onOpenPokemon(pokemon)}
                  inTeam={team.includes(pokemon.id)}
                  onAdd={() => addToTeam(pokemon.id)}
                />
              ))
            : placeholderList}
        </tbody>
      </table>
    );
  } else {
    return (
      <table className="PokemonList">
        <tbody>
          {!defaultPokemonList.isLoading && !defaultPokemonList.error && defaultPokemonList.data
            ? defaultPokemonList.data.results.map((pokemon) => (
                <PokemonItem
                  key={pokemon.id}
                  pokemon={pokemon}
                  onClick={() => onOpenPokemon(pokemon)}
                  inTeam={team.includes(pokemon.id)}
                  onAdd={() => addToTeam(pokemon.id)}
                />
              ))
            : placeholderList}
        </tbody>
      </table>
    );
  }
}
