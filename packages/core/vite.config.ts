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
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: ["tonal", "abcjs"],
    },
  },
  plugins: [tsconfigPaths(), dts({ entryRoot: "./src", rollupTypes: true })],
});
