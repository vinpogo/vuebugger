import { describe, expect, it, vi } from 'vitest'

import { vueltipDirective } from './directive'
import { setOptions } from './options'
import {
  debouncedHoveredElement,
  getContent,
  hoveredElement,
} from './state'

const setupDirective = () => {
  vi.useFakeTimers()
  const el = document.createElement('div')
  document.body.appendChild(el)
  setOptions({
    keyAttribute: 'tooltip-key',
    placementAttribute: 'tooltip-placement',
    truncateAttribute: 'tooltip-truncate',
  })
  return el
}

const teardownDirective = (el: HTMLElement) => {
  vi.useRealTimers()
  el.remove()
}

describe('created hook', () => {
  it('sets content with string binding', () => {
    const el = setupDirective()
    const binding = { value: 'Tooltip text' }

    vueltipDirective.created?.(el, binding as any)

    const key = el.getAttribute('tooltip-key')
    expect(key).toBeTruthy()
    expect(getContent(key!)).toEqual({
      text: 'Tooltip text',
    })

    teardownDirective(el)
  })

  it('sets content with object binding', () => {
    const el = setupDirective()
    const binding = {
      value: {
        text: 'Tooltip text',
        placement: 'bottom' as const,
      },
    }

    vueltipDirective.created?.(el, binding as any)

    const key = el.getAttribute('tooltip-key')
    expect(getContent(key!)).toEqual({
      text: 'Tooltip text',
    })

    teardownDirective(el)
  })

  it('sets placement attribute with object binding', () => {
    const el = setupDirective()
    const binding = {
      value: {
        text: 'Text',
        placement: 'bottom' as const,
      },
    }

    vueltipDirective.created?.(el, binding as any)

    expect(el.getAttribute('tooltip-placement')).toBe(
      'bottom',
    )

    teardownDirective(el)
  })

  it('sets placement attribute with arg parameter', () => {
    const el = setupDirective()
    const binding = { value: 'Text', arg: 'left' }

    vueltipDirective.created?.(el, binding as any)

    expect(el.getAttribute('tooltip-placement')).toBe(
      'left',
    )

    teardownDirective(el)
  })
  it('prioritizes placement in value over arg', () => {
    const el = setupDirective()
    const binding = {
      value: {
        text: 'Text',
        placement: 'bottom' as const,
      },
      arg: 'left',
    }

    vueltipDirective.created?.(el, binding as any)

    expect(el.getAttribute('tooltip-placement')).toBe(
      'bottom',
    )

    teardownDirective(el)
  })
  it('sets truncate attribute with none modifier', () => {
    const el = setupDirective()
    const binding = {
      value: 'Text',
      modifiers: { none: true },
    }

    vueltipDirective.created?.(el, binding as any)

    expect(el.getAttribute('tooltip-truncate')).toBe('none')

    teardownDirective(el)
  })

  it('sets truncate attribute with both modifier', () => {
    const el = setupDirective()
    const binding = {
      value: 'Text',
      modifiers: { both: true },
    }

    vueltipDirective.created?.(el, binding as any)

    expect(el.getAttribute('tooltip-truncate')).toBe('both')

    teardownDirective(el)
  })

  it('sets truncate attribute with x modifier', () => {
    const el = setupDirective()
    const binding = {
      value: 'Text',
      modifiers: { x: true },
    }

    vueltipDirective.created?.(el, binding as any)

    expect(el.getAttribute('tooltip-truncate')).toBe('x')

    teardownDirective(el)
  })

  it('sets truncate attribute with y modifier', () => {
    const el = setupDirective()
    const binding = {
      value: 'Text',
      modifiers: { y: true },
    }

    vueltipDirective.created?.(el, binding as any)

    expect(el.getAttribute('tooltip-truncate')).toBe('y')

    teardownDirective(el)
  })

  it('sets truncate attribute with both x and y modifiers', () => {
    const el = setupDirective()
    const binding = {
      value: 'Text',
      modifiers: { x: true, y: true },
    }

    vueltipDirective.created?.(el, binding as any)

    expect(el.getAttribute('tooltip-truncate')).toBe('both')

    teardownDirective(el)
  })

  it('attaches event listeners', () => {
    const el = setupDirective()
    const addEventListenerSpy = vi.spyOn(
      el,
      'addEventListener',
    )
    const binding = { value: 'Text' }

    vueltipDirective.created?.(el, binding as any)

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'mouseenter',
      expect.any(Function),
    )
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'focus',
      expect.any(Function),
    )
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'mouseleave',
      expect.any(Function),
    )
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'blur',
      expect.any(Function),
    )

    addEventListenerSpy.mockRestore()
    teardownDirective(el)
  })

  it('set custom', () => {
    const el = setupDirective()
    const binding = {
      value: { text: '', custom: { vin: 'foo' } },
    }

    vueltipDirective.created?.(el, binding as any)

    const key = el.getAttribute('tooltip-key')
    expect(key).toBeTruthy()
    expect(getContent(key!)).toEqual({
      text: '',
      custom: { vin: 'foo' },
    })

    teardownDirective(el)
  })
})

