#!/usr/bin/env node

import { parseArgs } from "node:util";
import { ESLint } from "eslint";
import noConsoleLog from "../rules/no-console-log.js";

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    ignore: {
      type: "string",
      short: "i",
    },
  },
});

const targetPath = positionals[0];
const ignoredDirs = values.ignore ? values.ignore.split(",") : ["scripts", "tests"];

const eslint = new ESLint({
  overrideConfigFile: true,
  overrideConfig: [
    {
      plugins: {
        custom: {
          rules: {
            "no-console-log": noConsoleLog,
          },
        },
      },
      rules: {
        "custom/no-console-log": "error",
      },
      ignores: ignoredDirs.map((d) => `**/${d}/**`),
    },
  ],
});

const results = await eslint.lintFiles([`${targetPath}/**/*.js`]);

const violations = [];

for (const result of results) {
  const sourceLines = result.source ? result.source.split("\n") : [];

  for (const msg of result.messages) {
    violations.push({
      file_path: result.filePath,
      line: msg.line,
      column: msg.column,
      value_in_log: sourceLines[msg.line - 1]?.trim() ?? "unknown",
      message: msg.message,
    });
  }
}

const output = {
  summary: {
    total_files_scanned: results.length,
    total_violations: violations.length,
    status: violations.length === 0 ? "passed" : "failed",
  },
  violations,
};

process.stdout.write(JSON.stringify(output, null, 2) + "\n");
process.exit(violations.length === 0 ? 0 : 1);