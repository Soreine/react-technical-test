import { Pokemon, PokemonSpecies } from "pokenode-ts";
import { useState } from "react";
import usePokeApi, { getLocalizedName, resolveResources } from "src/hooks/usePokeApi";

interface PokemonProps {
  pokemon: Pokemon;
  onClick?: () => void;
}

function PokemonItem({ pokemon, onClick }: PokemonProps) {
  const { data: species } = usePokeApi((api) => api.utility.getResourceByUrl<PokemonSpecies>(pokemon.species.url));

  console.log(species);
  return (
    <tr onClick={onClick}>
      <td width="1">
        {species ? (
          <img
            src={pokemon.sprites.other?.["official-artwork"].front_default ?? "src/assets/pokeball.png"}
            style={{
              height: "3em",
            }}
          />
        ) : (
          <img
            src={"src/assets/pokeball.png"}
            style={{
              height: "3em",
            }}
          />
        )}
      </td>
      <td>{species && getLocalizedName(species)}</td>
    </tr>
  );
}

function PokedexEntry({ pokemon, onClose }: { pokemon: Pokemon; onClose?: () => void }) {
  const { data: species } = usePokeApi((api) => api.utility.getResourceByUrl<PokemonSpecies>(pokemon.species.url));

  return (
    <div className="PokedexEntry">
      <button onClick={onClose}>Retour</button>
      <table>
        <thead>
          <tr>
            <th>Image</th>
            <th>Nom</th>
          </tr>
        </thead>
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
        </tbody>
      </table>
    </div>
  );
}

function PokemonList() {
  const [openedPokemon, openPokemon] = useState<Pokemon>();
  const { data: pokemonList } = usePokeApi((api) => api.pokemon.listPokemons(0, 10).then(resolveResources<Pokemon>));

  if (!pokemonList) return <div>Chargement ...</div>;

  return (
    <div>
      {openedPokemon && <PokedexEntry pokemon={openedPokemon} />}

      <table
        style={{
          visibility: openedPokemon ? "hidden" : "visible",
        }}
      >
        <tbody>
          {pokemonList.results.map((pokemon) => (
            <PokemonItem key={pokemon.id} pokemon={pokemon} onClick={() => openPokemon(pokemon)} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PokemonList;
