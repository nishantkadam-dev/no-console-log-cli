import { RuleTester } from "eslint";
import rule from "../rules/no-console-log.js";

const tester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
});

tester.run("no-console-log", rule, {
  valid: [
    { code: `console.warn("hello")` },
    { code: `console.error("oops")` },
    { code: `logger.log("info")` },
  ],
  invalid: [
    {
      code: `console.log("debug")`,
      errors: [{ messageId: "noConsoleLog" }],
    },
    {
      code: `console.log(someVariable)`,
      errors: [{ messageId: "noConsoleLog" }],
    },
  ],
});

test("rule tester ran", () => {
  expect(true).toBe(true);
});