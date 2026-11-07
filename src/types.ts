/**
 * Shared contracts. Rules and the engine import this file and nothing from each other.
 */

export type ShellDecision = {
  permission: "allow" | "deny" | "ask";
  user_message?: string;
  agent_message?: string;
};

export type CommandClass =
  | { kind: "allow" }
  | { kind: "deny"; reason: string; agent_message?: string }
  | { kind: "ask"; reason: string; agent_message?: string };

export type RuleExample = {
  title: string;
  command: string;
};

/** One guardrail. Rules import only `types.ts`. */
export type Rule = {
  id: string;
  /**
   * Substrings used to build the Cursor shell matcher.
   * Keep these cheap tokens, not full policy regexes.
   */
  matchTokens: readonly string[];
  /** Cheap reject; if false, skip `classify` (treat as allow). */
  applies(command: string): boolean;
  classify(command: string): CommandClass;
};
