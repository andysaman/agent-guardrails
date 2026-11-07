/**
 * Stable gate engine. No policy of its own.
 */

import { rules as defaultRules } from "./registry.ts";
import type { CommandClass, Rule, ShellDecision } from "./types.ts";

/**
 * Run enabled rules with cheap `applies` gates.
 * Stop at the first deny; keep scanning after ask in case a later rule denies.
 */
export function decideCommand(
  command: string,
  activeRules: readonly Rule[] = defaultRules,
): ShellDecision {
  const trimmed = command.trim();
  if (!trimmed) {
    return ask("The gate did not receive a command.");
  }

  let pendingAsk: Extract<CommandClass, { kind: "ask" }> | undefined;

  for (const rule of activeRules) {
    if (!rule.applies(trimmed)) continue;

    const result = rule.classify(trimmed);
    if (result.kind === "deny") return toDecision(result);
    if (result.kind === "ask" && pendingAsk === undefined) pendingAsk = result;
  }

  return pendingAsk ? toDecision(pendingAsk) : { permission: "allow" };
}

export function decideFromHookInput(
  stdin: string,
  activeRules: readonly Rule[] = defaultRules,
): ShellDecision {
  const parsed = parseHookInput(stdin);
  if (!parsed) {
    return ask("The gate received invalid JSON and did not allow the command.");
  }

  return decideCommand(parsed.command, activeRules);
}

function toDecision(result: Extract<CommandClass, { kind: "deny" | "ask" }>): ShellDecision {
  return {
    permission: result.kind,
    user_message: result.reason,
    agent_message: result.agent_message ?? result.reason,
  };
}

function parseHookInput(stdin: string): { command: string } | undefined {
  try {
    const input: unknown = JSON.parse(stdin);
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      return undefined;
    }

    const record = input as { command?: unknown };
    const command = typeof record.command === "string" ? record.command : "";

    return { command };
  } catch {
    return undefined;
  }
}

function ask(reason: string): ShellDecision {
  return {
    permission: "ask",
    user_message: reason,
    agent_message: reason,
  };
}
