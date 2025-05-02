import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: { plugins: {} }
});

const eslintConfig = [
  ...compat.config({
    extends: [
      'next/core-web-vitals', 
      'next/typescript',
      'plugin:@typescript-eslint/recommended',
      'prettier'
    ],
    rules: {
      // Custom rules can be added here
      'react/no-unescaped-entities': 'warn',
      '@next/next/no-img-element': 'warn',
      'jsx-a11y/alt-text': 'error', // Enforce accessibility
      'react-hooks/rules-of-hooks': 'error', // Enforce Rules of Hooks
      'react-hooks/exhaustive-deps': 'warn' // Checks effect dependencies
    },
    settings: {
      next: {
        rootDir: '.',
      },
    },
  }),
]

export default eslintConfig
