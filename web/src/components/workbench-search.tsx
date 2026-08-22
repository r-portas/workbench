import { Autocomplete } from "@base-ui/react/autocomplete";
import { Await, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";

import { InputGroup, InputGroupAddon } from "@/components/ui/input-group";
import type { SearchItem } from "@/lib/content-collection.types";

const BROWSE_RESULT_LIMIT = 5;

function filterSearchItems(items: SearchItem[], query: string): SearchItem[] {
  const trimmedTerm = query.trim().toLowerCase();
  if (!trimmedTerm) return items.slice(0, BROWSE_RESULT_LIMIT);
  return items.filter((item) => item.title.toLowerCase().includes(trimmedTerm));
}

function searchItemTo(kind: SearchItem["kind"]): "/guides/$" | "/conventions/$" {
  return kind === "convention" ? "/conventions/$" : "/guides/$";
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
  return (
    <div className="relative w-full">
      <Await promise={searchIndex} fallback={<SearchInputPlaceholder />}>
        {(items) => <SearchAutocomplete items={items} />}
      </Await>
    </div>
  );
}
// #endregion

// #region SearchInputPlaceholder
/** Non-interactive stand-in for the input while the search index is still loading. */
function SearchInputPlaceholder() {
  return (
    <InputGroup className="h-10">
      <InputGroupAddon className="pl-2.5 [&>svg]:size-5">
        <Search />
      </InputGroupAddon>
      <input
        disabled
        placeholder="Search the workbench"
        className="h-8 w-full min-w-0 flex-1 rounded-none border-0 bg-transparent px-2.5 py-1 text-sm text-muted-foreground outline-none placeholder:text-muted-foreground"
      />
    </InputGroup>
  );
}
// #endregion

// #region SearchAutocomplete
interface SearchAutocompleteProps {
  /** Full search index, already resolved. */
  items: SearchItem[];
}

function SearchAutocomplete({ items }: SearchAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const results = filterSearchItems(items, query);
  const closeResults = () => setOpen(false);
  const handleSelect = () => {
    setQuery("");
    closeResults();
  };

  return (
    <Autocomplete.Root
      items={results}
      // `null` (not `undefined`) tells Autocomplete `results` is already filtered.
      // eslint-disable-next-line unicorn/no-null
      filter={null}
      value={query}
      onValueChange={setQuery}
      open={open && results.length > 0}
      onOpenChange={setOpen}
      autoHighlight
    >
      <InputGroup className="h-10">
        <InputGroupAddon className="pl-2.5 [&>svg]:size-5">
          <Search />
        </InputGroupAddon>
        <Autocomplete.Input
          data-slot="input-group-control"
          placeholder="Search the workbench"
          onFocus={() => setOpen(true)}
          // Delayed so a click on a result registers before the popup unmounts.
          onBlur={() => setTimeout(closeResults, 150)}
          className="h-8 w-full min-w-0 flex-1 rounded-none border-0 bg-transparent px-2.5 py-1 text-sm outline-none placeholder:text-muted-foreground"
        />
      </InputGroup>
      <Autocomplete.Portal>
        <Autocomplete.Positioner className="w-(--anchor-width) outline-none" align="start" sideOffset={4}>
          <Autocomplete.Popup className="max-h-[min(24rem,var(--available-height))] w-full origin-(--transform-origin) overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-md">
            <Autocomplete.List>
              {(item: SearchItem) => (
                <Autocomplete.Item
                  key={`${item.kind}:${item.slug}`}
                  value={item}
                  render={
                    <Link
                      to={searchItemTo(item.kind)}
                      params={{ _splat: item.slug }}
                      onClick={handleSelect}
                    />
                  }
                  className="block cursor-default rounded-md px-2.5 py-1.5 text-sm text-popover-foreground outline-none data-[highlighted]:bg-accent/50"
                >
                  {item.title}
                </Autocomplete.Item>
              )}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>
  );
}
// #endregion

export { WorkbenchSearch };
