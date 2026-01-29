import { getCurrentInstance, watch } from 'vue'
import { remove, upsert } from './registry'
import type { VuebuggerEntry } from './types'

export function debug<T extends Record<string, any>>(
  groupId: VuebuggerEntry['groupId'],
  state: T,
): T {
  if (!import.meta.env.DEV) return state

  const instance = getCurrentInstance()

  const componentName =
    instance?.type.name ||
    instance?.type.__name ||
    'No component'
  const uid = `${componentName}/${groupId}-${Math.random().toString(36).slice(2, 9)}`

  watch(
    () => state,
    (value, _, onCleanup) => {
      upsert({
        groupId,
        uid,
        componentName,
        componentInstance: instance,
        debugState: value,
      })
      onCleanup(() => {
        remove({
          groupId,
          uid,
          componentName,
          componentInstance: instance,
          debugState: value,
        })
      })
    },
    { deep: true },
  )

  return state
}
