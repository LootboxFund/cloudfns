module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "plugin:prettier/recommended",
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
    "/node_modules/**/*",
  ],
  plugins: ["@typescript-eslint", "import"],
  rules: {
    quotes: ["error", "double"],
    "no-unused-vars": "off",
    indent: ["off"],
    "quote-props": ["off"],
    "object-curly-spacing": ["off"],
    camelcase: ["off"],
    "@typescript-eslint/no-unused-vars": ["off"],
  },
};
