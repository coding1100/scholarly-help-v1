// Loads .env into process.env before any app module reads it. Import this first.
import { existsSync, readFileSync } from "fs";
import path from "path";

const file = path.resolve(process.cwd(), process.env.ENV_FILE || ".env");
if (existsSync(file)) {
  for (const line of readFileSync(file, "utf8").replace(/^﻿/, "").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m || process.env[m[1]] !== undefined) continue;
    let value = m[2];
    if (/^(['"]).*\1$/.test(value)) value = value.slice(1, -1);
    process.env[m[1]] = value;
  }
}
