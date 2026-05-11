import { resolve } from 'node:path'

import vue from '@vitejs/plugin-vue'
import dts from 'unplugin-dts/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      processor: 'vue',
      tsconfigPath: './tsconfig.json',
    }),
  ],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/types.ts'),
      formats: ['es'],
      fileName: 'types',
    },
  },
})
