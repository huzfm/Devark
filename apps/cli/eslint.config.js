/** @type {import("eslint").FlatConfig[]} */
export default [
  {
    files: ["*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
      "no-redeclare": "error",
      "no-console": "off",
      "semi": ["error", "always"],
      "quotes": ["error", "double"],

      // 2-space indentation
      "indent": ["error", 2, { "SwitchCase": 1 }]
    },
  },
];
