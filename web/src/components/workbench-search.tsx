import { Await, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";

import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import type { SearchItem } from "@/lib/content-collection.types";

const BROWSE_RESULT_LIMIT = 5;

function filterSearchItems(items: SearchItem[], query: string): SearchItem[] {
  const trimmedTerm = query.trim().toLowerCase();
  if (!trimmedTerm) return items.slice(0, BROWSE_RESULT_LIMIT);
  return items.filter((item) => item.title.toLowerCase().includes(trimmedTerm));
}

// #region WorkbenchSearch
interface WorkbenchSearchProps {
  /** Deferred search index from the root loader. */
  searchIndex: Promise<SearchItem[]>;
}

/**
 * Search input for finding content across the workbench.
 *
 * @remarks
 * The search index is started in the root loader and resolved here with
 * `Await`, so prerender can serialize it without blocking the rest of the page.
 */
function WorkbenchSearch({ searchIndex }: WorkbenchSearchProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const trimmedQuery = query.trim();
  const showResults = trimmedQuery ? true : isFocused;

  const closeResults = () => setIsFocused(false);
  const handleSelect = () => {
    setQuery("");
    closeResults();
  };

  return (
    <div className="relative w-full">
      <InputGroup>
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          placeholder="Search the workbench"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setIsFocused(true)}
          // Delayed so a click on a result registers before the list unmounts.
          onBlur={() => setTimeout(closeResults, 150)}
        />
      </InputGroup>
      {showResults && (
        <Await promise={searchIndex} fallback={<SearchResults query={trimmedQuery} />}>
          {(items) => (
            <SearchResults
              query={trimmedQuery}
              results={filterSearchItems(items, query)}
              onSelect={handleSelect}
            />
          )}
        </Await>
      )}
    </div>
  );
}
// #endregion

// #region SearchResults
interface SearchResultsProps {
  /** Current search text, used to pick the loading label. */
  query: string;
  /** Matches to render. Omitted while the index is still loading. */
  results?: SearchItem[];
  /** Clears the query and closes the list after navigating to a result. */
  onSelect?: () => void;
}

function searchItemTo(kind: SearchItem["kind"]): "/guides/$" | "/conventions/$" {
  return kind === "convention" ? "/conventions/$" : "/guides/$";
}

function SearchResults({ query, results, onSelect }: SearchResultsProps) {
  if (results && results.length === 0) return;

  return (
    <ul className="absolute top-full z-10 mt-1 w-full rounded-lg border border-border bg-popover p-1 shadow-md">
      {results === undefined ? (
        <li className="px-2.5 py-1.5 text-sm text-muted-foreground">
          {query ? "Searching…" : "Loading…"}
        </li>
      ) : (
        results.map((item) => (
          <li key={`${item.kind}:${item.slug}`}>
            <Link
              to={searchItemTo(item.kind)}
              params={{ _splat: item.slug }}
              onClick={onSelect}
              className="block rounded-md px-2.5 py-1.5 text-sm text-popover-foreground hover:bg-accent/50"
            >
              {item.title}
            </Link>
          </li>
        ))
      )}
    </ul>
  );
}
// #endregion

export { WorkbenchSearch };
