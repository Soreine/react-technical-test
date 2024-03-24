import { Pokemon, PokemonSpecies, Stat, Type } from "pokenode-ts";
import { useEffect, useState } from "react";
import usePokeApi, { getLocalizedName, resolveResources } from "src/hooks/usePokeApi";

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
                <span className={"pokeType " + t.name}>{getLocalizedName(t)}</span>
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

function PokemonList() {
  const [openedPokemon, openPokemon] = useState<Pokemon>();
  const [searchInput, setSearchInput] = useState("");
  const { data: pokemonList } = usePokeApi((api) => api.pokemon.listPokemons(0, 10).then(resolveResources<Pokemon>));

  const { data: pokemonSearch } = usePokeApi((api) => api.pokemon.getPokemonByName(searchInput), {
    queryKey: searchInput,
  });

  console.log({ pokemonSearch });

  return (
    <div>
      <p>
        <input
          placeholder="Search"
          autoFocus
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        ></input>
      </p>

      {openedPokemon && <PokedexEntry pokemon={openedPokemon} onClose={() => openPokemon(undefined)} />}

      <table
        style={{
          display: openedPokemon ? "none" : undefined,
        }}
      >
        <tbody>
          {pokemonList
            ? pokemonList.results.map((pokemon) => (
                <PokemonItem key={pokemon.id} pokemon={pokemon} onClick={() => openPokemon(pokemon)} />
              ))
            : Array.from(Array(10).keys()).map((i) => <PokemonItemPlaceholder key={i} />)}
        </tbody>
      </table>
    </div>
  );
}

export default PokemonList;
