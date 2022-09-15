module.exports = {
    root: true,
    env: {
        es6: true,
        node: true,
    },
    extends: [
        "eslint:recommended",
        "plugin:import/errors",
        "plugin:import/warnings",
        "plugin:import/typescript",
        "google",
        "plugin:@typescript-eslint/recommended",
        "plugin:prettier/recommended",
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: ["tsconfig.json", "tsconfig.dev.json"],
        sourceType: "module",
        tsconfigRootDir: __dirname,
    },
    ignorePatterns: [
        "/lib/**/*", // Ignore built files.
        "**/*/graphql/generated/types.ts",
    ],
    plugins: ["@typescript-eslint", "import", "prettier"],
    rules: {
        quotes: ["error", "double"],
        "import/no-unresolved": 0,
        "prettier/prettier": "error",
        camelcase: "ignoreImports",
    },
};
