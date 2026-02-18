import type { Options } from './types'

export let options: Options = {
  placementAttribute: 'vueltip-placement',
  keyAttribute: 'vueltip-key',
  truncateAttribute: 'vueltip-truncate',
  showDelay: 0,
  hideDelay: 200,
  handleDialogModals: false,
  defaultTruncateDetection: 'both',
  defaultPlacement: 'top',
}

export const setOptions = (opts?: Partial<Options>) => {
  options = { ...options, ...opts }
}
