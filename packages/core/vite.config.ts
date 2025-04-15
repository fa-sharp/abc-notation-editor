import { resolve } from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  build: {
    minify: false,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "ABCEditorCore",
      fileName: "abc-editor-core",
    },
    rollupOptions: {
      external: ["tonal", "abcjs"],
      output: {
        globals: {
          tonal: "Tonal",
          abcjs: "ABCJS",
        },
      },
    },
  },
  plugins: [tsconfigPaths(), dts({ entryRoot: "./src", rollupTypes: true })],
});
