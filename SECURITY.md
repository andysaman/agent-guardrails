# Security policy

## Scope

This repository is a **Cursor hook demo**: pluggable shell allow/deny/ask rules. It is not a dependency scanner, sandbox, or general command firewall.

In scope: bypasses of enabled rules, fail-open behavior in the hook/engine, and CI or supply-chain issues in this repo.

Out of scope: Cursor product vulnerabilities, third-party package CVEs (prefer upstream/`npm audit`), and general shell hardening advice unrelated to this gate.

## Reporting a vulnerability

Open a [GitHub security advisory](https://github.com/andysaman/agent-guardrails/security/advisories/new) if the issue could be exploited by someone other than the machine owner, or email the maintainer via the address on the [GitHub profile](https://github.com/andysaman) for sensitive reports.

For known demo gaps (wrapper bypasses, alternate shells, download-then-run), prefer a normal [issue](https://github.com/andysaman/agent-guardrails/issues) with the command string and expected vs actual decision.
