import { readdir } from "fs/promises";

const TEMPLATES_REPO = "r-portas/workbench";

/**
 * A scaffoldable project template and the degit command that clones it.
 */
export interface TemplateSummary {
  name: string;
  command: string;
}

/**
 * Builds the degit command for a template directory name.
 *
 * @example
 * degitCommand("tss");
 * // "bunx --bun degit r-portas/workbench/templates/tss <destination>"
 */
export function degitCommand(name: string): string {
  return `bunx --bun degit ${TEMPLATES_REPO}/templates/${name} <destination>`;
}

/**
 * Lists immediate child directories in a templates folder as degit targets.
 *
 * @example
 * const templates = await listTemplates("../templates");
 * // [{ name: "tss", command: "bunx --bun degit r-portas/workbench/templates/tss <destination>" }]
 *
 * @remarks
 * Skips files and directories whose names start with `.` or `_`. Sorted by name.
 */
export async function listTemplates(templatesPath: string): Promise<TemplateSummary[]> {
  const entries = await readdir(templatesPath, { withFileTypes: true });
  return entries
    .filter(
      (entry) => entry.isDirectory() && !entry.name.startsWith(".") && !entry.name.startsWith("_"),
    )
    .map((entry) => ({
      name: entry.name,
      command: degitCommand(entry.name),
    }))
    .toSorted((a, b) => a.name.localeCompare(b.name));
}
