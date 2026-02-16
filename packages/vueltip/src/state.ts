import type { Placement } from '@floating-ui/vue'
import type { Maybe } from '@vingy/shared/types'
import { ref, watch } from 'vue'
import { options } from './options'
import type { Content } from './types'

export const tooltipPlacement = ref<Placement>('top')
export const debouncedTooltipPlacement =
  ref<Placement>('top')

export const hoveredElement = ref<Maybe<HTMLElement>>()
export const debouncedHoveredElement =
  ref<Maybe<HTMLElement>>()

const contentMap = new Map<string, Content>()
export const getContent = (key: string) =>
  contentMap.get(key)
export const setContent = (key: string, value: Content) =>
  contentMap.set(key, value)
export const deleteContent = (key: string) =>
  contentMap.delete(key)
export const generateKey = () => crypto.randomUUID()

export const tooltipKey = ref<Maybe<string>>()
export const tooltipContent = ref<Maybe<Content>>()

let timerId: Maybe<ReturnType<typeof setTimeout>>
watch(
  [tooltipKey, hoveredElement, tooltipPlacement],
  ([key, el, placement]) => {
    if (!key) {
      return
    }
    if (timerId) {
      clearTimeout(timerId)
    }
    const timeout = el
      ? options.showDelay
      : options.hideDelay
    timerId = setTimeout(() => {
      tooltipContent.value = getContent(key)
      debouncedHoveredElement.value = el
      debouncedTooltipPlacement.value = placement
      timerId = undefined
    }, timeout)
  },
)
