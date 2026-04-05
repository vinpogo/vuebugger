import { defineComponent, h, useTemplateRef } from 'vue'

import { useVueltip } from './composables'

export const BasicTooltip = defineComponent(() => {
  const tooltipElement = useTemplateRef<HTMLDivElement>(
    'tooltipElement',
  )
  const arrowElement =
    useTemplateRef<HTMLDivElement>('arrowElement')

  const { tooltipStyles, arrowStyles, show, content } =
    useVueltip({
      tooltipElement,
      arrowElement,
      offset: 8,
      padding: 8,
    })

  return () => {
    if (!show.value) return null

    return h(
      'div',
      {
        ref: 'tooltipElement',
        class: 'vueltip-theme',
        style: tooltipStyles.value,
        role: 'tooltip',
      },
      [
        h('div', {
          ref: 'arrowElement',
          class: 'vueltip-arrow',
          style: arrowStyles.value,
        }),
        h('div', { class: 'vueltip-content' }, [
          content.value?.text,
        ]),
      ],
    )
  }
})
