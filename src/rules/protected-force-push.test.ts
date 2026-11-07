import assert from "node:assert/strict";
import { test } from "node:test";
import { protectedForcePush } from "./protected-force-push.ts";

test("protectedForcePush allows ordinary git and non-git commands", () => {
  // Arrange
  const commands = [
    "git status",
    "git push origin feature/login",
    "npm test",
    "echo git push --force origin main",
    'git commit -m "force main" && git push origin feature',
  ];

  // Act / Assert
  for (const command of commands) {
    assert.deepEqual(protectedForcePush.classify(command), { kind: "allow" }, command);
  }
});

test("protectedForcePush denies force-push to main or master", () => {
  // Arrange
  const commands = [
    "git push --force origin main",
    "git push -f origin master",
    "git push --force-with-lease origin main",
    "git push origin +main",
    "git push origin HEAD:main --force",
    "git push --force origin HEAD:refs/heads/main",
    "git push --force origin refs/heads/main",
    "FOO=1 git push --force origin main",
    "git status && git push -f origin main",
    "git -C /tmp push --force origin main",
    "git -c push.default=simple push --force origin main",
    "/usr/bin/git push --force origin main",
    "command git push --force origin main",
    "git push --force origin MAIN",
    'git push --force "origin" "main"',
  ];

  // Act / Assert
  for (const command of commands) {
    assert.equal(protectedForcePush.classify(command).kind, "deny", command);
  }
});

test("protectedForcePush asks when force-push target is unclear or unprotected", () => {
  // Arrange
  const commands = [
    "git push --force",
    "git push -f origin",
    "git push origin +HEAD:feature",
    "git push --force-with-lease origin feature/login",
    "git push --force origin feature-main",
  ];

  // Act / Assert
  for (const command of commands) {
    assert.equal(protectedForcePush.classify(command).kind, "ask", command);
  }
});
