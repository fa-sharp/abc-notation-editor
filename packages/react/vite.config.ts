import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    minify: false,
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      fileName: "abc-editor",
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: [
        "react",
        "react/jsx-runtime",
        "react-dom",
        "tonal",
        "abcjs",
        "@abc-editor/core",
        "@szhsin/react-menu",
      ],
    },
  },
  plugins: [
    react(),
    tsconfigPaths(),
    dts({ entryRoot: "./src", rollupTypes: true }),
  ],
});
