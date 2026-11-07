/**
 * Block piping remote downloads into a shell (curl|sh, wget|bash, etc.).
 */

import type { CommandClass, Rule } from "../types.ts";

/** Optional absolute/relative path before sh/bash. */
const SHELL = String.raw`(?:\S+/)?(?:sh|bash)`;

/** curl/wget piped into sh/bash (optional sudo + short flags). */
const PIPE_TO_SHELL = new RegExp(
  String.raw`\b(curl|wget)\b[\s\S]*\|\s*(?:sudo(?:\s+-[^\s]+)*\s+)?${SHELL}\b`,
  "i",
);

/** Process substitution: bash <(curl …) / /bin/sh <(wget …). */
const PROCESS_SUBST = new RegExp(
  String.raw`(?:^|[\s;&|])${SHELL}\b[\s\S]*<\([\s\S]*\b(curl|wget)\b`,
  "i",
);

/** `source <(curl …)` / `. <(curl …)`. */
const SOURCE_PROCESS = /(?:\bsource\b|(?:^|[\s;&|])\.)\s+<\([\s\S]*\b(curl|wget)\b/i;

/** `bash -c "$(curl …)"` / `eval "$(curl …)"` / `eval $(wget …)`. */
const EVAL_OR_BASH_C = /\b(?:eval|bash\s+-c)\b[\s\S]*\$\([\s\S]*\b(curl|wget)\b/i;

function applies(command: string): boolean {
  const lower = command.toLowerCase();
  const hasDownloader = lower.includes("curl") || lower.includes("wget");
  if (!hasDownloader) return false;

  return (
    lower.includes("|") ||
    lower.includes("<(") ||
    lower.includes("$(") ||
    lower.includes("eval") ||
    lower.includes("source") ||
    lower.includes(". <(")
  );
}

function classify(command: string): CommandClass {
  if (
    !PIPE_TO_SHELL.test(command) &&
    !PROCESS_SUBST.test(command) &&
    !SOURCE_PROCESS.test(command) &&
    !EVAL_OR_BASH_C.test(command)
  ) {
    return { kind: "allow" };
  }

  return {
    kind: "deny",
    reason:
      "Piping a remote download into a shell is blocked. Download, inspect, then run deliberately.",
    agent_message:
      "Do not pipe curl/wget into sh/bash. Download the script, inspect it, then run it only if appropriate.",
  };
}

export const noPipeToShell: Rule = {
  id: "no-pipe-to-shell",
  matchTokens: ["curl", "wget"],
  applies,
  classify,
};
