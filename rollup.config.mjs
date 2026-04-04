import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import terser from "@rollup/plugin-terser";
import serve from "rollup-plugin-serve";

const dev = process.env.ROLLUP_WATCH;

export default {
  input: "src/irrigation-card.ts",
  output: {
    file: "dist/irrigation-card.js",
    format: "es",
    inlineDynamicImports: true,
    sourcemap: dev ? true : false,
  },
  plugins: [
    typescript(),
    resolve(),
    commonjs(),
    json(),
    dev &&
      serve({
        contentBase: ["dist"],
        host: "0.0.0.0",
        port: 5000,
        headers: { "Access-Control-Allow-Origin": "*" },
      }),
    !dev && terser({ format: { comments: false } }),
  ],
  onwarn(warning, warn) {
    if (warning.code === "THIS_IS_UNDEFINED") return;
    warn(warning);
  },
};
