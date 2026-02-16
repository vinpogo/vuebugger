import { options } from './options'

export function isTruncated(el: HTMLElement) {
  return (
    // offset is rounded down, scroll is rounded up
    el.offsetWidth < el.scrollWidth - 1 ||
    el.offsetHeight < el.scrollHeight - 1
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
