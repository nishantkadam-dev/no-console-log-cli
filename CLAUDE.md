# no-console-log-cli — CLAUDE.md

Context for AI agents and new teammates. Read this before touching anything.

---

## What this repo is

A Node.js CLI tool called `lint-check` that flags `console.log` statements
in JavaScript files using a **custom ESLint rule**. Output is always JSON.
Exit code `1` if violations found, `0` if clean.

**The custom rule (`rules/no-console-log.js`) is the core artifact.**
The CLI (`bin/cli.js`) is a thin wrapper that runs ESLint with that rule
and formats the result as JSON.

## What this repo is NOT

- Not a general ESLint config or full linter setup
- Not a code formatter
- Not an auto-fixer — it reports only, never modifies files
- Not interactive — output is always JSON, never prompts

---

## Commands

```bash
# Install
npm install

# Link CLI globally (required before first run)
npm link

# Run the CLI
lint-check ./src
lint-check . --ignore node_modules,dist,tests

# Run tests
npm test

# Verify link worked
lint-check --version
```

---

## Project structure

```
bin/cli.js                 # CLI entry — commander arg parsing + ESLint runner + JSON output
rules/no-console-log.js    # Custom ESLint rule — the core logic
src/                       # Source modules used by cli.js
tests/
  no-console-log.test.js   # Jest RuleTester tests for the ESLint rule
.claude/
  skills/
    lint-check/
      SKILL.md             # Claude Code companion skill (Day 8)
CLAUDE.md                  # This file
package.json
```

---

## Conventions

- **ESM only** — "type": "module" in package.json. Use import/export. Never require().
- **Output is always JSON** — do not add console.log, interactive prompts, or coloured text to CLI output. The output must be pipeable.
- **CLI entry is bin/cli.js** — not index.js, not src/index.js
- **Commander for arg parsing** — commander@^14. Do not add yargs or minimist.
- **Tests use Jest RuleTester** — tests are for the ESLint rule, not for the CLI wrapper

---

## Testing

```bash
npm test
# Uses: jest@^30 with --experimental-vm-modules (ESM support)
# 6 tests total:
#   Valid: console.warn, console.error, logger.log — must NOT be flagged
#   Invalid: console.log — must be flagged with the correct message
```

If tests fail after changes to rules/no-console-log.js:
The rule message must exactly match:
"Unexpected console.log — remove before production. Use a proper logger instead."

---

## Non-obvious decisions

1. Custom rule instead of .eslintrc config — reason: the rule is standalone and
   testable with RuleTester without needing a full ESLint config in the scanned project.

2. --experimental-vm-modules flag in test script — reason: Jest does not natively
   support ESM. This flag enables it. Do not remove it from package.json.

3. Default --ignore is "scripts,tests" — reason: test files contain console.log
   intentionally. Always verify the default ignore list when adding ignore logic.

4. Exit code 1 on violations — reason: Unix convention for "found something".
   CI pipelines treat non-zero as failure. Do not change exit codes.

5. npm link required — reason: makes lint-check available as a global command.
   Without it, run: node bin/cli.js

---

## Claude Code Skill

Companion skill at .claude/skills/lint-check/SKILL.md.
Guides Claude through: install check → command construction → JSON interpretation
→ next-action recommendation → CI snippet generation.

Invoke: /lint-check ./src
Or naturally: "scan my code for console.logs"

---
