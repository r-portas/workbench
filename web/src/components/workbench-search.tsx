import { Autocomplete } from "@base-ui/react/autocomplete";
import { Await, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useRef, useState } from "react";

import { InputGroup, InputGroupAddon } from "@/components/ui/input-group";
import type { SearchItem } from "@/lib/content-collection.types";

const BROWSE_RESULT_LIMIT = 5;

function itemToStringValue(item: SearchItem): string {
  return item.title;
}

const SEARCH_ITEM_TO: Record<
  SearchItem["kind"],
  "/guides/$" | "/conventions/$" | "/cheatsheets/$"
> = {
  guide: "/guides/$",
  convention: "/conventions/$",
  cheatsheet: "/cheatsheets/$",
};

function searchItemTo(kind: SearchItem["kind"]) {
  return SEARCH_ITEM_TO[kind];
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
    <Await promise={searchIndex} fallback={<SearchInputPlaceholder />}>
      {(items) => <SearchAutocomplete items={items} />}
    </Await>
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
  // Anchors the popup to the full input group, not just the input.
  const anchorRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const closeResults = () => setOpen(false);
  const handleSelect = () => {
    setQuery("");
    closeResults();
  };

  return (
    <Autocomplete.Root
      items={items}
      itemToStringValue={itemToStringValue}
      // Browsing (empty query) shows a short preview; a typed query shows every match.
      limit={query.trim() ? -1 : BROWSE_RESULT_LIMIT}
      value={query}
      onValueChange={setQuery}
      open={open}
      onOpenChange={setOpen}
      autoHighlight
    >
      <InputGroup ref={anchorRef} className="h-10">
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
        <Autocomplete.Positioner
          anchor={anchorRef}
          className="w-(--anchor-width) outline-none"
          align="start"
          sideOffset={4}
        >
          <Autocomplete.Popup className="max-h-[min(24rem,var(--available-height))] w-full origin-(--transform-origin) overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-md">
            <Autocomplete.Empty className="px-2.5 py-1.5 text-sm text-muted-foreground empty:m-0 empty:p-0">
              No results found.
            </Autocomplete.Empty>
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
