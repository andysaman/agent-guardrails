// Thin Cursor entry. Decisions live in engine.ts; policies live in rules/.
import { readFileSync } from "node:fs";
import { decideFromHookInput } from "./engine.ts";

process.stdout.write(JSON.stringify(decideFromHookInput(readFileSync(0, "utf8"))));
