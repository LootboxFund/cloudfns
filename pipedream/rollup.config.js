import typescript from "rollup-plugin-typescript2";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import json from "@rollup/plugin-json";
import globals from "rollup-plugin-node-globals";
import builtins from "rollup-plugin-node-builtins";
import nodePolyfills from "rollup-plugin-node-polyfills";

const configAction_gbucketUploadJSON = {
  input: "src/actions/gbucketUploadJSON.ts",
  output: {
    file: "lib/actions/gbucketUploadJSON.js",
    format: "cjs",
    sourcemap: true,
    exports: "default",
  },
  plugins: [
    commonjs(), // enable CommonJS modules
    nodePolyfills(), // enable NodeJS polyfills
    resolve({ preferBuiltins: true, browser: true }), // enable importing from node_modules
    typescript(), // enable TypeScript
    json(), // enable JSON
    globals(), // allows globals to be imported (process.env)
    builtins(), // allows builtins to be imported via require/import
  ],
  external: ["react"],
};
if (process.env.NODE_ENV === "production") {
  configAction_gbucketUploadJSON.plugins.push(terser()); // enable minification
}

const configAction_gbucketIndexJSON = {
  input: "src/actions/gbucketIndexJSON.ts",
  output: {
    file: "lib/actions/gbucketIndexJSON.js",
    format: "cjs",
    sourcemap: true,
    exports: "default",
  },
  plugins: [
    commonjs(), // enable CommonJS modules
    nodePolyfills(), // enable NodeJS polyfills
    resolve({ preferBuiltins: true, browser: true }), // enable importing from node_modules
    typescript(), // enable TypeScript
    json(), // enable JSON
    globals(), // allows globals to be imported (process.env)
    builtins(), // allows builtins to be imported via require/import
  ],
  external: ["react"],
};
if (process.env.NODE_ENV === "production") {
  configAction_gbucketIndexJSON.plugins.push(terser()); // enable minification
}

// const configSource = {
//   input: "src/sources/hellosource.ts",
//   output: {
//     file: "lib/sources/hellosource.js",
//     format: "cjs",
//     sourcemap: true,
//     exports: "default",
//   },
//   plugins: [
//     commonjs(), // enable CommonJS modules
//     nodePolyfills(), // enable NodeJS polyfills
//     resolve({ preferBuiltins: true, browser: true }), // enable importing from node_modules
//     typescript(), // enable TypeScript
//     json(), // enable JSON
//     globals(), // allows globals to be imported (process.env)
//     builtins(), // allows builtins to be imported via require/import
//   ],
//   external: ["react"],
// };
// if (process.env.NODE_ENV === "production") {
//   configSource.plugins.push(terser()); // enable minification
// }

export default [configAction_gbucketUploadJSON, configAction_gbucketIndexJSON];
