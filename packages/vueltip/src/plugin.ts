import { tooltipDirective } from './directive'
import { setOptions } from './options'
import type { Options } from './types'

export const tooltipPlugin = {
  install: (app: any, options?: Partial<Options>) => {
    setOptions(options)
    app.directive('tooltip', tooltipDirective)
  },
}
