import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { rules } from "./registry.ts";

const distRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");

const expected = [
  "run-gate.js",
  "engine.js",
  "registry.js",
  ...rules.map((rule) => `rules/${rule.id}.js`),
].sort();

function listJsFiles(dir: string, prefix = ""): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      files.push(...listJsFiles(path.join(dir, entry.name), relative));
      continue;
    }
    if (entry.name.endsWith(".js")) files.push(relative);
  }
  return files.sort();
}

test("dist contains only the Cursor hook runtime graph", () => {
  // Arrange / Act
  const files = listJsFiles(distRoot);

  // Assert
  assert.deepEqual(files, expected);
});
