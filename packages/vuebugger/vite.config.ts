import { resolve } from 'node:path'

import vue from '@vitejs/plugin-vue'
import dts from 'unplugin-dts/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  define: {
    'import.meta.env.DEV': 'import.meta.env.DEV',
  },
  plugins: [
    vue(),
    dts({
      processor: 'vue',
      tsconfigPath: './tsconfig.json',
      include: ['src'],
      exclude: ['src/**/*.test.ts'],
    }),
  ],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    rolldownOptions: {
      external: ['vue'],
    },
  },
})
