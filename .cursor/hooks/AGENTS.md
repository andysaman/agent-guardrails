# Hook wiring

Thin Cursor entry: compiled `dist/run-gate.js` (from `src/run-gate.ts`).

- Keep stdin/stdout and other I/O in `src/run-gate.ts`.
- Do not import rule modules from the hook — the engine loads `registry.ts`.
- Do not rename the hook entry when adding or removing guardrails.
- `.cursor/hooks.json` must run `node dist/run-gate.js` (build with `npm run build`).
- When editing engine or registry behavior, follow `src/AGENTS.md`.
