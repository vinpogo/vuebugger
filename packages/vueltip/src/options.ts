import { Component } from 'vue'
import type { Options } from './types'

export let options: Options = {
  placementAttribute: 'tooltip-placement',
  keyAttribute: 'tooltip-key',
  showDelay: 0,
  hideDelay: 200,
  handleDialogModals: false,
}

export const setOptions = (
  opts?: Partial<Options> & { component: Component },
) => {
  options = { ...options, ...opts }
}
