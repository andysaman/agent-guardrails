import assert from "node:assert/strict";
import { test } from "node:test";
import { decideCommand, decideFromHookInput } from "./engine.ts";
import type { Rule } from "./types.ts";

const denyMain: Rule = {
  id: "deny-main",
  matchTokens: ["main"],
  applies: (command) => command.includes("main"),
  classify: (command) =>
    command.includes("main")
      ? { kind: "deny", reason: "no main", agent_message: "agent: no main" }
      : { kind: "allow" },
};

const askForce: Rule = {
  id: "ask-force",
  matchTokens: ["force"],
  applies: (command) => command.includes("--force"),
  classify: (command) =>
    command.includes("--force") ? { kind: "ask", reason: "confirm force" } : { kind: "allow" },
};

const tracking: Rule = {
  id: "tracking",
  matchTokens: ["track"],
  applies: () => true,
  classify: () => {
    trackingCalls += 1;
    return { kind: "allow" };
  },
};

let trackingCalls = 0;

test("decideCommand prefers deny over ask over allow and stops after deny", () => {
  // Arrange
  trackingCalls = 0;
  const active = [askForce, denyMain, tracking];

  // Act / Assert
  assert.deepEqual(decideCommand("git push --force origin main", active), {
    permission: "deny",
    user_message: "no main",
    agent_message: "agent: no main",
  });
  assert.equal(trackingCalls, 0);

  assert.deepEqual(decideCommand("git push --force origin feature", active), {
    permission: "ask",
    user_message: "confirm force",
    agent_message: "confirm force",
  });
  assert.equal(trackingCalls, 1);

  trackingCalls = 0;
  assert.deepEqual(decideCommand("git push origin feature", active), { permission: "allow" });
  assert.equal(trackingCalls, 1);
});

test("decideCommand skips rules when applies is false", () => {
  // Arrange
  let classified = 0;
  const gated: Rule = {
    id: "gated",
    matchTokens: ["x"],
    applies: () => false,
    classify: () => {
      classified += 1;
      return { kind: "deny", reason: "should not run" };
    },
  };

  // Act
  const result = decideCommand("anything", [gated]);

  // Assert
  assert.deepEqual(result, { permission: "allow" });
  assert.equal(classified, 0);
});

test("decideFromHookInput asks on invalid JSON", () => {
  // Arrange / Act
  const result = decideFromHookInput("not-json", []);

  // Assert
  assert.equal(result.permission, "ask");
});

test("decideFromHookInput allows when no rules match", () => {
  // Arrange / Act
  const result = decideFromHookInput(JSON.stringify({ command: "git status" }), []);

  // Assert
  assert.deepEqual(result, { permission: "allow" });
});
