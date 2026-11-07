/**
 * Enabled rules. Add or remove a guardrail here (and its module) only.
 */

import { noPipeToShell } from "./rules/no-pipe-to-shell.ts";
import { protectedForcePush } from "./rules/protected-force-push.ts";
import type { Rule } from "./types.ts";

export const rules: readonly Rule[] = [protectedForcePush, noPipeToShell];

/** Build a Cursor `beforeShellExecution` matcher from enabled rule tokens. */
export function shellMatcher(activeRules: readonly Rule[] = rules): string {
  const tokens = [
    ...new Set(activeRules.flatMap((rule) => rule.matchTokens).map((token) => token.toLowerCase())),
  ].sort();

  if (tokens.length === 0) {
    throw new Error("shellMatcher requires at least one matchToken on an enabled rule.");
  }

  const body = tokens.map(escapeRegex).join("|");
  return `\\b(?:${body})\\b`;
}

function escapeRegex(token: string): string {
  return token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
