import { Pokemon, PokemonSpecies, Stat, Type } from "pokenode-ts";
import usePokeApi, { getLocalizedName } from "src/hooks/usePokeApi";

export function PokedexEntry({ pokemon, onClose }: { pokemon: Pokemon; onClose?: () => void }) {
  const { data: species } = usePokeApi((api) => api.utility.getResourceByUrl<PokemonSpecies>(pokemon.species.url), {
    queryKey: pokemon.species.url,
  });

  const { data: types } = usePokeApi(
    (api) => Promise.all(pokemon.types.map(({ type }) => api.utility.getResourceByUrl<Type>(type.url))),
    { queryKey: pokemon.types.map((t) => t.type.url) }
  );

  const { data: stats } = usePokeApi(
    (api) => Promise.all(pokemon.stats.map(({ stat }) => api.utility.getResourceByUrl<Stat>(stat.url))),
    { queryKey: pokemon.stats.map((s) => s.stat.url) }
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
                    height: "10em",
                  }}
                />
              ) : (
                <img
                  src={"src/assets/pokeball.png"}
                  style={{
                    height: "10em",
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
            <td>{pokemon.weight / 10} kg</td>
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
                  <tbody>
                    <tr>
                      {stats.map((s) => (
                        <td key={s.id}>{getLocalizedName(s)}</td>
                      ))}
                    </tr>
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
