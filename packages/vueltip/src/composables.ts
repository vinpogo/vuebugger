import {
  arrow,
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
} from '@floating-ui/vue'
import type { Maybe } from '@vingy/shared/types'
import {
  computed,
  onMounted,
  type StyleValue,
  watch,
} from 'vue'
import { options } from './options'
import {
  debouncedHoveredElement,
  debouncedTooltipPlacement,
  hoveredElement,
  tooltipContent,
} from './state'
import type { UseTooltipOptions } from './types.ts'

const sideMap: Record<string, string> = {
  top: 'bottom',
  right: 'left',
  bottom: 'top',
  left: 'right',
}

export const useVueltip = ({
  tooltipElement,
  arrowElement,
  offset: _offset,
  padding,
  arrowSize,
  floatingOptions,
}: UseTooltipOptions) => {
  let initialParent: Maybe<HTMLElement>
  onMounted(() => {
    initialParent = tooltipElement.value?.parentElement
    tooltipElement.value?.addEventListener(
      'mouseenter',
      () =>
        (hoveredElement.value =
          debouncedHoveredElement.value),
    )
    tooltipElement.value?.addEventListener(
      'mouseleave',
      () => (hoveredElement.value = undefined),
    )
  })
  const middleware = [
    offset(_offset),
    flip(),
    shift({ padding }),
  ]
  if (arrowElement) {
    middleware.push(
      arrow({ element: arrowElement, padding: 6 }),
    )
  }
  const { floatingStyles, middlewareData, placement } =
    useFloating(debouncedHoveredElement, tooltipElement, {
      placement: debouncedTooltipPlacement,
      whileElementsMounted: autoUpdate,
      middleware,
      ...floatingOptions,
    })

  const staticSide = computed(
    () => sideMap[placement.value.split('-')[0]]!,
  )
  const size = arrowSize ?? 10
  const arrowStyles = computed<StyleValue>(() => {
    return {
      width: `${size}px`,
      height: `${size}px`,
      rotate: '45deg',
      position: 'absolute',
      left:
        middlewareData.value.arrow?.x != null
          ? `${middlewareData.value.arrow.x}px`
          : '',
      top:
        middlewareData.value.arrow?.y != null
          ? `${middlewareData.value.arrow.y}px`
          : '',
      [staticSide.value]: `-${size / 2}px`,
    }
  })

  const show = computed(
    () => !!debouncedHoveredElement.value,
  )

  if (options.handleDialogModals) {
    watch(show, (value) => {
      if (
        !value ||
        !tooltipElement.value ||
        !debouncedHoveredElement.value ||
        !initialParent
      )
        return
      const dialogEl =
        debouncedHoveredElement.value.closest('dialog')
      if (!dialogEl) {
        if (
          tooltipElement.value.parentElement !==
          initialParent
        ) {
          initialParent.appendChild(tooltipElement.value)
        }
        return
      }
      const isModal =
        globalThis.getComputedStyle(dialogEl, '::backdrop')
          .display !== 'none'
      if (isModal) {
        dialogEl.appendChild(tooltipElement.value)
      }
    })
  }

  return {
    tooltipStyles: floatingStyles,
    arrowStyles,
    show,
    content: tooltipContent,
  }
}
