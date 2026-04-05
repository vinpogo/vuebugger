import { describe, expect, it, vi } from 'vitest'

import { onKeydown } from './keyboardListeners'
import { setOptions } from './options'
import {
  debouncedHoveredElement,
  hoveredElement,
  tooltipKey,
} from './state'

const setup = () => {
  vi.useFakeTimers()
  setOptions({ showDelay: 0, hideDelay: 0 })
  const el = document.createElement('div')
  document.body.appendChild(el)
  hoveredElement.value = undefined
  debouncedHoveredElement.value = undefined
  tooltipKey.value = undefined
  return el
}

const teardown = (el: HTMLElement) => {
  vi.useRealTimers()
  el.remove()
  hoveredElement.value = undefined
  debouncedHoveredElement.value = undefined
  tooltipKey.value = undefined
}

describe('onKeydown', () => {
  it('clears hoveredElement when Escape is pressed and a tooltip is active', () => {
    const el = setup()
    hoveredElement.value = el

    onKeydown(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
      }),
    )

    expect(hoveredElement.value).toBeUndefined()

    teardown(el)
  })

  it('does nothing when Escape is pressed but no tooltip is hovered', () => {
    const el = setup()
    hoveredElement.value = undefined

    onKeydown(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
      }),
    )

    expect(hoveredElement.value).toBeUndefined()

    teardown(el)
  })

  it('does not dismiss the tooltip when a different key is pressed', () => {
    const el = setup()
    hoveredElement.value = el

    onKeydown(
      new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
      }),
    )

    expect(hoveredElement.value).toBe(el)

    teardown(el)
  })

  it('clears debouncedHoveredElement synchronously on Escape — no timer needed', () => {
    const el = setup()
    tooltipKey.value = 'test-key'
    hoveredElement.value = el
    debouncedHoveredElement.value = el

    onKeydown(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
      }),
    )

    expect(hoveredElement.value).toBeUndefined()
    expect(debouncedHoveredElement.value).toBeUndefined()

    teardown(el)
  })

  it('clears tooltip when Escape is pressed while mouse is over the tooltip element', () => {
    const el = setup()
    const tooltipEl = document.createElement('div')
    document.body.appendChild(tooltipEl)

    // Simulate: user hovered the trigger, tooltip appeared, then moused over
    // the tooltip itself. composables.ts sets hoveredElement = debouncedHoveredElement
    // when the tooltip is entered, so both point to the original trigger.
    debouncedHoveredElement.value = el
    hoveredElement.value = el

    onKeydown(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
      }),
    )

    // Both must be cleared synchronously so the tooltip's own mouseenter
    // listener cannot re-assert hoveredElement against a stale debouncedHoveredElement.
    expect(hoveredElement.value).toBeUndefined()
    expect(debouncedHoveredElement.value).toBeUndefined()

    tooltipEl.remove()
    teardown(el)
  })
})

describe('window keydown integration', () => {
  it('clears hoveredElement when Escape is dispatched on window', () => {
    const el = setup()
    hoveredElement.value = el

    window.addEventListener('keydown', onKeydown)
    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
      }),
    )
    window.removeEventListener('keydown', onKeydown)

    expect(hoveredElement.value).toBeUndefined()

    teardown(el)
  })

  it('does not clear hoveredElement when a non-Escape key is dispatched on window', () => {
    const el = setup()
    hoveredElement.value = el

    window.addEventListener('keydown', onKeydown)
    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
      }),
    )
    window.removeEventListener('keydown', onKeydown)

    expect(hoveredElement.value).toBe(el)

    teardown(el)
  })
})
