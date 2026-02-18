import { Placement } from '@floating-ui/vue'
import { DirectiveBinding } from 'vue'
import { onMouseout, onMouseover } from './listeners'
import { options } from './options'
import {
  deleteContent,
  generateKey,
  setContent,
} from './state'
import type {
  Binding,
  Content,
  Modifier,
  TooltipDirective,
} from './types.ts'
import { ensureKey } from './utils'

const toContent = (value: Binding): Content =>
  typeof value === 'string'
    ? { text: value }
    : typeof value.content === 'string'
      ? { text: value.content }
      : value.content

const extractPlacement = (
  binding: DirectiveBinding<Binding, Modifier, Placement>,
) => {
  const { value, arg } = binding

  if (typeof value !== 'string' && 'placement' in value) {
    return value.placement
  }
  if (!arg) return options.defaultPlacement
  return arg
}

const truncationDirection = (
  modifiers: Partial<Record<Modifier, boolean | undefined>>,
) => {
  if (modifiers.none) return 'none'
  if (modifiers.both) return 'both'
  if (modifiers.x && modifiers.y) return 'both'
  if (modifiers.x) return 'x'
  if (modifiers.y) return 'y'
  return options.defaultTruncateDetection
}

export const vueltipDirective = {
  updated: (el, binding) => {
    ensureKey(el, (key) =>
      setContent(key, toContent(binding.value)),
    )
  },
  created: (el, binding) => {
    const key = generateKey()
    setContent(key, toContent(binding.value))
    el.setAttribute(options.keyAttribute, key)

    el.setAttribute(
      options.placementAttribute,
      extractPlacement(binding),
    )
    el.setAttribute(
      options.truncateAttribute,
      truncationDirection(binding.modifiers ?? {}),
    )

    el.addEventListener('mouseenter', onMouseover)
    el.addEventListener('focus', onMouseover)
    el.addEventListener('mouseleave', onMouseout)
    el.addEventListener('blur', onMouseout)
  },
  beforeUnmount: (el) => {
    ensureKey(el, (key) => deleteContent(key))

    el.removeEventListener('mouseenter', onMouseover)
    el.removeEventListener('focus', onMouseover)
    el.removeEventListener('mouseleave', onMouseout)
    el.removeEventListener('blur', onMouseout)
  },
} satisfies TooltipDirective
