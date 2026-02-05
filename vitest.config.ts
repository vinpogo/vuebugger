import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    reporters: process.env.GITHUB_ACTIONS
      ? ['dot', 'github-actions']
      : ['dot'],
  },
})
