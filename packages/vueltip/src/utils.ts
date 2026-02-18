import { options } from './options'
import { Modifier } from './types'

export function isTruncated(el: HTMLElement) {
  const direction = getTruncationDirection(el)

  const x = el.offsetWidth < el.scrollWidth - 1
  const y = el.offsetHeight < el.scrollHeight - 1

  switch (direction) {
    case 'x':
      return x
    case 'y':
      return y
    case 'both':
      return x || y
    case 'none':
      return true
  }
}

function getTruncationDirection(el: HTMLElement) {
  return (
    (el.getAttribute(
      options.truncateAttribute,
    ) as Modifier) ?? options.defaultTruncateDetection
  )
}

export function elementContainsText(
  el: HTMLElement,
  text: string,
) {
  if (isInputElement(el) || isTextAreaElement(el)) {
    return getInputValue(el).includes(text)
  }
  return !!(el.innerText || el.textContent)?.includes(text)
}

export function isHtmlElement(
  el: EventTarget,
): el is HTMLElement {
  return el instanceof HTMLElement
}

function isInputElement(
  el: HTMLElement,
): el is HTMLInputElement {
  return el instanceof HTMLInputElement
}

function isTextAreaElement(
  el: HTMLElement,
): el is HTMLInputElement {
  return el instanceof HTMLTextAreaElement
}

function getInputValue(
  el: HTMLInputElement | HTMLTextAreaElement,
) {
  return el.value
}

export const ensureKey = <T>(
  el: HTMLElement,
  fn: (key: string) => T,
) => {
  const key = el.getAttribute(options.keyAttribute)
  if (!key) return
  return fn(key)
}
