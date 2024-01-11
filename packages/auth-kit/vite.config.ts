import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import dts from "vite-plugin-dts";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    vanillaExtractPlugin(),
    dts({ rollupTypes: true }),
    nodePolyfills({ include: ["buffer"] }),
  ],
  build: {
    lib: {
      formats: ["es"],
      entry: resolve(__dirname, "src/index.ts"),
      fileName: "auth-kit",
    },
    rollupOptions: {
      external: [
        "react",
        "react/jsx-runtime",
        "react-dom",
        "@farcaster/auth-client",
      ],
    },
  },
});
