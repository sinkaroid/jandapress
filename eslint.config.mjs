import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import globals from "globals";

export default [
  {
    ignores: ["node_modules/**", "build/**"],
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 12,
        sourceType: "module",
      },
      globals: {
        ...globals.node,
        console: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["error", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "ignoreRestSiblings": true
      }],
      "no-undef": "error",
      "linebreak-style": 0,
      "quotes": ["error", "double"],
      "semi": ["error", "always"],
      "no-empty": "error",
      "no-func-assign": "error",
      "no-case-declarations": "off",
      "no-unreachable": "error",
      "no-eval": "error",
      "no-global-assign": "error",
      "@typescript-eslint/no-explicit-any": "warn",
      "indent": ["error", 2],
    },
  },
];