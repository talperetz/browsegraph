import { Command } from "cmdk";
import "@/styles/linear.scss";
import React, { useEffect, useState } from "react";
import { usePGlite } from "@electric-sql/pglite-react";
import { embed } from "ai";
import { Results } from "@electric-sql/pglite";

import { geminiEmbeddingModel } from "@/lib/agents";

export function CommandMenu() {
  const [search, setSearch] = useState("");
  const [embedding, setEmbedding] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Results>();

  // Calculate embedding whenever the search term changes
  useEffect(() => {
    let isCancelled = false;

    const calculateEmbedding = async () => {
      if (search.trim() === "") {
        setEmbedding(null);

        return;
      }

      setLoading(true);

      try {
        const embeddingResult = await embed({
          model: geminiEmbeddingModel,
          value: search,
        });

        if (!isCancelled) {
          setEmbedding(embeddingResult);
        }
      } catch (error) {
        console.error("Error calculating embedding:", error);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    calculateEmbedding();

    return () => {
      isCancelled = true;
    };
  }, [search]);

  const db = usePGlite();

  useEffect(() => {
    if (!db || !search || !embedding) {
      return;
    }

    console.log("db: ", db);

    const results = db
      .query(
        `
    SELECT *
    FROM embeddings
--     WHERE embeddings.embedding <#> $1 < $2
--     ORDER BY embeddings.embedding <#> $1
    LIMIT $1;
    `,
        [10],
      )
      .then((res) => {
        console.log("Results: ", res);
        setResults(res);
      });
  }, [db, search, embedding]);

  const isSearchPerformed = search !== "";
  const isResultsEmpty = results && results.rows && results.rows.length === 0;
  const hasNoResults = isSearchPerformed && isResultsEmpty;

  return (
    <div className="linear m-10">
      <Command>
        <Command.Input
          autoFocus
          placeholder="Ask anything or search..."
          value={search}
          onValueChange={setSearch}
        />
        <Command.List>
          {loading && <Command.Loading>Loading…</Command.Loading>}
          {hasNoResults && !loading && (
            <Command.Empty>No results found.</Command.Empty>
          )}
          {search &&
            results &&
            results.rows &&
            results.rows.length > 0 &&
            results.rows.map((row, index) => {
              return (
                <Command.Item
                  key={`${row.url as string}-${index}`}
                  value={row.url as string}
                >
                  {row.url as string}
                  <div>{row.url as string}</div>
                  <div>{row.content as string}</div>
                  <div>
                    <kbd key="enter" />
                  </div>
                </Command.Item>
              );
            })}
        </Command.List>
      </Command>
    </div>
  );
}
