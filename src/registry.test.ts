import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { examplesById } from "./demo-fixtures.ts";
import { rules, shellMatcher } from "./registry.ts";

test("shellMatcher stays in sync with .cursor/hooks.json", () => {
  // Arrange
  const hooksPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    ".cursor",
    "hooks.json",
  );
  const hooks = JSON.parse(readFileSync(hooksPath, "utf8")) as {
    hooks: { beforeShellExecution: { matcher?: string }[] };
  };

  // Act
  const expected = shellMatcher(rules);
  const actual = hooks.hooks.beforeShellExecution[0]?.matcher;

  // Assert
  assert.equal(actual, expected);
});

test("every enabled rule declares matchTokens", () => {
  // Arrange / Act / Assert
  for (const rule of rules) {
    assert.ok(rule.matchTokens.length > 0, rule.id);
  }
});

test("demo fixtures cover every enabled rule id", () => {
  // Arrange / Act / Assert
  for (const rule of rules) {
    assert.ok(examplesById[rule.id]?.length, `missing examples for ${rule.id}`);
  }
});
