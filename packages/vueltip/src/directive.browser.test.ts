import { describe, expect, it, vi } from 'vitest'
import { tooltipDirective } from './directive'
import { setOptions } from './options'
import { getContent } from './state'

const setupDirective = () => {
  const el = document.createElement('div')
  document.body.appendChild(el)
  setOptions({
    keyAttribute: 'tooltip-key',
    placementAttribute: 'tooltip-placement',
  })
  return el
}

const teardownDirective = (el: HTMLElement) => {
  el.remove()
}

describe('created hook', () => {
  it('sets content with string binding', () => {
    const el = setupDirective()
    const binding = { value: 'Tooltip text' }

    tooltipDirective.created?.(el, binding as any)

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
        content: 'Tooltip text',
        placement: 'bottom' as const,
      },
    }

    tooltipDirective.created?.(el, binding as any)

    const key = el.getAttribute('tooltip-key')
    expect(getContent(key!)).toEqual({
      text: 'Tooltip text',
    })

    teardownDirective(el)
  })

  it('sets placement attribute with string binding', () => {
    const el = setupDirective()
    const binding = { value: 'Default text' }

    tooltipDirective.created?.(el, binding as any)

    expect(el.getAttribute('tooltip-placement')).toBe('top')

    teardownDirective(el)
  })

  it('sets placement attribute with object binding', () => {
    const el = setupDirective()
    const binding = {
      value: {
        content: 'Text',
        placement: 'bottom' as const,
      },
    }

    tooltipDirective.created?.(el, binding as any)

    expect(el.getAttribute('tooltip-placement')).toBe(
      'bottom',
    )

    teardownDirective(el)
  })

  it('attaches event listeners', () => {
    const el = setupDirective()
    const addEventListenerSpy = vi.spyOn(
      el,
      'addEventListener',
    )
    const binding = { value: 'Text' }

    tooltipDirective.created?.(el, binding as any)

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
})

describe('updated hook', () => {
  it('updates content with new binding', () => {
    const el = setupDirective()
    const binding1 = { value: 'Original text' }
    tooltipDirective.created?.(el, binding1 as any)
    const key = el.getAttribute('tooltip-key')!

    const binding2 = { value: 'Updated text' }
    tooltipDirective.updated?.(el, binding2 as any)

    expect(getContent(key)).toEqual({
      text: 'Updated text',
    })

    teardownDirective(el)
  })
})

describe('beforeUnmount hook', () => {
  it('deletes content', () => {
    const el = setupDirective()
    const binding = { value: 'Text' }
    tooltipDirective.created?.(el, binding as any)
    const key = el.getAttribute('tooltip-key')!

    tooltipDirective.beforeUnmount?.(el)

    expect(getContent(key)).toBeUndefined()

    teardownDirective(el)
  })

  it('removes event listeners', () => {
    const el = setupDirective()
    const binding = { value: 'Text' }
    tooltipDirective.created?.(el, binding as any)

    const removeEventListenerSpy = vi.spyOn(
      el,
      'removeEventListener',
    )

    tooltipDirective.beforeUnmount?.(el)

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
})
