import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  // Base config for all JS files
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      // You can customize rules here
      // "no-console": "off",
    },
  },
  // Config for taxConstants.js - defines the globals, so no-unused-vars should be off for exported globals
  {
    files: ["**/taxConstants.js"],
    rules: {
      "no-unused-vars": [
        "error",
        {
          varsIgnorePattern:
            "^(TAX_CONSTANTS|TAX_CONSTANTS_BY_YEAR|TAX_CONSTANTS_META_BY_YEAR|TAX_CONSTANT_LABELS|TAX_CONSTANT_GROUPS|TAX_STATUS_LABELS|TAX_YEAR_INFO|TAX_SCENARIOS|taxYears|taxMath)$",
        },
      ],
    },
  },
  // Config for files that consume globals from taxConstants.js
  {
    files: ["**/script.js"],
    languageOptions: {
      globals: {
        TAX_CONSTANTS: "readonly",
        TAX_CONSTANTS_BY_YEAR: "readonly",
        TAX_CONSTANTS_META_BY_YEAR: "readonly",
        TAX_CONSTANT_LABELS: "readonly",
        TAX_CONSTANT_GROUPS: "readonly",
        TAX_STATUS_LABELS: "readonly",
        TAX_YEAR_INFO: "readonly",
        TAX_SCENARIOS: "readonly",
        taxYears: "readonly",
        taxMath: "readonly",
      },
    },
  },
  // Config for Node tools (reference model, regression scripts) - ESM modules run with node
  {
    files: ["tools/**/*.{js,mjs}"],
    languageOptions: {
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
  },
  // Config for tests - ESM modules running under Vitest/Node
  {
    files: ["app/tests/**/*.js"],
    languageOptions: {
      sourceType: "module",
      globals: {
        ...globals.node,
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        vi: "readonly",
      },
    },
  },
];
