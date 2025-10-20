// vite.config.js
import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  plugins: [glsl()],
  assetsInclude: ['**/*.glsl'],    include: [
      'glsl-fft',
      'is-power-of-two' // Explicitly tell Vite to pre-bundle this dependency
    ],
});