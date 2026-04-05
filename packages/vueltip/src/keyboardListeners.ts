import {
  debouncedHoveredElement,
  forceClearHoveredElement,
  hoveredElement,
} from './state'

export const onKeydown = (e: KeyboardEvent) => {
  if (e.key !== 'Escape') return
  const el =
    hoveredElement.value ?? debouncedHoveredElement.value
  if (el) forceClearHoveredElement(el)
}
