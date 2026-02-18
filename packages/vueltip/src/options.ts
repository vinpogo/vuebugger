import type { Options } from './types'

export let options: Options = {
  placementAttribute: 'vueltip-placement',
  keyAttribute: 'vueltip-key',
  showDelay: 0,
  hideDelay: 200,
  handleDialogModals: false,
}

export const setOptions = (opts?: Partial<Options>) => {
  options = { ...options, ...opts }
}
