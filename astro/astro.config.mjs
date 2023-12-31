import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  integrations: [starlight({
    title: '🎶 ABC Editor',
    social: {
      github: 'https://github.com/fa-sharp/abc-notation-editor'
    },
    sidebar: [{
      label: 'Guides',
      autogenerate: {
        directory: "/guides"
      }
    }, {
      label: 'Reference',
      autogenerate: {
        directory: 'reference'
      }
    }],
    customCss: [
      './src/styles/starlight.css'
    ]
  }), react()]
});