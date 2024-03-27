import { Pokemon } from "pokenode-ts";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import { PokedexEntry } from "./PokedexEntry";
import { usePokemonTeam, PokemonTeam } from "./PokemonTeam";
import { PokemonList } from "./PokemonList";

function Pokedex() {
  const [openedPokemon, openPokemon] = useState<Pokemon>();
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearchInput] = useDebounce(searchInput, 500);
  const { team, addToTeam, removeFromTeam } = usePokemonTeam();

  console.log(team);

  return (
    <>
      <div className="PokedexContainer">
        <PokemonTeam team={team} removeFromTeam={removeFromTeam} />

        <p>
          <input
            placeholder="Rechercher"
            autoFocus
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          ></input>
        </p>

        <div className="Pokedex">
          {openedPokemon ? (
            <PokedexEntry pokemon={openedPokemon} onClose={() => openPokemon(undefined)} />
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
      </div>
    </>
  );
}

export default Pokedex;
