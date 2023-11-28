import { resolve } from "node:path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    minify: false,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "ABCEditorCore",
      fileName: "abc-editor-core",
    },
    rollupOptions: {
      external: ["tonal"],
      output: {
        globals: {
          tonal: "Tonal",
        },
      },
    },
  },
  plugins: [tsconfigPaths(), dts({ entryRoot: "./src", rollupTypes: true })],
});
