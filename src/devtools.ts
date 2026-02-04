import { setupDevToolsPlugin } from '@vue/devtools-api'
import type { App } from 'vue'
import { toValue } from 'vue'
import { byGroupId, byUid, onUpdate } from './registry'
import type {
  DevtoolsApi,
  DevtoolsApiHandler,
  VuebuggerEntry,
} from './types'

const INSPECTOR_ID = 'vuebugger-inspector'
const TIMELINE_ID = 'vuebugger-timeline'

export const handleGetInspectorTree: DevtoolsApiHandler<
  'getInspectorTree'
> = (payload) => {
  if (payload.inspectorId === INSPECTOR_ID) {
    const term = payload.filter
    payload.rootNodes = byGroupId
      .entries()
      .filter(
        ([groupId, uids]) =>
          groupId.includes(term) ||
          uids.values().some((uid) => uid.includes(term)),
      )
      .map(([groupId, uids]) => ({
        id: groupId,
        label: groupId,
        children: uids
          .values()
          .filter((uid) => uid.includes(term))
          .map((uid) => ({
            id: uid,
            label: uid,
          }))
          .toArray(),
      }))
      .toArray()
  }
}

export const handleGetInspectorState =
  (
    api: DevtoolsApi,
  ): DevtoolsApiHandler<'getInspectorState'> =>
  (payload) => {
    if (payload.inspectorId === INSPECTOR_ID) {
      const entry = byUid.get(payload.nodeId)
      const group = byGroupId.get(payload.nodeId)
      if (group) {
        api.unhighlightElement()
        payload.state = group.values().reduce(
          (res, uid) => {
            const { debugState } = byUid.get(uid)!
            res[uid] = Object.entries(debugState).map(
              ([key, value]) => ({
                key,
                value: toValue(value),
              }),
            )
            return res
          },
          {} as Record<
            string,
            { key: string; value: any }[]
          >,
        )
        return
      }
      if (entry) {
        payload.state = {
          [payload.nodeId]: Object.entries(
            entry.debugState,
          ).map(([key, value]) => ({
            key,
            value: toValue(value),
            editable: true,
          })),
        }
        if (entry.componentInstance)
          api.highlightElement(entry.componentInstance)
      }
    }
  }

export const handleInspectComponent: DevtoolsApiHandler<
  'inspectComponent'
> = (payload) => {
  const entries = byUid
    .values()
    .filter(
      (entry) =>
        entry.componentInstance ===
        payload.componentInstance,
    )
    .flatMap((entry) => {
      return Object.entries(entry.debugState).map(
        ([key, value]) => ({
          type: entry.uid,
          key,
          value: toValue(value),
          editable: true,
        }),
      )
    })
    .toArray()
  payload.instanceData.state.push(...entries)
}

export function setupComposableDevtools<T>(app: App<T>) {
  console.log('🐞 Vuebugger ready to use')
  setupDevToolsPlugin(
    {
      id: 'composables-debugger',
      label: 'Composables',
      logo: 'https://raw.githubusercontent.com/vinpogo/vuebugger/main/logo.png',
      app,
    },
    (api) => {
      api.addInspector({
        id: INSPECTOR_ID,
        label: 'Vuebugger',
        icon: 'https://raw.githubusercontent.com/vinpogo/vuebugger/main/logo.png',
        treeFilterPlaceholder:
          'Search by composable or component name...',
      })
      api.addTimelineLayer({
        id: TIMELINE_ID,
        label: 'Vuebugger',
        color: 155,
      })

      onUpdate((entry: VuebuggerEntry) => {
        api.sendInspectorTree(INSPECTOR_ID)
        api.sendInspectorState(INSPECTOR_ID)
        api.notifyComponentUpdate(entry.componentInstance)
        api.addTimelineEvent({
          layerId: TIMELINE_ID,
          event: {
            time: api.now(),
            data: entry,
            title: `${entry.uid} state change`,
            groupId: entry.uid,
          },
        })
      })

      api.on.getInspectorTree(handleGetInspectorTree)
      api.on.getInspectorState(handleGetInspectorState(api))
      api.on.inspectComponent(handleInspectComponent)
    },
  )
}
