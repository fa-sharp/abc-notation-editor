import { viteCommonjs } from '@originjs/vite-plugin-commonjs'
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  site: "https://fa-sharp.github.io",
  base: import.meta.env.DEV ? "" : "abc-notation-editor",
  integrations: [starlight({
    title: '🎶 ABC Editor',
    social: {
      github: 'https://github.com/fa-sharp/abc-notation-editor'
    },
    sidebar: [{
      label: 'Guides',
      autogenerate: {
        directory: "guides"
      }
    }, {
      label: 'Reference',
      autogenerate: {
        directory: 'reference'
      }
    }],
  }), react()],
  vite: {
    ssr: {
      noExternal: ['abcjs'],
    },
    plugins: [viteCommonjs()]
  }
});