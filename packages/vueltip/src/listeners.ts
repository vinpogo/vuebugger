import type { Placement } from '@floating-ui/vue'
import { getOption } from './options'
import {
  getContent,
  hoveredElement,
  tooltipKey,
  tooltipPlacement,
} from './state'
import {
  elementContainsText,
  ensureKey,
  isHtmlElement,
  isTruncated,
} from './utils'

const ensureEventTarget =
  (fn: (target: HTMLElement) => void) =>
  (event: MouseEvent | FocusEvent) => {
    const { target } = event
    if (!target || !isHtmlElement(target)) {
      return
    }
    fn(target)
  }

export const onMouseover = ensureEventTarget((target) =>
  ensureKey(target, (key) => {
    const content = getContent(key)
    if (!content) {
      return
    }
    const { text } = content

    if (
      !text ||
      (elementContainsText(target, text) &&
        !isTruncated(target))
    ) {
      return
    }

    const placement = target.getAttribute(
      getOption('placementAttribute'),
    ) as Placement

    tooltipKey.value = key
    hoveredElement.value = target
    tooltipPlacement.value = placement
  }),
)

export const onMouseout = ensureEventTarget((target) => {
  if (target !== hoveredElement.value) {
    return
  }

  hoveredElement.value = undefined
})
