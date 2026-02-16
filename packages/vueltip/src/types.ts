import type {
  Placement,
  UseFloatingOptions,
} from '@floating-ui/vue'
import type { ShallowRef } from 'vue'

export interface Content {
  text: string
}
export type Binding =
  | string
  | {
      content: string | Content
      placement: Placement
    }
export type Options = {
  /** @default 'tooltip-placement' */
  placementAttribute: string
  /** @default 'tooltip-key' */
  keyAttribute: string
  /** @default 0 */
  showDelay: number
  /** @default 200 */
  hideDelay: number
  /** @default false */
  handleDialogModals: boolean
}
export type UseTooltipOptions = {
  tooltipElement: Readonly<ShallowRef<HTMLElement | null>>
  arrowElement?: Readonly<ShallowRef<HTMLElement | null>>
  offset?: number
  padding?: number
  arrowSize?: number
  floatingOptions?: UseFloatingOptions<HTMLElement>
}
