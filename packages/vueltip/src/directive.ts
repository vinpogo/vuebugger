import { Placement } from '@floating-ui/vue'
import { DirectiveBinding } from 'vue'
import { onMouseout, onMouseover } from './listeners'
import { getOption } from './options'
import {
  deleteContent,
  generateKey,
  setContent,
} from './state'
import type {
  Content,
  Modifier,
  TooltipDirective,
  Value,
} from './types.ts'
import { ensureKey } from './utils'

const toContent = (value: Value): Content => {
  if (value == null) return { text: value }
  if (typeof value === 'string') return { text: value }
  const { placement: _, ...rest } = value
  return rest
}
const extractPlacement = (
  binding: DirectiveBinding<Value, Modifier, Placement>,
) => {
  const { value, arg } = binding

  if (
    value &&
    typeof value !== 'string' &&
    'placement' in value &&
    value.placement != null
  ) {
    return value.placement
  }
  if (!arg) return getOption('defaultPlacement')
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
  return getOption('defaultTruncateDetection')
}

export const vueltipDirective = {
  updated: (el, binding) => {
    ensureKey(el, (key) => {
      el.setAttribute(
        getOption('placementAttribute'),
        extractPlacement(binding),
      )
      el.setAttribute(
        getOption('truncateAttribute'),
        truncationDirection(binding.modifiers ?? {}),
      )

      setContent(key, toContent(binding.value))
    })
  },
  created: (el, binding) => {
    const key = generateKey()
    setContent(key, toContent(binding.value))
    el.setAttribute(getOption('keyAttribute'), key)

    el.setAttribute(
      getOption('placementAttribute'),
      extractPlacement(binding),
    )
    el.setAttribute(
      getOption('truncateAttribute'),
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
