import { Command } from "cmdk";
import "@/styles/linear.scss";
import React from "react";

import { useSearchPages } from "@/lib/hooks/use-search-pages";

export function CommandMenu() {
  const [search, setSearch] = React.useState("");
  const { results, loading } = useSearchPages(search);
  const isSearchPerformed: boolean = search !== "";
  const isResultsEmpty: boolean = results && results.length === 0;
  const hasNoResults: boolean = isSearchPerformed && isResultsEmpty;

  return (
    <div className="linear m-10">
      <Command>
        {/*<div cmdk-linear-badge="">Issue - FUN-343</div>*/}
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
            results.map((page, index) => {
              return (
                <Command.Item
                  key={`${page.object.title}-${index}`}
                  value={page.object.title}
                >
                  {page.object.title}
                  <div>{page.object.text}</div>
                  <div>{page.object.url}</div>
                  {/*<div cmdk-linear-shortcuts="">*/}
                  {/*  {shortcut.map((key) => {*/}
                  {/*    return <kbd key={key}>{key}</kbd>*/}
                  {/*  })}*/}
                  {/*</div>*/}
                </Command.Item>
              );
            })}
        </Command.List>
      </Command>
    </div>
  );
}
