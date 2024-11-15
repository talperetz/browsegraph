import { useEffect, useState } from "react";

import { searchPages } from "@/lib/storage/page-vectors";
import { SearchResult } from "@/lib/storage/vector-store";

export const useSearchPages = (query: string, k: number = 5) => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const performSearch = async () => {
      setLoading(true);
      setError(null);
      try {
        const searchResults = await searchPages(query, k);

        setResults(searchResults);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (query && query !== "") {
      performSearch();
    }
  }, [query, k]);

  return { results, loading, error };
};
