import { defineConfig } from "vite";
import path from "node:path";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import dts from "vite-plugin-dts";
import { libInjectCss } from "vite-plugin-lib-inject-css";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "ReactABCEditor",
      fileName: "abc-editor",
    },
    rollupOptions: {
      external: ["react", "react/jsx-runtime", "react-dom", "abcjs"],
      output: {
        globals: {
          react: "React",
          "react/jsx-runtime": "react/jsx-runtime",
          "react-dom": "ReactDOM",
          abcjs: "ABCJS",
        },
      },
    },
  },
  plugins: [
    react(),
    tsconfigPaths(),
    dts({ entryRoot: "./src" }),
    libInjectCss(),
  ],
});
