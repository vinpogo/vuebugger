import { App, Component, createVNode, render } from 'vue'

import { setOptions } from './options'
import type { Options } from './types'

const CONTAINER_ID = '__vueltip_root__' as const

const getContainer = () => {
  const existing = document.getElementById(CONTAINER_ID)
  if (existing) return existing

  const container = document.createElement('div')
  container.id = CONTAINER_ID
  document.body.appendChild(container)
  return container
}

export const vueltipPlugin = {
  install: (
    app: App,
    options: Partial<Options & { component: Component }>,
  ) => {
    const { component, ...rest } = options
    setOptions(rest)
    if (!component) return

    const container = getContainer()

    const vnode = createVNode(component)
    vnode.appContext = app._context
    render(vnode, container)
  },
}
