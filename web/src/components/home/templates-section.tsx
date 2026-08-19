import { CheckIcon, CopyIcon } from "lucide-react";
import { useEffect, useState } from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const COPIED_RESET_MS = 1500;

// #region TemplatesSection
interface TemplateItem {
  /** Directory name, shown as the row title. */
  name: string;
  /** Degit command copied by the row's copy button. */
  command: string;
}

interface TemplatesSectionProps {
  /** Templates listed under the heading. */
  templates: TemplateItem[];
  /** Extra Tailwind classes forwarded to the root element. */
  className?: string;
}

/**
 * A labeled list of project templates with copyable degit commands.
 */
export default function TemplatesSection({ templates, className }: TemplatesSectionProps) {
  return (
    <section className={cn(className)}>
      <header className="flex items-center gap-3">
        <h2 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
          Templates
        </h2>
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground tabular-nums">{templates.length}</span>
      </header>
      <ul className="mt-1">
        {templates.map((template) => (
          <li key={template.name}>
            <TemplateRow template={template} />
          </li>
        ))}
      </ul>
    </section>
  );
}
// #endregion

// #region TemplateRow
interface TemplateRowProps {
  /** The template to render. */
  template: TemplateItem;
  /** Extra Tailwind classes forwarded to the row. */
  className?: string;
}

function TemplateRow({ template, className }: TemplateRowProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeoutId = window.setTimeout(() => setCopied(false), COPIED_RESET_MS);
    return () => window.clearTimeout(timeoutId);
  }, [copied]);

  async function handleCopy() {
    await navigator.clipboard.writeText(template.command);
    setCopied(true);
  }

  return (
    <div className={cn("flex flex-col gap-2 px-3 py-2", className)}>
      <span className="truncate text-sm font-medium">{template.name}</span>
      <InputGroup>
        <InputGroupInput readOnly value={template.command} className="font-mono" />
        <InputGroupAddon align="inline-end">
          <Tooltip>
            <TooltipTrigger
              render={
                <InputGroupButton
                  size="icon-xs"
                  aria-label={copied ? "Copied" : "Copy"}
                  onClick={handleCopy}
                />
              }
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
            </TooltipTrigger>
            <TooltipContent>{copied ? "Copied" : "Copy"}</TooltipContent>
          </Tooltip>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
// #endregion
