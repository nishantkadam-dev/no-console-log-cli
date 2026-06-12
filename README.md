# lint-check

> Flags `console.log` statements in JavaScript files using a custom ESLint rule.  
> Outputs structured JSON. CI pipeline ready. Exit code `1` on violations.

---

## What this is

A Node.js CLI that scans a folder for `console.log` calls and reports them as JSON.
Built with a custom ESLint rule (not `.eslintrc` config) so the rule is portable and testable standalone.

**Allows:** `console.warn`, `console.error`, `logger.log`  
**Flags only:** `console.log`

## What this is NOT

- Not a general linter — it does not enforce style, formatting, or other rules
- Not an auto-fixer — it reports violations, does not remove them
- Not a replacement for ESLint config in your project — it is a standalone scan tool

---

## Install

```bash
git clone https://github.com/nishantkadam-dev/no-console-log-cli.git
cd no-console-log-cli
npm install
npm link
```

Verify:

```bash
lint-check --version
# 1.0.0
```

---

## Usage

```bash
lint-check <path> [options]
```

| Argument / Option     | Description                       | Default         |
|-----------------------|-----------------------------------|-----------------|
| `<path>`              | Folder to scan (required)         | —               |
| `-i, --ignore <dirs>` | Comma-separated folders to ignore | `scripts,tests` |
| `-V, --version`       | Show version                      | —               |
| `-h, --help`          | Show help                         | —               |

---

## Examples

```bash
# Scan src folder
lint-check ./src

# Ignore specific folders
lint-check ./src --ignore scripts,tests

# Scan entire project (always ignore node_modules)
lint-check . --ignore node_modules,dist,tests

# Pipe output to a file
lint-check ./src > results.json
```

---

## Output

**No violations (exit code 0):**

```json
{
  "summary": {
    "total_files_scanned": 3,
    "total_violations": 0,
    "status": "passed"
  },
  "violations": []
}
```

**Violations found (exit code 1):**

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
      "message": "Unexpected console.log — remove before production. Use a proper logger instead."
    }
  ]
}
```

---

## Exit codes

| Code | Meaning              |
|------|----------------------|
| `0`  | No violations found  |
| `1`  | Violations detected  |

---

## CI Integration

```yaml
# GitHub Actions
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

## Run tests

```bash
npm test
# 6 tests — valid cases (console.warn, console.error, logger.log) and invalid (console.log)
```

---

## Project structure

```
no-console-log-cli/
├── bin/
│   └── cli.js                   # CLI entry — arg parsing, ESLint runner, JSON output
├── rules/
│   └── no-console-log.js        # Custom ESLint rule — reusable standalone
├── src/                         # Source modules
├── tests/
│   └── no-console-log.test.js   # Jest RuleTester TDD tests
├── .claude/
│   └── skills/
│       └── lint-check/
│           └── SKILL.md         # Claude Code companion skill
├── CLAUDE.md                    # Context for AI agents and new teammates
└── package.json
```

---

## Claude Code Skill (Day 8)

This repo ships a companion **Claude Code skill** at `.claude/skills/lint-check/SKILL.md`.

The skill guides Claude through:
1. Verifying `lint-check` is installed
2. Building the correct command for your path
3. Interpreting the JSON output per violation (delete vs. replace with logger)
4. Recommending next actions based on violation count
5. Writing CI integration snippets on request

**Invoke:**

```bash
/lint-check ./src
# or naturally: "scan my src folder for console.logs"
```

---

## Stack

| Thing | Detail |
|---|---|
| Language | JavaScript ESM (`"type": "module"`) |
| CLI framework | `commander@^14` |
| Linting engine | `eslint@^10` |
| Test framework | `jest@^30` |
| Node quirk | `--experimental-vm-modules` required for ESM + Jest |
