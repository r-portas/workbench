import { Search } from "lucide-react";
import { useState } from "react";

import CatalogSection from "@/components/home/catalog-section";
import TemplatesSection, { type TemplateItem } from "@/components/home/templates-section";
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group";
import type { ContentSection } from "@/lib/content-collection";

// #region HomeSearch
interface HomeSearchProps {
  /** Templates listed under the Templates heading. */
  templates: TemplateItem[];
  /** Content sections listed below the templates. */
  sections: ContentSection[];
}

/**
 * A filter input that narrows the templates and content sections below it.
 *
 * @remarks
 * Matches case-insensitively against template names and content titles.
 * Sections with no matching items are omitted, mirroring `groupIntoSections`.
 */
export default function HomeSearch({ templates, sections }: HomeSearchProps) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const filteredTemplates = normalizedQuery
    ? templates.filter((template) => template.name.toLowerCase().includes(normalizedQuery))
    : templates;

  const filteredSections = normalizedQuery
    ? sections
        .map((section) => ({
          ...section,
          items: section.items.filter((item) => item.title.toLowerCase().includes(normalizedQuery)),
        }))
        .filter((section) => section.items.length > 0)
    : sections;

  const hasResults = filteredTemplates.length > 0 || filteredSections.length > 0;

  return (
    <>
      <InputGroup className="h-10">
        <InputGroupAddon className="pl-2.5 [&>svg]:size-5">
          <Search />
        </InputGroupAddon>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter templates and content"
          className="h-8 w-full min-w-0 flex-1 rounded-none border-0 bg-transparent px-2.5 py-1 text-sm outline-none placeholder:text-muted-foreground"
        />
      </InputGroup>

      {filteredTemplates.length > 0 && (
        <TemplatesSection templates={filteredTemplates} className="mt-8" />
      )}
      {filteredSections.map((section) => (
        <CatalogSection
          key={section.slug}
          label={section.label}
          items={section.items}
          className="mt-10"
        />
      ))}
      {normalizedQuery && !hasResults && (
        <p className="mt-10 text-sm text-muted-foreground">No results for &quot;{query}&quot;.</p>
      )}
    </>
  );
}
// #endregion
