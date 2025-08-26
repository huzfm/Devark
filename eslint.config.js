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

                  // 6-space indentation
                  "indent": ["error", 6, { "SwitchCase": 2 }]
            },
      },
];
