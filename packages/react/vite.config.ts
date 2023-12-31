import { defineConfig } from "vite";
import path from "node:path";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    minify: false,
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "ABCEditorReact",
      fileName: "abc-editor",
    },
    rollupOptions: {
      external: [
        "react",
        "react/jsx-runtime",
        "react-dom",
        "tonal",
        "abcjs",
        "@abc-editor/core",
      ],
      output: {
        globals: {
          "@abc-editor/core": "ABCEditorCore",
          react: "React",
          "react/jsx-runtime": "react/jsx-runtime",
          "react-dom": "ReactDOM",
          abcjs: "ABCJS",
          tonal: "Tonal",
        },
      },
    },
  },
  plugins: [
    react(),
    tsconfigPaths(),
    dts({ entryRoot: "./src", rollupTypes: true }),
  ],
});
