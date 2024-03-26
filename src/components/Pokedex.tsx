import { Pokemon, PokemonSpecies, Stat, Type } from "pokenode-ts";
import { useState } from "react";
import usePokeApi, { getLocalizedName, resolveResources } from "src/hooks/usePokeApi";
import usePokemonNameSearch from "src/hooks/usePokemonNameSearch";
import { useDebounce } from "use-debounce";

interface PokemonProps {
  pokemon: Pokemon;
  onClick?: () => void;
}

function PokemonItem({ pokemon, onClick }: PokemonProps) {
  const { data: species } = usePokeApi((api) => api.utility.getResourceByUrl<PokemonSpecies>(pokemon.species.url));

  if (!species) return <PokemonItemPlaceholder />;

  return (
    <tr onClick={onClick}>
      <td width="1">
        <img
          src={pokemon.sprites.other?.["official-artwork"].front_default ?? "src/assets/pokeball.png"}
          style={{
            height: "3em",
          }}
        />
      </td>
      <td>{getLocalizedName(species)}</td>
    </tr>
  );
}

function PokemonItemPlaceholder() {
  return (
    <tr>
      <td width="1">
        <img
          src={"src/assets/pokeball.png"}
          style={{
            height: "3em",
          }}
        />
      </td>
      <td></td>
    </tr>
  );
}

function PokedexEntry({ pokemon, onClose }: { pokemon: Pokemon; onClose?: () => void }) {
  const { data: species } = usePokeApi((api) => api.utility.getResourceByUrl<PokemonSpecies>(pokemon.species.url));

  const { data: types } = usePokeApi((api) =>
    Promise.all(pokemon.types.map(({ type }) => api.utility.getResourceByUrl<Type>(type.url)))
  );

  const { data: stats } = usePokeApi((api) =>
    Promise.all(pokemon.stats.map(({ stat }) => api.utility.getResourceByUrl<Stat>(stat.url)))
  );

  return (
    <div className="PokedexEntry">
      <p>
        <button onClick={onClose}>Retour</button>
      </p>

      <table>
        <tbody>
          <tr>
            <td width="1">
              {species ? (
                <img
                  src={pokemon.sprites.other?.["official-artwork"].front_default ?? "src/assets/pokeball.png"}
                  style={{
                    height: "8em",
                  }}
                />
              ) : (
                <img
                  src={"src/assets/pokeball.png"}
                  style={{
                    height: "8em",
                  }}
                />
              )}
            </td>
            <td>{species && getLocalizedName(species)}</td>
          </tr>

          <tr>
            <td>Taille</td>
            <td>{pokemon.height / 10} m</td>
          </tr>

          <tr>
            <td>Poids</td>
            <td>{pokemon.weight} kg</td>
          </tr>

          <tr>
            <td>Types</td>
            <td>
              {types?.map((t) => (
                <span key={t.id} className={"pokeType " + t.name}>
                  {getLocalizedName(t)}
                </span>
              ))}
            </td>
          </tr>

          <tr>
            <td>Stats</td>

            <td>
              {stats && (
                <table>
                  <thead>
                    <tr>
                      {stats.map((s) => (
                        <td key={s.id}>{getLocalizedName(s)}</td>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      {pokemon.stats.map((stat) => (
                        <td key={stat.stat.name}>{stat.base_stat}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function PokemonList({
  searchInput,
  onOpenPokemon,
}: {
  searchInput: string;
  onOpenPokemon: (p: Pokemon | undefined) => void;
}) {
  const defaultPokemonList = usePokeApi((api) => api.pokemon.listPokemons(0, 5).then(resolveResources<Pokemon>));

  const searchedPokemons = usePokemonNameSearch(searchInput);
  const placeholderList = Array.from(Array(5).keys()).map((i) => <PokemonItemPlaceholder key={i} />);

  if (searchInput) {
    return (
      <table>
        <tbody>
          {!searchedPokemons.isLoading && !searchedPokemons.error && searchedPokemons.data
            ? searchedPokemons.data.map((pokemon) => (
                <PokemonItem key={pokemon.id} pokemon={pokemon} onClick={() => onOpenPokemon(pokemon)} />
              ))
            : placeholderList}
        </tbody>
      </table>
    );
  } else {
    return (
      <table>
        <tbody>
          {!defaultPokemonList.isLoading && !defaultPokemonList.error && defaultPokemonList.data
            ? defaultPokemonList.data.results.map((pokemon) => (
                <PokemonItem key={pokemon.id} pokemon={pokemon} onClick={() => onOpenPokemon(pokemon)} />
              ))
            : placeholderList}
        </tbody>
      </table>
    );
  }
}

function Pokedex() {
  const [openedPokemon, openPokemon] = useState<Pokemon>();
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearchInput] = useDebounce(searchInput, 500);

  return (
    <div>
      {openedPokemon ? (
        <PokedexEntry pokemon={openedPokemon} onClose={() => openPokemon(undefined)} />
      ) : (
        <>
          <p>
            <input
              placeholder="Search"
              autoFocus
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            ></input>
          </p>

          <PokemonList searchInput={debouncedSearchInput} onOpenPokemon={openPokemon} />
        </>
      )}
    </div>
  );
}

export default Pokedex;
