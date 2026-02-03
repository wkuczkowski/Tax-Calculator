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
            "^(TAX_CONSTANTS|TAX_BAND_12|TAX_BAND_32|PIT_RATE_SOLIDARITY|EFFECTIVE_LINEAR_RATE|EFFECTIVE_LINEAR_RATE_SOLIDARITY|EFFECTIVE_IPBOX_PLUS_HEALTH|taxMath)$",
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
        TAX_BAND_12: "readonly",
        TAX_BAND_32: "readonly",
        PIT_RATE_SOLIDARITY: "readonly",
        EFFECTIVE_LINEAR_RATE: "readonly",
        EFFECTIVE_LINEAR_RATE_SOLIDARITY: "readonly",
        EFFECTIVE_IPBOX_PLUS_HEALTH: "readonly",
        taxMath: "readonly",
      },
    },
  },
];
