import { defineConfig } from 'vite';
// import dts from 'vite-plugin-dts';

export default defineConfig(({ mode }) => {
  if (mode !== 'umd') return {};
  return {
    build: {
      lib: {
        entry: './src/index.ts',
        name: 'CommandStack',
        formats: ['umd'],
        fileName: (format) => `index.js`,
      },
      sourcemap: true,
    },
    // plugins: [dts()],
  };
});
