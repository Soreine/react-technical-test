import { Pokemon, PokemonSpecies, Stat, Type } from "pokenode-ts";
import { useCallback, useState } from "react";
import usePokeApi, { getLocalizedName, resolveResources } from "src/hooks/usePokeApi";
import usePokemonNameSearch from "src/hooks/usePokemonNameSearch";
import { useDebounce } from "use-debounce";

const MAX_TEAM_SIZE = 6;

function PokemonItem({
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
            🗑
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

function PokedexEntry({
  pokemon,
  onClose,
  inTeam,
  addToTeam,
}: {
  pokemon: Pokemon;
  onClose?: () => void;
  inTeam: boolean;
  addToTeam: (id: number) => void;
}) {
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
            <td>
              <button onClick={() => addToTeam(pokemon.id)}>Add ➕</button>
            </td>
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
  team,
  addToTeam,
}: {
  searchInput: string;
  onOpenPokemon: (p: Pokemon | undefined) => void;
  team: number[];
  addToTeam: (id: number) => void;
}) {
  const defaultPokemonList = usePokeApi((api) => api.pokemon.listPokemons(0, 5).then(resolveResources<Pokemon>));

  const searchedPokemons = usePokemonNameSearch(searchInput);
  const placeholderList = Array.from(Array(5).keys()).map((i) => <PokemonItemPlaceholder key={i} />);

  if (searchInput) {
    return (
      <table className="PokemonList">
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

function usePokemonTeam() {
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

function PokemonTeam({ team, removeFromTeam }: { team: number[]; removeFromTeam: (id: number) => void }) {
  const pokemonTeam = Array.from(Array(MAX_TEAM_SIZE).keys()).map((i) => {
    const id = team[i];

    // To avoid reloading of the entire list every time one pokemon changes,
    // and because we know we have a fixed number of pokemon,
    // we make one usePokeApi call per pokemon in the team.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return usePokeApi<Pokemon | null>(
      (api) => {
        if (id !== undefined) {
          return api.pokemon.getPokemonById(id);
        } else {
          return Promise.resolve(null);
        }
      },
      { queryKey: ["team", id] }
    );
  });

  return (
    <table className="PokemonTeam">
      <tbody>
        {pokemonTeam.map((pokemon) => {
          if (!pokemon.isLoading && pokemon.data) {
            const id = pokemon.data.id;
            return <PokemonItem key={id} pokemon={pokemon.data} onRemove={() => removeFromTeam(id)} />;
          } else {
            return <PokemonItemPlaceholder />;
          }
        })}
      </tbody>
    </table>
  );
}

function Pokedex() {
  const [openedPokemon, openPokemon] = useState<Pokemon>();
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearchInput] = useDebounce(searchInput, 500);
  const { team, addToTeam, removeFromTeam } = usePokemonTeam();

  console.log(team);

  return (
    <>
      <p>
        <input
          placeholder="Rechercher"
          autoFocus
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        ></input>
      </p>

      <div className="PokedexContainer">
        <div className="Pokedex">
          {openedPokemon ? (
            <PokedexEntry
              pokemon={openedPokemon}
              onClose={() => openPokemon(undefined)}
              inTeam={team.includes(openedPokemon.id)}
              addToTeam={addToTeam}
            />
          ) : (
            <>
              <PokemonList
                searchInput={debouncedSearchInput}
                onOpenPokemon={openPokemon}
                team={team}
                addToTeam={addToTeam}
              />
            </>
          )}
        </div>

        <PokemonTeam team={team} removeFromTeam={removeFromTeam} />
      </div>
    </>
  );
}

export default Pokedex;
