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
  TooltipDirective,
} from './types.ts'
import { ensureKey } from './utils'

const toContent = (value: Binding): Content =>
  typeof value === 'string'
    ? { text: value }
    : typeof value.content === 'string'
      ? { text: value.content }
      : value.content

const extractPlacement = (value: Binding) =>
  typeof value === 'string' ? 'top' : value.placement

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
      extractPlacement(binding.value),
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
