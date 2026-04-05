import {
  effectScope,
  getCurrentInstance,
  getCurrentScope,
  onScopeDispose,
  toValue,
  watch,
} from 'vue'
import type { MaybeRefOrGetter } from 'vue'

import { remove, upsert } from './registry'
import type { VuebuggerEntry } from './types'

let getUid = () => Math.random().toString(36).slice(2, 9)
export const setUidGenerator = (fn: () => string) => {
  getUid = fn
}

export type DebugOptions = {
  enable?: MaybeRefOrGetter<boolean>
}

export const moduleScopes = new Map<
  string,
  ReturnType<typeof effectScope>
>()

const createDebugScope = <T extends Record<string, any>>(
  groupId: VuebuggerEntry['groupId'],
  state: T,
  run: (entry: VuebuggerEntry) => void,
) => {
  const instance = getCurrentInstance()

  const componentName =
    instance?.type.name ||
    instance?.type.__name ||
    'No component'
  const uid = `${componentName}/${groupId}-${getUid()}`

  const entry: VuebuggerEntry = {
    groupId,
    uid,
    componentName,
    componentInstance: instance,
    debugState: state,
  }

  const currentScope = getCurrentScope()

  if (currentScope) {
    currentScope.run(() => {
      onScopeDispose(() => remove(entry))
      run(entry)
    })
  } else {
    const existing = moduleScopes.get(groupId)
    if (existing) existing.stop()

    const scope = effectScope()
    moduleScopes.set(groupId, scope)
    scope.run(() => {
      onScopeDispose(() => remove(entry))
      run(entry)
    })
  }
}

export const debug = <T extends Record<string, any>>(
  groupId: VuebuggerEntry['groupId'],
  state: T,
  options?: DebugOptions,
): T => {
  if (
    typeof __ENABLE_VUEBUGGER__ === 'undefined'
      ? !import.meta.env?.DEV
      : !__ENABLE_VUEBUGGER__
  )
    return state

  createDebugScope(groupId, state, (entry) => {
    if (options?.enable === undefined) {
      watch(
        () => state,
        (value) => {
          upsert({ ...entry, debugState: value })
        },
        { immediate: true, deep: true },
      )
    } else {
      watch(
        [() => toValue(options.enable), () => state],
        ([isActive]) => {
          if (isActive) upsert(entry)
          else remove(entry)
        },
        { immediate: true, deep: true },
      )
    }
  })

  return state
}
