import { App, Component, createApp } from 'vue'
import { setOptions } from './options'
import type { Options } from './types'

/**
 * This plugin allows you to setup options for the directive, aswell as adding a component which will be added to the DOM for you.
 *
 * If you do not pass a component, i suggest setting the options via `setOptions`.
 */
export const vueltipPlugin = {
  install: (
    app: App,
    options: Partial<Options & { component: Component }>,
  ) => {
    const { component, ...rest } = options
    setOptions(rest)

    if (!component) return
    createVueltipApp(component, app._context)
  },
}

function createVueltipApp(
  component: Component,
  context: App['_context'],
) {
  const container = document.createElement('div')
  container.id = '__vueltip_root__'
  document.body.appendChild(container)

  const tooltipApp = createApp(component)
  tooltipApp._context = context // Share the plugin context
  tooltipApp.mount(container)
}
