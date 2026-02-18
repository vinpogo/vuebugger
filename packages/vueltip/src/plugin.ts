import { App, Component, createApp } from 'vue'
import { setOptions } from './options'
import type { Options } from './types'

export const vueltipPlugin = {
  install: (
    app: App,
    options: Partial<Options & { component: Component }>,
  ) => {
    const { component, ...rest } = options
    setOptions(rest)
    if (!component) return

    const container = document.createElement('div')
    container.id = '__vueltip_root__'
    document.body.appendChild(container)

    const tooltipApp = createApp(component)
    tooltipApp._context = app._context // Share the plugin context
    tooltipApp.mount(container)
  },
}
