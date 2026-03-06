import type { Placement } from '@floating-ui/vue'
import type { Maybe } from '@vingy/shared/types'
import { ref, watch } from 'vue'
import { getOption } from './options'
import type { Content } from './types'

let timerId: Maybe<ReturnType<typeof setTimeout>>

export const tooltipPlacement = ref<Placement>('top')
export const debouncedTooltipPlacement =
  ref<Placement>('top')

export const hoveredElement = ref<Maybe<HTMLElement>>()
export const debouncedHoveredElement =
  ref<Maybe<HTMLElement>>()
export const forceClearHoveredElement = (
  el: HTMLElement,
) => {
  if (
    el !== debouncedHoveredElement.value &&
    el !== hoveredElement.value
  )
    return
  hoveredElement.value = undefined
  debouncedHoveredElement.value = undefined
  if (timerId) clearTimeout(timerId)
}

const contentMap = ref(new Map<string, Content>())
export const getContent = (key: string) =>
  contentMap.value.get(key)
export const setContent = (key: string, value: Content) =>
  contentMap.value.set(key, value)
export const deleteContent = (key: string) =>
  contentMap.value.delete(key)
export const generateKey = () => crypto.randomUUID()

export const tooltipKey = ref<Maybe<string>>()
export const tooltipContent = ref<Maybe<Content>>()

watch(
  [
    tooltipKey,
    hoveredElement,
    tooltipPlacement,
    () => getContent(tooltipKey.value ?? ''),
  ],
  ([key, el, placement]) => {
    if (!key) {
      return
    }
    if (timerId) {
      clearTimeout(timerId)
    }
    const timeout = el
      ? getOption('showDelay')
      : getOption('hideDelay')
    timerId = setTimeout(() => {
      tooltipContent.value = getContent(key)
      debouncedHoveredElement.value = el
      debouncedTooltipPlacement.value = placement
      timerId = undefined
    }, timeout)
  },
)
