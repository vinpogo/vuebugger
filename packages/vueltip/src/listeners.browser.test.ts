import { describe, expect, it } from 'vitest'
import { onMouseout, onMouseover } from './listeners'
import { setOptions } from './options'
import {
  hoveredElement,
  setContent,
  tooltipKey,
  tooltipPlacement,
} from './state'

const setupListeners = () => {
  const el = document.createElement('div')
  el.textContent = 'Truncated text that needs tooltip'
  document.body.appendChild(el)
  setOptions({
    keyAttribute: 'tooltip-key',
    placementAttribute: 'tooltip-placement',
  })
  hoveredElement.value = undefined
  tooltipKey.value = undefined
  return el
}

const teardownListeners = (el: HTMLElement) => {
  el.remove()
  hoveredElement.value = undefined
  tooltipKey.value = undefined
}

describe('onMouseover', () => {
  it('sets tooltip state when content exists and text not contained', () => {
    const el = setupListeners()
    const key = 'test-key'
    el.setAttribute('tooltip-key', key)
    el.setAttribute('tooltip-placement', 'bottom')
    setContent(key, { text: 'Tooltip text' })

    const event = new MouseEvent('mouseenter')
    Object.defineProperty(event, 'target', { value: el })

    onMouseover(event as any)

    expect(tooltipKey.value).toBe(key)
    expect(hoveredElement.value).toBe(el)
    expect(tooltipPlacement.value).toBe('bottom')

    teardownListeners(el)
  })

  it('does not show tooltip if content not found', () => {
    const el = setupListeners()
    const key = 'missing-key'
    el.setAttribute('tooltip-key', key)

    const event = new MouseEvent('mouseenter')
    Object.defineProperty(event, 'target', { value: el })

    onMouseover(event as any)

    expect(tooltipKey.value).toBeUndefined()

    teardownListeners(el)
  })

  it('does not show tooltip if element already contains text', () => {
    const el = setupListeners()
    const key = 'test-key'
    el.setAttribute('tooltip-key', key)
    el.textContent = 'Tooltip text'
    setContent(key, { text: 'Tooltip text' })

    const event = new MouseEvent('mouseenter')
    Object.defineProperty(event, 'target', { value: el })

    onMouseover(event as any)

    expect(tooltipKey.value).toBeUndefined()

    teardownListeners(el)
  })

  it('handles invalid targets gracefully', () => {
    const el = setupListeners()
    const event = new MouseEvent('mouseenter')
    Object.defineProperty(event, 'target', {
      value: 'not-an-element',
    })

    expect(() => onMouseover(event as any)).not.toThrow()

    teardownListeners(el)
  })
})

describe('onMouseout', () => {
  it('clears hovered element when target matches', () => {
    const el = setupListeners()
    hoveredElement.value = el

    const event = new MouseEvent('mouseleave')
    Object.defineProperty(event, 'target', { value: el })

    onMouseout(event as any)

    expect(hoveredElement.value).toBeUndefined()

    teardownListeners(el)
  })

  it('does not clear hovered element when target does not match', () => {
    const el = setupListeners()
    const otherEl = document.createElement('div')
    document.body.appendChild(otherEl)

    hoveredElement.value = el

    const event = new MouseEvent('mouseleave')
    Object.defineProperty(event, 'target', {
      value: otherEl,
    })

    onMouseout(event as any)

    expect(hoveredElement.value).toBe(el)

    otherEl.remove()
    teardownListeners(el)
  })

  it('handles invalid targets gracefully', () => {
    const el = setupListeners()
    hoveredElement.value = el

    const event = new MouseEvent('mouseleave')
    Object.defineProperty(event, 'target', { value: null })

    expect(() => onMouseout(event as any)).not.toThrow()
    expect(hoveredElement.value).toBe(el)

    teardownListeners(el)
  })
})
