import { resolve } from 'node:path'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      tsconfigPath: './tsconfig.json',
      include: ['src'],
      exclude: ['src/**/*.test.ts'],
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(import.meta.dirname, 'src/index.ts'),
        basicTooltip: resolve(
          import.meta.dirname,
          'src/basicTooltip.css',
        ),
      },
      formats: ['es'],
    },
    rolldownOptions: {
      external: ['vue', '@floating-ui/vue'],
      output: {
        assetFileNames: '[name][extname]',
      },
    },
    cssCodeSplit: true,
  },
})
