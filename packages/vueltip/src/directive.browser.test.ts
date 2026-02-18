import { describe, expect, it, vi } from 'vitest'
import { vueltipDirective } from './directive'
import { setOptions } from './options'
import { getContent } from './state'

const setupDirective = () => {
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
        content: 'Tooltip text',
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
        content: 'Text',
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
        content: 'Text',
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
})

describe('updated hook', () => {
  it('updates content with new binding', () => {
    const el = setupDirective()
    const binding1 = { value: 'Original text' }
    vueltipDirective.created?.(el, binding1 as any)
    const key = el.getAttribute('tooltip-key')!

    const binding2 = { value: 'Updated text' }
    vueltipDirective.updated?.(el, binding2 as any)

    expect(getContent(key)).toEqual({
      text: 'Updated text',
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
      value: { content: 'Text', placement: 'top' as const },
    }
    vueltipDirective.created?.(el, binding1 as any)

    const binding2 = {
      value: {
        content: 'Text',
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
})
