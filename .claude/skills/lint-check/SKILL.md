---
name: lint-check
description: >
  Companion skill for the lint-check CLI tool. Guides user through running
  lint-check on a target path, interprets the JSON output, explains each
  violation with context, and recommends next actions.
  Use when asked to run lint-check, scan for console.log, check production
  readiness, or act on lint-check output.
when_to_use: >
  Trigger phrases: "run lint-check", "scan for console.log", "check my code
  for console.logs", "is my code production ready?", "lint-check output",
  "interpret lint results", "fix console.log violations", "act on lint output"
disable-model-invocation: false
argument-hint: "[path/to/scan] [--ignore dirs]"
allowed-tools: Bash(lint-check *) Bash(node *) Bash(npm *)
---

# lint-check — Companion Skill

You are a **senior engineer** helping a teammate use the `lint-check` CLI tool
correctly and act decisively on its output. Your job has two parts:

1. **Guide** — help the user invoke the CLI with the right arguments
2. **Interpret** — read the JSON output and tell the user exactly what to do next

> **Tool:** `lint-check` — flags `console.log` statements in JavaScript files using
> a custom ESLint rule. Outputs structured JSON. CI pipeline ready.
> **Repo:** `github.com/nishantkadam-dev/no-console-log-cli`

---

## Phase 1 — Pre-flight check

Before running anything:

1. Check `lint-check` is installed:
   ```bash
   lint-check --version
   ```
   If it fails → run `npm install && npm link` from the `no-console-log-cli` directory.

2. Confirm the path to scan exists. If no path was given as `$ARGUMENTS`, ask:
   > "Which folder do you want to scan? (e.g. `./src`, `.`, `./app`)"

3. Confirm which folders to ignore. Default is `scripts,tests`.
   If scanning the whole project (`.`), always ignore `node_modules,dist`.

---

## Phase 2 — Build and run the command

Construct the command from the path and ignore list:

```bash
# Basic scan
lint-check ./src

# Ignore specific folders
lint-check ./src --ignore scripts,tests

# Full project scan (always ignore node_modules)
lint-check . --ignore node_modules,dist,tests
```

Run the command and capture output:

```bash
lint-check $ARGUMENTS 2>&1
```

Note the **exit code**:
- `0` → no violations (clean)
- `1` → violations found (must fix before production)

---

## Phase 3 — Interpret the output

The CLI always returns JSON in this shape:

```json
{
  "summary": {
    "total_files_scanned": 3,
    "total_violations": 2,
    "status": "failed"
  },
  "violations": [
    {
      "file_path": "/src/app.js",
      "line": 2,
      "column": 3,
      "value_in_log": "console.log(\"debug info\");",
      "message": "Unexpected console.log — remove before production."
    }
  ]
}
```

### If `status: "passed"` (zero violations)

```
✅ lint-check passed
   Files scanned : N
   Violations    : 0

   Your code has no console.log statements. Safe to ship.
```

No further action needed. Move on.

---

### If `status: "failed"` (violations found)

Print a **human-readable summary** from the JSON:

```
❌ lint-check FAILED
   Files scanned : N
   Violations    : M

   Violations found:
   ─────────────────────────────────────────────
   1. src/app.js  line 2, col 3
      console.log("debug info");
      → Remove or replace with a proper logger

   2. src/utils.js  line 15, col 5
      console.log(user.id, "logged in");
      → This looks like debug code — remove entirely

   ─────────────────────────────────────────────
```

For each violation, provide **one of these diagnoses**:

| Pattern in `value_in_log` | Diagnosis |
|---|---|
| `console.log("debug...")`  | Temporary debug — remove entirely |
| `console.log(variable)`    | Debug trace — remove entirely |
| `console.log(error)`       | Should be `logger.error(error)` |
| `console.log("starting...")` | Should be `logger.info(...)` |
| `console.log(JSON.stringify(...))` | Should use structured logger |

---

## Phase 4 — Recommend next actions

After summarising violations, give exactly **one of these action plans**:

### If 1–3 violations:
```
Next steps:
1. Open each file listed above
2. Delete or replace the console.log with your logger
3. Re-run: lint-check ./src
4. Confirm exit code 0 before pushing
```

### If 4–10 violations:
```
Next steps:
1. Fix violations file by file — start with the ones in src/
2. For each: decide delete vs replace with logger
3. After each file is clean, re-run lint-check on just that file:
   lint-check ./src/app.js
4. When all clean, do a final full scan: lint-check ./src
```

### If 10+ violations:
```
This is a larger cleanup job. Recommended approach:

1. Run with --ignore to scope the problem first:
   lint-check ./src --ignore tests,scripts

2. Fix one file at a time. Commit after each file.

3. Consider adding lint-check to your CI pipeline so
   new console.logs are caught before they reach main:

   # In your CI step:
   lint-check ./src --ignore node_modules,dist
   # Exit code 1 will fail the build automatically.
```

---

## Phase 5 — CI integration advice (if asked)

If the user asks about CI, provide this exact snippet:

```yaml
# GitHub Actions example
- name: Check for console.log
  run: |
    npm install
    npm link
    lint-check ./src --ignore node_modules,dist,tests
  # Exit code 1 = violations = build fails automatically
```

```bash
# Pre-commit hook (.git/hooks/pre-commit)
#!/bin/sh
lint-check ./src --ignore node_modules,dist,tests
if [ $? -ne 0 ]; then
  echo "❌ console.log found. Remove before committing."
  exit 1
fi
```

---

## CLI Quick Reference

```
lint-check <path> [options]

Arguments:
  <path>               Folder to scan (required)

Options:
  -i, --ignore <dirs>  Comma-separated folders to ignore (default: scripts,tests)
  -V, --version        Show version
  -h, --help           Show help

Exit codes:
  0   No violations (clean)
  1   Violations found

Examples:
  lint-check ./src
  lint-check ./src --ignore scripts,tests
  lint-check . --ignore node_modules,dist
```

---

## Project context

- **Tool name:** `lint-check`
- **Binary:** `./bin/cli.js`
- **Install:** `npm install && npm link`
- **Run tests:** `npm test` (Jest, 6 tests)
- **Language:** JavaScript ESM (`"type": "module"`)
- **Dependencies:** `commander@^14`, `eslint@^10`
- **Dev deps:** `jest@^30`
- **Custom ESLint rule:** `rules/no-console-log.js`
- **Allows:** `console.warn`, `console.error`, `logger.log`
- **Flags only:** `console.log`
