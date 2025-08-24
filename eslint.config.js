import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node, // ✅ Node.js environment
      },
    },
    extends: [
      js.configs.recommended, // ✅ use @eslint/js recommended rules
    ],
    rules: {
      semi: ['error', 'always'],
      quotes: ['error', 'single', { allowTemplateLiterals: true }],
      indent: ['off', 6], // 2 spaces
      'no-console': 'off', // console.log → warning
      eqeqeq: ['error', 'always'], // force === instead of ==
      'keyword-spacing': ['error', { before: true, after: true }], // if (x) { … }
      'no-multi-spaces': 'error', // disallow multiple spaces
      'no-unused-vars': 'off',
      //  curly: ['error', 'all'], // always use braces
      //  'newline-before-return': 'error',
    },
  },
]);
