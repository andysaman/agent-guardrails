/**
 * Demo-only fixtures. Not imported by the hook or engine.
 */

import { noPipeToShellExamples } from "./rules/no-pipe-to-shell.examples.ts";
import { protectedForcePushExamples } from "./rules/protected-force-push.examples.ts";
import type { RuleExample } from "./types.ts";

export const examplesById: Readonly<Record<string, readonly RuleExample[]>> = {
  "protected-force-push": protectedForcePushExamples,
  "no-pipe-to-shell": noPipeToShellExamples,
};
