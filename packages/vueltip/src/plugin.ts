import { App, Component, createApp } from 'vue'
import { tooltipDirective } from './directive'
import { setOptions } from './options'
import type { Options } from './types'

export const tooltipPlugin = {
  install: (
    app: App,
    options: Partial<Options> & { component: Component },
  ) => {
    setOptions(options)
    app.directive('tooltip', tooltipDirective)

    const container = document.createElement('div')
    container.id = '__vueltip_root__'
    document.body.appendChild(container)

    const tooltipApp = createApp(options.component)
    tooltipApp._context = app._context // Share the plugin context
    tooltipApp.mount(container)
  },
}
