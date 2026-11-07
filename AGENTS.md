# Agent notes

Contributor and agent guidance for this Cursor demo. Product intent is in `README.md`. Prefer small, focused changes.

## Don't

- Add runtime dependencies, a bundler, or a framework
- Grow past the current roadmap item without finishing it
- Invent employer names, metrics, or proprietary details
- Write long policy docs when a check will do
- Put rule-specific policy in `engine.ts` or `run-gate.ts` (hooks.json only gets the shared `shellMatcher`)
- Treat this repo as a replacement for Snyk, Socket, or similar dependency scanners
- Point the Cursor hook at TypeScript sources — always run the compiled `dist/run-gate.js`

## Quirks

- **Node 22.12+ or 24+.** Hook runtime is plain ESM in `dist/`. Tests/demo use Node type stripping on `src/`.
- **Author in TypeScript; emit a lean `dist/`.** Source keeps `.ts` import specifiers; `rewriteRelativeImportExtensions` rewrites them on emit. Build excludes tests, examples, and demo.
- **Zero runtime deps.** Tests use `node:test` + `node:assert/strict` on `src/`. Dev-only: Biome, TypeScript.
- **Shared types live in `src/types.ts`.** Rules import types only; they do not import each other.
- **Hook stays generic.** `src/run-gate.ts` → `dist/run-gate.js` never names a rule.
- **`npm run build` (also via `prepare`)** before the Cursor hook can run.
- **Style is enforced by Biome.** Prefer `npm run lint:fix` over hand-formatting; do not bypass `npm run lint`.

## Progressive disclosure

| Path | When |
|------|------|
| `src/AGENTS.md` | Editing under `src/` (engine, registry, rules) |
| `.cursor/hooks/AGENTS.md` | Editing hook wiring |
| `.cursor/rules/gate.mdc` | Auto-attaches for `src/**` and `.cursor/hooks/**` (Cursor globs) |
| `README.md` | Scope, quick start, roadmap |

Open this folder as a **Cursor workspace root** (or add it as one root in a multi-root workspace) so root `AGENTS.md`, nested `AGENTS.md`, hooks, and `.cursor/rules` load. Opening it only as a nested folder under another workspace root is not enough unless that parent workspace also bridges these rules.
