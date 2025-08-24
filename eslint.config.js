import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintPluginNode from 'eslint-plugin-n';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ['**/*.{js,ts,tsx,mjs,cjs}'],
    ignores: ['node_modules/**', 'dist/**', 'build/**'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      n: eslintPluginNode,
    },
    rules: {
      'n/no-unsupported-features/es-syntax': 'off',
      'prettier/prettier': [
        'error',
        {
          semi: true,
          singleQuote: true,
          tabWidth: 2,
          trailingComma: 'all',
          printWidth: 80,
        },
      ],
      quotes: [
        'error',
        'single',
        { avoidEscape: true, allowTemplateLiterals: true },
      ],
      indent: ['warn', 2],
    },
  },
  eslintPluginPrettierRecommended,
];
