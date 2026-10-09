#!/usr/bin/env bun
import { cpSync, existsSync } from "node:fs";
import { basename, join, resolve } from "node:path";

// Paths, and files that should not be copied from the template
const root = resolve(import.meta.dir, "..");
const template = join(root, "templates/tss");

const ignored = new Set(["node_modules", "dist", ".tanstack", ".DS_Store"]);

// Validate the app name argument
const name = process.argv[2];
if (!name || !/^[a-z][a-z0-9-]*$/.test(name)) {
  console.error("Usage: ./scripts/create-app.ts <app-name>");
  console.error("<app-name> must be lowercase letters, numbers and dashes, starting with a letter");
  process.exit(1);
}

// Refuse to overwrite an existing app
const dest = join(root, "apps", name);
if (existsSync(dest)) {
  console.error(`apps/${name} already exists`);
  process.exit(1);
}

// Copy the template into apps/<app-name>
cpSync(template, dest, {
  recursive: true,
  filter: (src) => !ignored.has(basename(src)),
});

// Set the package name
const pkgPath = join(dest, "package.json");
const pkg = await Bun.file(pkgPath).json();
pkg.name = name;
await Bun.write(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

// Set the README title
const readmePath = join(dest, "README.md");
const readme = await Bun.file(readmePath).text();
await Bun.write(readmePath, readme.replace(/^# .*/, `# ${name}`));

// Print follow-up steps that are still manual
console.log(`Created apps/${name}`);
console.log("Next steps:");
console.log("  - bun install");
console.log("  - Add a row to the Apps table in README.md");
console.log("  - Add a filter entry for it in the `changes` job in .github/workflows/build.yml");
