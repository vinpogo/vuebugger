import type { App, Plugin } from 'vue'
import { setUidGenerator } from './debug'
import { setupComposableDevtools } from './devtools'
import type { PluginOptions } from './types'

export const plugin: Plugin<[PluginOptions?]> = {
  install: (app: App, options?: PluginOptions) => {
    if (!import.meta.env?.DEV) return
    if (options?.uidFn) setUidGenerator(options.uidFn)
    setupComposableDevtools(app)
  },
}
