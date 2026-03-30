import { defineConfig } from "tsup";

export default defineConfig({
  target: ["es2021"],
  entryPoints: ["src/index.ts"],
  format: ["esm", "cjs"],
  noExternal: ["@noble/curves"],
  dts: true,
  clean: true,
  shims: true,
});
