import { describe, expect, it } from 'vitest'
import {
  createApp,
  defineComponent,
  h,
  nextTick,
  ref,
} from 'vue'
import { useVueltip } from './composables'
import {
  debouncedHoveredElement,
  hoveredElement,
} from './state'

const TooltipVIf = defineComponent({
  setup() {
    const tooltipEl = ref<HTMLElement | null>(null)
    const { show, tooltipStyles, content } = useVueltip({
      tooltipElement: tooltipEl,
    })
    return () =>
      show.value
        ? h(
            'div',
            { ref: tooltipEl, style: tooltipStyles.value },
            content.value?.text ?? undefined,
          )
        : null
  },
})

const TooltipVShow = defineComponent({
  setup() {
    const tooltipEl = ref<HTMLElement | null>(null)
    const { show, tooltipStyles, content } = useVueltip({
      tooltipElement: tooltipEl,
    })
    return () =>
      h(
        'div',
        {
          ref: tooltipEl,
          style: {
            ...tooltipStyles.value,
            display: show.value ? '' : 'none',
          },
        },
        content.value?.text ?? undefined,
      )
  },
})

const mountTooltip = (
  component: ReturnType<typeof defineComponent>,
) => {
  const app = createApp(component)
  const container = document.createElement('div')
  document.body.appendChild(container)
  app.mount(container)
  return {
    container,
    unmount: () => {
      app.unmount()
      container.remove()
    },
  }
}

describe('useVueltip listener lifecycle', () => {
  it('v-show: attaches mouseenter/mouseleave listeners when show becomes true', async () => {
    debouncedHoveredElement.value = undefined
    hoveredElement.value = undefined

    const { container, unmount } =
      mountTooltip(TooltipVShow)
    await nextTick()

    const refEl = document.createElement('div')
    debouncedHoveredElement.value = refEl
    await nextTick()

    const el = container.firstElementChild as HTMLElement
    el.dispatchEvent(new MouseEvent('mouseenter'))
    expect(hoveredElement.value).toBe(refEl)

    el.dispatchEvent(new MouseEvent('mouseleave'))
    expect(hoveredElement.value).toBeUndefined()

    debouncedHoveredElement.value = undefined
    unmount()
  })

  it('v-if: attaches listeners when element enters the DOM', async () => {
    debouncedHoveredElement.value = undefined
    hoveredElement.value = undefined

    const { container, unmount } = mountTooltip(TooltipVIf)
    await nextTick()
    expect(container.firstElementChild).toBeNull()

    const refEl = document.createElement('div')
    debouncedHoveredElement.value = refEl
    await nextTick()

    const el = container.firstElementChild as HTMLElement
    expect(el).not.toBeNull()

    el.dispatchEvent(new MouseEvent('mouseenter'))
    expect(hoveredElement.value).toBe(refEl)

    el.dispatchEvent(new MouseEvent('mouseleave'))
    expect(hoveredElement.value).toBeUndefined()

    debouncedHoveredElement.value = undefined
    unmount()
  })

  it('v-if: removes listeners when element leaves the DOM (show=false)', async () => {
    debouncedHoveredElement.value = undefined
    hoveredElement.value = undefined

    const { container, unmount } = mountTooltip(TooltipVIf)

    const refEl = document.createElement('div')
    debouncedHoveredElement.value = refEl
    await nextTick()

    const el = container.firstElementChild as HTMLElement
    const removedTypes: string[] = []
    el.removeEventListener = (type: string) => {
      removedTypes.push(type)
    }

    debouncedHoveredElement.value = undefined
    await nextTick()

    expect(removedTypes).toContain('mouseenter')
    expect(removedTypes).toContain('mouseleave')

    unmount()
  })

  it('v-show: removes listeners on component unmount', async () => {
    debouncedHoveredElement.value = undefined
    hoveredElement.value = undefined

    const { container, unmount } =
      mountTooltip(TooltipVShow)
    await nextTick()

    const refEl = document.createElement('div')
    debouncedHoveredElement.value = refEl
    await nextTick()

    const el = container.firstElementChild as HTMLElement
    const removedTypes: string[] = []
    el.removeEventListener = (type: string) => {
      removedTypes.push(type)
    }

    unmount()

    expect(removedTypes).toContain('mouseenter')
    expect(removedTypes).toContain('mouseleave')

    debouncedHoveredElement.value = undefined
  })
})
