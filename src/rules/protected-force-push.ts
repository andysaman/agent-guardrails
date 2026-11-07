/**
 * Block force-pushes that rewrite main/master; ask on other force-pushes.
 */

import type { CommandClass, Rule } from "../types.ts";

const CHAIN = String.raw`(?:^|[;&|]|&&|\|\|)\s*`;
const ENV = String.raw`(?:[A-Za-z_][A-Za-z0-9_]*=\S*\s+)*`;
const WRAPPER = String.raw`(?:(?:command|builtin|exec)\s+)*`;
const GIT_BIN = String.raw`(?:\S+/)?git(?:\.cmd)?`;
/** Global git args before the `push` subcommand (`-C dir`, `-c key=val`, flags). */
const GIT_ARGS = String.raw`(?:(?:-[Cc]\s+\S+|--[^=\s]+(?:=\S+)?|-[^\s]+)\s+)*`;

/** Match `git push` after wrappers, paths, env, chains, or git global args. */
const GIT_PUSH = new RegExp(`${CHAIN}${ENV}${WRAPPER}${GIT_BIN}\\s+${GIT_ARGS}push\\b`, "i");

/** Explicit force flags on a push. */
const FORCE_FLAG = /(?:^|[\s])(?:--force(?:-with-lease)?(?:\s|=|$)|-f(?:\s|$))/i;

/** Refspec force via a leading `+` (for example `+main` or `+HEAD:main`). */
const FORCE_REFSPEC = /(?:^|[\s])\+[^\s]+/;

/**
 * Protected branch names as push refs: `main`, `origin/main`, `HEAD:main`, `+main`, `"main"`.
 * Avoid matching names like `feature-main`.
 */
const PROTECTED_REF = /(?:^|[\s/:@+"'])(main|master)(?=[\s"']|$)/i;

function applies(command: string): boolean {
  const lower = command.toLowerCase();
  return lower.includes("git") && lower.includes("push");
}

function classify(command: string): CommandClass {
  if (!GIT_PUSH.test(command) || !isForcePush(command)) {
    return { kind: "allow" };
  }

  if (PROTECTED_REF.test(command)) {
    return {
      kind: "deny",
      reason: "Force-push to main/master is blocked. Use a feature branch and open a PR.",
      agent_message:
        "Force-push to main/master is blocked. Use a feature branch and open a PR. Do not rewrite protected branch history.",
    };
  }

  return {
    kind: "ask",
    reason:
      "Force-push detected without a clear main/master ref. Approve only if the target branch is intentional.",
  };
}

function isForcePush(command: string): boolean {
  return FORCE_FLAG.test(command) || FORCE_REFSPEC.test(command);
}

export const protectedForcePush: Rule = {
  id: "protected-force-push",
  matchTokens: ["git"],
  applies,
  classify,
};
