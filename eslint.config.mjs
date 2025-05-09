import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.config({
    extends: ['next', "next/core-web-vitals", "next/typescript"],
    rules: {
      'react/no-unescaped-entities': 'off',
      '@next/next/no-page-custom-font': 'off',
      "@typescript-eslint/no-unused-vars": "off",
      "react/no-unescaped-entities": 0,
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      // "@typescript-eslint/no-unused-vars": [
      //   "error",
      //   {
      //     "args": "all",
      //     "argsIgnorePattern": "^_",
      //     "caughtErrors": "all",
      //     "caughtErrorsIgnorePattern": "^_",
      //     "destructuredArrayIgnorePattern": "^_",
      //     "varsIgnorePattern": "^_",
      //     "ignoreRestSiblings": true
      //   }
      // ]
    },
  }),

];

export default eslintConfig;
