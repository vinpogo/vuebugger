import type { Plugin } from 'vue'
import { setupComposableDevtools } from './devtools'

export { debug } from './debug'

const plugin: Plugin<any[], any[]> = {
  install: (app) => {
    if (!import.meta.env.DEV) return
    setupComposableDevtools(app)
  },
}

export { plugin as DebugPlugin }
export default plugin
