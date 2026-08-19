import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

import { degitCommand, listTemplates } from "./templates.server";

async function writeFixture(root: string) {
  await mkdir(join(root, "tss"), { recursive: true });
  await mkdir(join(root, "app"), { recursive: true });
  await mkdir(join(root, "_draft"), { recursive: true });
  await mkdir(join(root, ".hidden"), { recursive: true });
  await writeFile(join(root, "README.md"), "# Templates\n");
}

describe("degitCommand", () => {
  test("matches the README format", () => {
    expect(degitCommand("tss")).toBe(
      "bunx --bun degit r-portas/workbench/templates/tss <destination>",
    );
  });
});

describe("listTemplates", () => {
  let fixturePath: string;

  beforeEach(async () => {
    fixturePath = await mkdtemp(join(tmpdir(), "templates-"));
    await writeFixture(fixturePath);
  });

  afterEach(async () => {
    await rm(fixturePath, { recursive: true, force: true });
  });

  test("includes top-level directories", async () => {
    const templates = await listTemplates(fixturePath);
    expect(templates.map((template) => template.name)).toContain("tss");
  });

  test("skips files", async () => {
    const templates = await listTemplates(fixturePath);
    expect(templates.map((template) => template.name)).not.toContain("README.md");
  });

  test("skips underscore-prefixed directories", async () => {
    const templates = await listTemplates(fixturePath);
    expect(templates.map((template) => template.name)).not.toContain("_draft");
  });

  test("skips dot-prefixed directories", async () => {
    const templates = await listTemplates(fixturePath);
    expect(templates.map((template) => template.name)).not.toContain(".hidden");
  });

  test("sorts templates by name", async () => {
    const templates = await listTemplates(fixturePath);
    expect(templates.map((template) => template.name)).toEqual(["app", "tss"]);
  });

  test("builds the degit command for each template", async () => {
    const templates = await listTemplates(fixturePath);
    expect(templates.find((template) => template.name === "tss")?.command).toBe(
      degitCommand("tss"),
    );
  });
});
