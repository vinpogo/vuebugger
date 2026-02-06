import type { Plugin } from 'vue'
import { setUidGenerator } from './debug'
import { setupComposableDevtools } from './devtools'
import { PluginOptions } from './types'

export { debug } from './debug'

const plugin: Plugin<PluginOptions> = {
  install: (app, options) => {
    if (!import.meta.env.DEV) return
    if (options?.uidFn) setUidGenerator(options.uidFn)
    setupComposableDevtools(app)
  },
}

export { plugin as DebugPlugin }
export default plugin
