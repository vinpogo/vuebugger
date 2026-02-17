import { describe, expect, it, vi } from 'vitest'
import { setOptions } from './options'
import {
  elementContainsText,
  ensureKey,
  isHtmlElement,
  isTruncated,
} from './utils'

describe('isTruncated', () => {
  it('detects truncated element by width', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    el.style.width = '100px'
    el.style.overflow = 'hidden'
    el.style.whiteSpace = 'nowrap'
    el.textContent = 'x'.repeat(200)

    // jsdom doesn't compute actual layout, so we'll mock it
    Object.defineProperty(el, 'offsetWidth', { value: 100 })
    Object.defineProperty(el, 'scrollWidth', {
      value: 1000,
    })

    const result = isTruncated(el)
    expect(result).toBe(true)

    el.remove()
  })

  it('detects truncated element by height', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    el.style.height = '50px'
    el.style.overflow = 'hidden'
    el.textContent = 'line\n'.repeat(20)

    // jsdom doesn't compute actual layout, so we'll mock it
    Object.defineProperty(el, 'offsetHeight', { value: 50 })
    Object.defineProperty(el, 'scrollHeight', {
      value: 500,
    })

    const result = isTruncated(el)
    expect(result).toBe(true)

    el.remove()
  })

  it('does not detect non-truncated element', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    el.textContent = 'Short text'
    const result = isTruncated(el)
    expect(result).toBe(false)

    el.remove()
  })
})

describe('elementContainsText', () => {
  it('detects text in div', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    el.textContent = 'Hello World'
    expect(elementContainsText(el, 'Hello')).toBe(true)
    expect(elementContainsText(el, 'NotThere')).toBe(false)

    el.remove()
  })

  it('detects text in input element', () => {
    const input = document.createElement('input')
    input.value = 'test value'
    document.body.appendChild(input)

    expect(elementContainsText(input, 'test')).toBe(true)
    expect(elementContainsText(input, 'other')).toBe(false)

    input.remove()
  })

  it('detects text in textarea element', () => {
    const textarea = document.createElement('textarea')
    textarea.value = 'textarea content'
    document.body.appendChild(textarea)

    expect(elementContainsText(textarea, 'content')).toBe(
      true,
    )
    expect(elementContainsText(textarea, 'missing')).toBe(
      false,
    )

    textarea.remove()
  })
})

describe('isHtmlElement', () => {
  it('returns false for non-HTMLElement', () => {
    // @ts-expect-error enforeced error
    expect(isHtmlElement('string')).toBe(false)
    // @ts-expect-error enforeced error
    expect(isHtmlElement(null)).toBe(false)
    // @ts-expect-error enforeced error
    expect(isHtmlElement({})).toBe(false)
  })
})

describe('ensureKey', () => {
  it('calls function when key exists', () => {
    const el = document.createElement('div')
    setOptions({ keyAttribute: 'tooltip-key' })

    el.setAttribute('tooltip-key', 'test-key')
    const fn = vi.fn((key: string) => key)

    ensureKey(el, fn)

    expect(fn).toHaveBeenCalledWith('test-key')
  })

  it('does not call function when key missing', () => {
    const el = document.createElement('div')
    setOptions({ keyAttribute: 'tooltip-key' })

    const fn = vi.fn()
    ensureKey(el, fn)

    expect(fn).not.toHaveBeenCalled()
  })

  it('uses custom key attribute', () => {
    const el = document.createElement('div')
    setOptions({ keyAttribute: 'custom-key' })
    el.setAttribute('custom-key', 'my-key')
    const fn = vi.fn((key: string) => key)

    ensureKey(el, fn)

    expect(fn).toHaveBeenCalledWith('my-key')
  })
})
