/**
 * Shows enabled rules with their fixture examples. No network.
 * Examples live outside the hook import graph.
 */

import { examplesById } from "./demo-fixtures.ts";
import { decideCommand } from "./engine.ts";
import { rules } from "./registry.ts";

for (const rule of rules) {
  const examples = examplesById[rule.id] ?? [];
  process.stdout.write(`# ${rule.id}\n\n`);
  for (const example of examples) {
    const decision = decideCommand(example.command, [rule]);
    process.stdout.write(
      `${example.title}\n$ ${example.command}\n${JSON.stringify(decision, null, 2)}\n\n`,
    );
  }
}

process.stdout.write("Fixture only. Add or remove guardrails in src/registry.ts.\n");
