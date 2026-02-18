import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/types.ts'],
  format: 'esm',
  dts: true,
})
