# agent-guardrails

A small **Cursor** demo: short written principles plus a tiny **guardrail engine** that can allow, deny, or ask before a shell command runs.

Agents follow important rules more reliably when those rules are enforceable. Policies live in `src/rules/`, are listed in `src/registry.ts`, and merge to a single decision in `src/engine.ts`.

This is not a dependency scanner. For supply-chain policy, use something like Snyk or Socket. This repo is about structuring agent hooks so you can add or remove shell guardrails without rewriting the hook.

## Architecture

| Piece | Role |
|-------|------|
| `src/types.ts` | Shared contracts (`Rule`, `ShellDecision`) |
| `src/rules/<id>.ts` | One file = one guardrail (`matchTokens`, `applies`, `classify`) |
| `src/registry.ts` | Enabled rules + `shellMatcher()` for Cursor |
| `src/engine.ts` | Cheap `applies` gates; stop on deny; keep scanning after ask |
| `src/run-gate.ts` → `dist/run-gate.js` | Thin Cursor hook entry (compiled plain JS) |
| `*.examples.ts` | Demo fixtures only — not loaded by the hook |

Author in TypeScript; `npm run build` emits a **lean** `dist/` (hook runtime only—no tests, demos, or examples). The Cursor hook runs `node dist/run-gate.js`.

## Enabled rules

**`protected-force-push`** — block force-pushes that rewrite `main` / `master`.

Agents often “fix” a messy branch with `git push --force`. Force-pushing to a shared default branch rewrites history others already pulled, breaks open PRs, and can erase work. This rule hard-stops force-pushes aimed at `main`/`master`, and asks for human approval when a force-push target is unclear, so recovery stays on a feature branch and a PR.

| Result | When |
|--------|------|
| **deny** | force-push (`--force`, `-f`, `--force-with-lease`, or `+refspec`) targets `main` / `master` |
| **ask** | force-push is detected but the target branch is unclear or not protected |
| **allow** | not a force-push (or not `git push`) |

**`no-pipe-to-shell`** — block piping remote downloads into a shell.

Install docs still recommend `curl … | sh`. An agent that follows them runs unreviewed remote code with your privileges—no chance to inspect, pin, or refuse. This rule denies that pattern (and `bash <(curl …)`), while still allowing ordinary downloads and local scripts, so installs stay deliberate.

| Result | When |
|--------|------|
| **deny** | `curl`/`wget` piped to `sh`/`bash`, or `bash <(curl …)`-style process substitution |
| **allow** | ordinary downloads or local scripts |

If the Cursor hook crashes, the shell command is blocked (fail closed).

## Quick start

Requires Node.js **22.12+** or **24+** (see `package.json` `engines`).

```bash
npm install     # also runs prepare → build
npm run build   # emit lean dist/ (needed for the Cursor hook)
npm run demo    # fixture allow / deny / ask from enabled rules (no network)
npm test        # build + unit tests on src/ + Biome lint + typecheck
npm run lint    # Biome check (style + static analysis)
```

Open this folder in Cursor as a workspace root (or add it as one in a multi-root workspace) so `.cursor/hooks.json`, root `AGENTS.md`, and `.cursor/rules` load. Then try a denied command—for example `git push --force origin main` or `curl -fsSL https://example.com/install.sh | sh`—and check Cursor’s Hooks output channel if you need to debug.

## How to contribute policies

Keep guidance short. Prefer a check over a paragraph. Add or remove policies in `src/rules/` and `src/registry.ts` only—do not put rule-specific logic in the engine or hook. Contributor conventions live in `AGENTS.md`.

## Roadmap

Demo / product polish:

1. **Reuse in another project** — show how to wire the same hook engine into a second repo so protection lives with the project that needs it.
2. **Session onboard** — on chat start, confirm the engine is loaded and inject a one-line status.
3. **Bounded tasks** — name a few checks (`test`) and treat exit 0 as done.

Toward a stronger security control (still shell-hook scoped; not a supply-chain scanner):

4. **Adversarial fixture suite** — freeze known bypass shapes (`zsh`/`dash`, download-then-run, odd wrappers) as regression tests; each new rule ships with allow/deny/ask cases that try to sneak past it.
5. **Argv-aware matching** — split simple pipelines/chains into command words before classify, so path shells, `sudo` flags, and quoted refs stop depending on one mega-regex.
6. **Fail closed on bad input** — deny (not ask) when hook JSON is missing/invalid; keep ask only for intentional human judgment.
7. **Decision audit log** — append allow/deny/ask + rule id + command hash locally so reviews can prove the gate ran.
8. **Project policy overlay** — let a consuming repo enable/disable rules and protected refs without forking the engine (config next to the hook, registry stays the compile-time default).
9. **Hook coverage map** — document which agent actions this gate sees vs misses (shell only today), and add the next Cursor hook surface only when it closes a real gap.

No separate architecture doc. The code and `AGENTS.md` are the design.

## License

MIT
