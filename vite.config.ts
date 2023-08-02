import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import pkg from "./package.json";
import path from "node:path";

export default defineConfig({
  build: {
    lib: {
      name: "zurreal",
      entry: "./src/index.ts",
    },
    rollupOptions: {
      external: Object.keys(pkg.devDependencies),
      output: {
        globals: {
          zod: "Surrealdb",
          "surrealdb.js": "Zod",
        },
      },
    },
    target: "esnext",
  },
  resolve: {
    alias: [
      {
        find: "@",
        replacement: path.resolve(__dirname, "src"),
      },
    ],
  },
  plugins: [dts()],
});
