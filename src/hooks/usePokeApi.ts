import { MainClient, Name, NamedAPIResourceList } from "pokenode-ts";
import { UseBaseQueryOptions, useQuery } from "react-query";
import { useId } from "react";

const api = new MainClient();

/**
 * @link https://pokenode-ts.vercel.app/
 */
const usePokeApi = <T>(fetcher: (api: MainClient) => Promise<T>, options?: UseBaseQueryOptions) => {
  const id = useId();
  return useQuery<T>(options?.queryKey || id, () => fetcher(api), options as any);
};

export default usePokeApi;

export async function resolveResources<T>({ results: namedResources, ...response }: NamedAPIResourceList) {
  return {
    ...response,
    results: await Promise.all(namedResources.map((r) => api.utility.getResourceByUrl<T>(r.url))),
  };
}

interface LocalizedResource {
  name: string;
  names: Name[];
}

export function getLocalizedName(resource: LocalizedResource, lang = "fr") {
  return resource.names.find((localization) => localization.language.name === lang)?.name ?? resource.name;
}
