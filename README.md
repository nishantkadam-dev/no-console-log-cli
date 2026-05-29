# lint-check

A CLI tool that flags `console.log` statements in production JavaScript code using a custom ESLint rule. Outputs structured JSON — CI pipeline ready.

---

## Installation

```bash
npm install
npm link
```

---

## Usage

```bash
lint-check <path> [options]
```

| Argument / Option | Description | Default |
|---|---|---|
| `<path>` | Folder to scan (required) | — |
| `-i, --ignore <dirs>` | Comma-separated folders to ignore | `scripts,tests` |
| `-V, --version` | Show version | — |
| `-h, --help` | Show help | — |

---

## Examples

```bash
# Scan src folder
lint-check ./src

# Ignore specific folders
lint-check ./src --ignore scripts,tests

# Scan entire project
lint-check . --ignore node_modules,dist
```

---

## Output

```json
{
  "summary": {
    "total_files_scanned": 1,
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

## Exit Codes

| Code | Meaning |
|---|---|
| `0` | No violations found |
| `1` | Violations detected |

---

## Project Structure

```
my-cli-tool/
├── bin/
│   └── cli.js                   # CLI entry — arg parsing, ESLint runner, JSON output
├── rules/
│   └── no-console-log.js        # Custom ESLint rule (reusable standalone)
├── tests/
│   └── no-console-log.test.js   # RuleTester TDD tests
└── package.json
```

---

## Running Tests

```bash
npm test
```

6 tests covering valid cases (`console.warn`, `console.error`, `logger.log`) and invalid cases (`console.log`).
