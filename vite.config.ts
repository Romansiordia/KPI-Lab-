import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Asegura que las rutas de los assets sean relativas para evitar 404 en GitHub Pages
  define: {
    'process.env': process.env
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});