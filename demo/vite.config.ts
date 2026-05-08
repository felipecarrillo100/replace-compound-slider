import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    // Force a single copy of React when the library is a file: dependency.
    // Without this, Vite resolves the library's 'react' import from the root
    // node_modules (v18 devDep) while the demo uses demo/node_modules (v19),
    // causing "Cannot read properties of null (reading 'useRef')".
    dedupe: ['react', 'react-dom'],
    alias: {
      react: path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom'),
    },
  },
  build: {
    outDir: '../docs/demo',
    emptyOutDir: true,
  },
});
