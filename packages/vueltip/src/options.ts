import type { Options } from './types'

let options: Options = {
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

export const getOption = <T extends keyof Options>(
  key: T,
): Options[T] => options[key]