describe('updated hook', () => {
  it('updates content with new binding', () => {
    const el = setupDirective()
    const binding1 = { value: 'Original text' }
    vueltipDirective.created?.(el, binding1 as any)
    const key = el.getAttribute('tooltip-key')!

    const binding2 = {
      value: {
        text: 'Updated text',
        placement: 'right',
        custom: { vin: 'foo' },
      },
    }
    vueltipDirective.updated?.(el, binding2 as any)

    expect(getContent(key)).toEqual({
      text: 'Updated text',
      custom: { vin: 'foo' },
    })

    teardownDirective(el)
  })

  it('updates placement attribute via arg', () => {
    const el = setupDirective()
    const binding1 = { value: 'Text', arg: 'top' }
    vueltipDirective.created?.(el, binding1 as any)

    const binding2 = { value: 'Text', arg: 'right' }
    vueltipDirective.updated?.(el, binding2 as any)

    expect(el.getAttribute('tooltip-placement')).toBe(
      'right',
    )

    teardownDirective(el)
  })

  it('updates placement attribute via object binding', () => {
    const el = setupDirective()
    const binding1 = {
      value: { text: 'Text', placement: 'top' as const },
    }
    vueltipDirective.created?.(el, binding1 as any)

    const binding2 = {
      value: {
        text: 'Text',
        placement: 'bottom' as const,
      },
    }
    vueltipDirective.updated?.(el, binding2 as any)

    expect(el.getAttribute('tooltip-placement')).toBe(
      'bottom',
    )

    teardownDirective(el)
  })

  it('updates truncate attribute with new modifiers', () => {
    const el = setupDirective()
    const binding1 = {
      value: 'Text',
      modifiers: { x: true },
    }
    vueltipDirective.created?.(el, binding1 as any)

    const binding2 = {
      value: 'Text',
      modifiers: { y: true },
    }
    vueltipDirective.updated?.(el, binding2 as any)

    expect(el.getAttribute('tooltip-truncate')).toBe('y')

    teardownDirective(el)
  })
})

describe('beforeUnmount hook', () => {
  it('deletes content', () => {
    const el = setupDirective()
    const binding = { value: 'Text' }
    vueltipDirective.created?.(el, binding as any)
    const key = el.getAttribute('tooltip-key')!

    vueltipDirective.beforeUnmount?.(el)

    expect(getContent(key)).toBeUndefined()

    teardownDirective(el)
  })

  it('removes event listeners', () => {
    const el = setupDirective()
    const binding = { value: 'Text' }
    vueltipDirective.created?.(el, binding as any)

    const removeEventListenerSpy = vi.spyOn(
      el,
      'removeEventListener',
    )

    vueltipDirective.beforeUnmount?.(el)

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'mouseenter',
      expect.any(Function),
    )
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'mouseleave',
      expect.any(Function),
    )
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'blur',
      expect.any(Function),
    )

    removeEventListenerSpy.mockRestore()
    teardownDirective(el)
  })

  it('unsets the hoveredElement and debouncedHoveredElement -> tooltip disappears immediately', async () => {
    const el = setupDirective()
    const binding = { value: 'Text' }
    vueltipDirective.created?.(el, binding as any)

    // hover element
    el.dispatchEvent(new MouseEvent('mouseenter'))
    await vi.runAllTimersAsync()

    expect(debouncedHoveredElement.value).toBe(el)

    vueltipDirective.beforeUnmount?.(el)

    expect(hoveredElement.value).toBeUndefined()
    expect(debouncedHoveredElement.value).toBeUndefined()

    teardownDirective(el)
  })

  it('does not show tooltip if unmounted while showDelay debounce is pending', async () => {
    const el = setupDirective()
    const binding = { value: 'Text' }
    vueltipDirective.created?.(el, binding as any)

    el.dispatchEvent(new MouseEvent('mouseenter'))

    expect(hoveredElement.value).toBe(el)
    expect(debouncedHoveredElement.value).toBeUndefined()

    vueltipDirective.beforeUnmount?.(el)

    expect(hoveredElement.value).toBeUndefined()
    expect(debouncedHoveredElement.value).toBeUndefined()

    await vi.runAllTimersAsync()

    expect(hoveredElement.value).toBeUndefined()
    expect(debouncedHoveredElement.value).toBeUndefined()

    teardownDirective(el)
  })

  it('clears tooltip when element B unmounts during showDelay after hovering during hideDelay of element A', async () => {
    const el1 = setupDirective()
    const el2 = setupDirective()

    const binding = { value: 'Text' }

    vueltipDirective.created?.(el1, binding as any)
    vueltipDirective.created?.(el2, binding as any)

    el1.dispatchEvent(new MouseEvent('mouseenter'))
    await vi.runAllTimersAsync()

    expect(debouncedHoveredElement.value).toBe(el1)

    el1.dispatchEvent(new MouseEvent('mouseleave'))

    expect(hoveredElement.value).toBeUndefined()
    expect(debouncedHoveredElement.value).toBe(el1)

    vi.advanceTimersByTime(50)
    el2.dispatchEvent(new MouseEvent('mouseenter'))

    expect(hoveredElement.value).toBe(el2)
    expect(debouncedHoveredElement.value).toBe(el1)

    vueltipDirective.beforeUnmount?.(el2)

    expect(hoveredElement.value).toBeUndefined()

    await vi.runAllTimersAsync()

    expect(debouncedHoveredElement.value).toBeUndefined()

    teardownDirective(el1)
    el2.remove()
  })
})
