import { Command } from "cmdk";
import "@/styles/raycast.scss";
import React, { useEffect, useRef, useState } from "react";
import { Results } from "@electric-sql/pglite";
import { embed } from "ai";
import { usePGlite } from "@electric-sql/pglite-react";

import { geminiEmbeddingModel } from "@/lib/agents";
import { searchPglite } from "@/lib/vector-storage";

function getSnippet(
  content: string,
  searchTerm: string,
  maxLength: number,
): string {
  const index = content.toLowerCase().indexOf(searchTerm.toLowerCase());

  if (index !== -1) {
    const searchTermLength = searchTerm.length;
    let start = index;
    let end = index + searchTermLength;

    let prefix = "";
    let suffix = "";

    // Determine available space after accounting for ellipses
    let availableLength = maxLength;

    // Check if we need to add ellipsis at the start
    if (start > 0) {
      availableLength -= 3; // For "..."
      prefix = "...";
    }

    // Check if we need to add ellipsis at the end
    if (end < content.length) {
      availableLength -= 3; // For "..."
      suffix = "...";
    }

    // Remaining length after including the search term
    let remainingLength = availableLength - searchTermLength;

    // Distribute remaining length to the left and right contexts
    let leftContextLength = Math.floor(remainingLength / 2);
    let rightContextLength = remainingLength - leftContextLength;

    // Adjust start and end positions
    start = Math.max(0, start - leftContextLength);
    end = Math.min(content.length, end + rightContextLength);

    // If we hit the content boundaries, readjust the other side
    if (start === 0) {
      end = Math.min(
        content.length,
        end + (leftContextLength - (index - start)),
      );
    }
    if (end === content.length) {
      start = Math.max(
        0,
        start - (rightContextLength - (end - index - searchTermLength)),
      );
    }

    // Extract the snippet
    let snippet = prefix + content.substring(start, end) + suffix;

    // Ensure the snippet is exactly snippetLength characters
    if (snippet.length < maxLength) {
      snippet = snippet.padEnd(maxLength, " ");
    } else if (snippet.length > maxLength) {
      snippet = snippet.substring(0, maxLength);
      if (suffix) {
        snippet = snippet.substring(0, maxLength - 3) + "...";
      }
    }

    return snippet;
  } else {
    // If searchTerm is not found, return the first snippetLength characters with ellipsis
    let snippet = content.substring(0, maxLength);

    if (content.length > maxLength) {
      snippet += "...";
    }

    return snippet;
  }
}

function Item({ row, index, search }) {
  const maxSnippetLength = 82;
  const maxUrlLength = 72;
  const snippet = getSnippet(row.content, search, maxSnippetLength);
  const trimmedUrl =
    row.url.length > maxUrlLength
      ? row.url.slice(0, maxUrlLength) + "..."
      : row.url;

  return (
    <Command.Item
      key={`${row.url as string}-${index}`}
      value={`${row.url as string}-${index}`}
      onSelect={() => {
        const cleanSnippet = snippet
          .replace(/^\.{3}/, "")
          .replace(/\.{3}$/, "");
        const urlWithFragment = `${row.url}#:~:text=${encodeURIComponent(cleanSnippet)}`;

        window.open(urlWithFragment, "_blank");
      }}
    >
      <div className="flex items-center justify-between w-full pr-2">
        <div className="flex flex-col gap-1 p-2">
          {snippet}
          <span className="opacity-35">{trimmedUrl}</span>
        </div>
        <span cmdk-raycast-meta="">
          <kbd>⏎</kbd>
        </span>
      </div>
    </Command.Item>
  );
}

export function CommandMenu() {
  const [search, setSearch] = useState("");
  const [embedding, setEmbedding] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Results>();

  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef(null);

  useEffect(() => {
    inputRef?.current?.focus();
  }, []);

  useEffect(() => {
    console.log("Search term changed:", search);
  }, [search]);

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
          setEmbedding(embeddingResult.embedding);
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

    searchPglite(embedding, 0.0, 10).then((res) => {
      console.log("Results: ", res);
      setResults(res);
    });
  }, [db, search, embedding]);

  const isResultsEmpty = results && results.rows && results.rows.length === 0;
  const hasNoResults = !results || !results.rows;
  const showNoResults = !loading && (hasNoResults || isResultsEmpty);
  const showResults = !loading && !showNoResults;

  return (
    <div className="raycast m-5 w-[640px]">
      <Command
        loop
        shouldFilter={false}
        onKeyDown={(e) => {
          if (e.key === "Escape" || (e.key === "Backspace" && !search)) {
            e.preventDefault();
            setSearch("");
          }
        }}
      >
        <div cmdk-raycast-top-shine="" />
        <Command.Input
          ref={inputRef}
          placeholder="Ask anything or search..."
          value={search}
          onValueChange={(s) => setSearch(s)}
        />
        {search && (
          <>
            <hr cmdk-raycast-loader="" />
            {showNoResults && <Command.Empty>No results found.</Command.Empty>}
            {showResults && (
              <Command.List ref={listRef}>
                {results &&
                  results.rows &&
                  results.rows.length > 0 &&
                  results.rows.map((row, index) => (
                    <Item key={index} index={index} row={row} search={search} />
                  ))}
              </Command.List>
            )}
          </>
        )}
      </Command>
    </div>
  );
}
