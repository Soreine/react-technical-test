import Fuse from "fuse.js";
import POKEMON_DATA from "../assets/pokemon.json";
import usePokeApi from "./usePokeApi";

// Example:
// const bulbasaur = {
//   names: [
//     { "ja-Hrkt": "フシギダネ" },
//     { roomaji: "Fushigidane" },
//     { ko: "이상해씨" },
//     { "zh-Hant": "妙蛙種子" },
//     { fr: "Bulbizarre" },
//     { de: "Bisasam" },
//     { es: "Bulbasaur" },
//     { it: "Bulbasaur" },
//     { en: "Bulbasaur" },
//     { ja: "フシギダネ" },
//     { "zh-Hans": "妙蛙种子" },
//   ],
//   id: 1,
// };

type PokemonDataEntry = {
  names: Array<{ [lang: string]: string | undefined }>;
  id: number;
};

const options = {
  includeScore: true,
  // Search in french names
  keys: ["names.fr"],
};

const fuse = new Fuse(POKEMON_DATA as Array<PokemonDataEntry>, options);

function usePokemonNameSearch(searchName: string) {
  const searchResults = fuse.search(searchName, { limit: 5 });
  const idResults = searchResults.map((res) => res.item.id);

  const pokemonResults = usePokeApi((api) => Promise.all(idResults.map((id) => api.pokemon.getPokemonById(id))), {
    queryKey: ["search", ...idResults],
  });

  return pokemonResults;
}

export default usePokemonNameSearch;
