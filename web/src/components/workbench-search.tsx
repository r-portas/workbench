import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";

import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import type { ItemSummary } from "@/lib/content-collection.server";
import { listSearchIndexFn } from "@/lib/search.functions";

/**
 * Lazily fetches the search index and exposes a `search` function to query it.
 *
 * @remarks
 * `search` returns `undefined` until `load` has been called and the index has resolved,
 * which callers can use to distinguish "still loading" from "loaded with no matches".
 * Currently backed by mock data rather than a real search source.
 */
function useWorkbenchSearch() {
  const [searchIndex, setSearchIndex] = useState<ItemSummary[] | undefined>(undefined);
  const [isIndexLoading, setIsIndexLoading] = useState(false);

  const load = () => {
    if (searchIndex !== undefined || isIndexLoading) return;
    setIsIndexLoading(true);
    listSearchIndexFn()
      .then(setSearchIndex)
      .catch(() => {
        setSearchIndex([]);
      })
      .finally(() => setIsIndexLoading(false));
  };

  const search = (term: string) => {
    const trimmedTerm = term.trim().toLowerCase();
    if (!searchIndex || !trimmedTerm) return undefined;
    return searchIndex.filter((item) => item.title.toLowerCase().includes(trimmedTerm));
  };

  return [searchIndex, search, load] as const;
}

/**
 * Search input for finding content across the workbench.
 *
 * @remarks
 * The search index is fetched lazily on first focus, rather than on page load.
 */
const BROWSE_RESULT_LIMIT = 5;

function WorkbenchSearch() {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [items, search, load] = useWorkbenchSearch();

  const trimmedQuery = query.trim();
  const results = trimmedQuery ? search(query) : items?.slice(0, BROWSE_RESULT_LIMIT);
  const showResults = trimmedQuery ? true : isFocused;

  const closeResults = () => setIsFocused(false);

  return (
    <div className="relative w-full max-w-xs">
      <InputGroup>
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          placeholder="Search the workbench"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => {
            load();
            setIsFocused(true);
          }}
          // Delayed so a click on a result registers before the list unmounts.
          onBlur={() => setTimeout(closeResults, 150)}
        />
      </InputGroup>
      {showResults && (results === undefined || results.length > 0) && (
        <ul className="absolute top-full z-10 mt-1 w-full rounded-lg border border-border bg-popover p-1 shadow-md">
          {results === undefined ? (
            <li className="px-2.5 py-1.5 text-sm text-muted-foreground">
              {trimmedQuery ? "Searching…" : "Loading…"}
            </li>
          ) : (
            results.map((item) => (
              <li key={item.slug}>
                <Link
                  to="/guides/$slug"
                  params={{ slug: item.slug }}
                  onClick={() => {
                    setQuery("");
                    closeResults();
                  }}
                  className="block rounded-md px-2.5 py-1.5 text-sm text-popover-foreground hover:bg-accent/50"
                >
                  {item.title}
                </Link>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export { WorkbenchSearch };
