// vite.config.js
import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  plugins: [glsl({
    

    compress: true, // Optional: compacts the shader code

  })],
  include: [
    'glsl-fft',
    'is-power-of-two' // Explicitly tell Vite to pre-bundle this dependency
  ],
});