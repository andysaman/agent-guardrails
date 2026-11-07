import type { RuleExample } from "../types.ts";

export const protectedForcePushExamples: readonly RuleExample[] = [
  { title: "Allow a normal feature-branch push", command: "git push origin feature/login" },
  { title: "Deny force-push to main", command: "git push --force origin main" },
  { title: "Ask when the force-push target is unclear", command: "git push --force" },
  {
    title: "Ask for force-push to a non-protected branch",
    command: "git push -f origin feature/login",
  },
];
