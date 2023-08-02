import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import pkg from "./package.json";

export default defineConfig({
  build: {
    lib: {
      name: "zurreal",
      entry: "./src/index.ts",
    },

    rollupOptions: {
      external: Object.keys(pkg.devDependencies),
    },
    target: "esnext",
  },
  plugins: [dts()],
});
