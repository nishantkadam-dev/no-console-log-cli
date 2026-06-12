# CLI Output Self-Review — lint-check
## Human + AI Readability Audit

---

## What this review is

A self-review of `lint-check`'s `--help` output and error messages.
Test: *"If a developer pastes this output into Claude, do they get useful next steps?"*

---

## 1. `--help` Output

### Current (inferred from README + commander defaults)

```
Usage: lint-check <path> [options]

Options:
  -i, --ignore <dirs>  Comma-separated folders to ignore (default: "scripts,tests")
  -V, --version        output the version number
  -h, --help           display help for command
```

### Review

| Check | Result | Note |
|---|---|---|
| Is the command name clear? | ✅ | `lint-check` — unambiguous |
| Does it show what `<path>` means? | ❌ | No description — just `<path>` |
| Does it show what the tool does? | ❌ | No description line at top |
| Does it show output format? | ❌ | A dev doesn't know it outputs JSON |
| Does it show exit codes? | ❌ | Critical for CI — not shown |
| Does it show a usage example? | ❌ | No example in help |
| Is `-V` description consistent casing? | ⚠️ | lowercase "output" vs uppercase elsewhere |

### Improved `--help`

```
Usage: lint-check <path> [options]

Scans JavaScript files for console.log statements.
Outputs JSON. Exit code 1 if violations found, 0 if clean.

Arguments:
  <path>               Folder to scan (e.g. ./src, ., ./app)

Options:
  -i, --ignore <dirs>  Comma-separated folders to ignore (default: "scripts,tests")
  -V, --version        Show version number
  -h, --help           Show help

Examples:
  lint-check ./src
  lint-check ./src --ignore scripts,tests
  lint-check . --ignore node_modules,dist,tests

Exit codes:
  0   No violations found
  1   Violations detected
```

**What changed and why:**
- Added a one-line description → a dev (and Claude) immediately knows what it does
- Added `Arguments:` section with example paths → `<path>` alone is ambiguous
- Added `Examples:` section → the most common question after `--help`
- Added `Exit codes:` section → critical for CI usage, non-obvious
- Capitalised `-V` description for consistency

**AI test:** Paste the improved help into Claude and ask "how do I use this in CI?"
Claude can now answer correctly from the help text alone, without needing the README.

---

## 2. Error Messages

### Missing `<path>` argument

**Current (commander default):**
```
error: missing required argument 'path'
```

**Review:** The message is correct but cold. A developer who pastes this into Claude gets a generic fix. A developer new to the tool doesn't know what a valid `path` looks like.

**Improved:**
```
Error: Missing required argument <path>

Usage: lint-check <path> [options]

Provide the folder to scan:
  lint-check ./src
  lint-check . --ignore node_modules,dist

Run lint-check --help for all options.
```

**Why:** The error tells you what's wrong AND gives you two working examples. Pasting this into Claude gives it enough context to suggest the exact fix.

---

### Invalid / non-existent path

**Current (likely unhandled — ESLint would throw a raw error):**
```
Error: ENOENT: no such file or directory, scandir '/nonexistent'
```

**Review:** ❌ A raw Node.js ENOENT error. Zero context for the user. Pasting into Claude works but requires Claude to explain what ENOENT means first.

**Improved:**
```
Error: Path not found — "./nonexistent" does not exist or is not a directory.

Check your path:
  lint-check ./src        ✓ relative path to existing folder
  lint-check /abs/path    ✓ absolute path to existing folder
  lint-check ./file.js    ✗ lint-check scans folders, not individual files

Run lint-check --help for usage.
```

**Why:** Names the problem in plain English. Gives a positive and negative example. An AI pasting this gets the constraint ("folders, not files") without needing to infer it from ENOENT.

---

### No `.js` files found

**Current (likely silent — outputs `{"summary":{"total_files_scanned":0,...}}`):**
```json
{
  "summary": {
    "total_files_scanned": 0,
    "total_violations": 0,
    "status": "passed"
  },
  "violations": []
}
```

**Review:** ⚠️ Passes silently with 0 files scanned. A developer scanning the wrong folder gets a false green. This is the most dangerous silent failure.

**Improved — add a warning field:**
```json
{
  "summary": {
    "total_files_scanned": 0,
    "total_violations": 0,
    "status": "passed"
  },
  "violations": [],
  "warnings": [
    "No JavaScript files found in './dist'. Check your path or --ignore list."
  ]
}
```

**Why:** Still passes (no violations = no violations) but the warning field surfaces the silent failure. CI scripts that parse JSON can detect `warnings.length > 0` and alert. Claude reading this output knows immediately to suggest checking the path.

---

### `npm link` not run (command not found)

**Current (shell default):**
```
bash: lint-check: command not found
```

**Review:** ❌ Not our error message — comes from the shell. But the README and `--help` can pre-empt this. The improved `--help` description + README install section already handle this. No change to the binary needed — the fix is in documentation.

---

## 3. Summary of Changes Needed

| Location | Change | Priority |
|---|---|---|
| `bin/cli.js` — commander `.description()` | Add one-line tool description | 🔴 High |
| `bin/cli.js` — commander argument description | Describe `<path>` with example | 🔴 High |
| `bin/cli.js` — commander `.addHelpText('after', ...)` | Add Examples + Exit codes section | 🔴 High |
| `bin/cli.js` — missing path error | Replace raw ENOENT with helpful message | 🟡 Medium |
| `bin/cli.js` — no files found | Add `warnings[]` field to JSON output | 🟡 Medium |
| `bin/cli.js` — missing argument error | Customise commander's default missing-arg message | 🟡 Medium |

---

## 4. The AI-Readability Test

**Rule:** A developer should be able to paste any output from this CLI into Claude and get correct, actionable next steps — without needing to also paste the README.

| Output | Passes test? | After fixes? |
|---|---|---|
| `--help` | ❌ — no description, no examples, no exit codes | ✅ |
| Missing path error | ⚠️ — Claude can guess but needs to explain ENOENT | ✅ |
| ENOENT raw error | ❌ — Claude must explain Node internals first | ✅ |
| Silent 0 files scan | ❌ — false green, Claude sees no problem | ✅ with warnings field |
| Violations JSON | ✅ — structure is clear, Claude can interpret | ✅ already good |
| Clean JSON | ✅ — status: passed is self-explanatory | ✅ already good |
