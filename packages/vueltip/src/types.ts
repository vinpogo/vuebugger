import type {
  Placement,
  UseFloatingOptions,
} from '@floating-ui/vue'
import { Maybe } from '@vingy/shared/types'
import type { Directive, ShallowRef } from 'vue'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CustomVueltipData {}

export interface Content {
  text: Maybe<string>
  custom?: CustomVueltipData
}
export type Value =
  | Maybe<string>
  | (Content & {
      placement?: Placement
    })
export type Modifier = 'x' | 'y' | 'none' | 'both'

export type TooltipDirective = Directive<
  HTMLElement,
  Value,
  Modifier,
  Placement
>

export type Options = {
  /** @default 'vueltip-placement' */
  placementAttribute: string
  /** @default 'vueltip-key' */
  keyAttribute: string
  /** @default 'vueltip-truncate' */
  truncateAttribute: string
  /** @default 0 */
  showDelay: number
  /** @default 200 */
  hideDelay: number
  /** @default false */
  handleDialogModals: boolean
  /** @default 'both' */
  defaultTruncateDetection: Modifier
  /** @default 'top' */
  defaultPlacement: Placement
}
export type UseTooltipOptions = {
  tooltipElement: Readonly<ShallowRef<HTMLElement | null>>
  arrowElement?: Readonly<ShallowRef<HTMLElement | null>>
  offset?: number
  padding?: number
  arrowSize?: number
  floatingOptions?: UseFloatingOptions<HTMLElement>
}

declare module 'vue' {
  export interface GlobalDirectives {
    vTooltip: TooltipDirective
  }
}
