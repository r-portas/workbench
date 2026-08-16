#!/usr/bin/env bun

/**
 * Creates today's journal entry from `journal/_template.md`, filling in the
 * date, and writes it to `journal/<year>/<YYYY-MM-DD>.md`.
 *
 * Usage: `bun run new:journal`
 */

// Build the date from local time parts (not toISOString, which is UTC and
// can land on the wrong day depending on timezone).
const now = new Date();
const today = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, "0"),
  String(now.getDate()).padStart(2, "0"),
].join("-");

const journalDir = new URL("../journal/", import.meta.url);
const templatePath = new URL("_template.md", journalDir);
const yearDir = new URL(`${now.getFullYear()}/`, journalDir);
const destPath = new URL(`${today}.md`, yearDir);
const relPath = `journal/${now.getFullYear()}/${today}.md`;

// Don't clobber an entry someone's already been writing in today.
const destFile = Bun.file(destPath);
if (await destFile.exists()) {
  console.error(`Journal entry already exists: ${relPath}`);
  process.exit(1);
}

const template = await Bun.file(templatePath).text();
const content = template.replaceAll("YYYY-MM-DD", today);

// Bun.write creates the year directory if it doesn't exist yet.
await Bun.write(destPath, content);
console.log(`Created ${relPath}`);
