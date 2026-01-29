import type { setupDevToolsPlugin } from '@vue/devtools-api'
import type { ComponentInternalInstance } from 'vue'

export type VuebuggerEntry = {
  groupId: string
  uid: string
  componentName: string
  componentInstance: ComponentInternalInstance | null
  debugState: Record<string, any>
}

export type DevtoolsApi = Parameters<
  Parameters<typeof setupDevToolsPlugin>['1']
>['0']
export type HandlerNames = keyof DevtoolsApi['on']
export type DevtoolsApiHandler<T extends HandlerNames> =
  Parameters<DevtoolsApi['on'][T]>['0']
export type TreeNode = {
  id: string
  label: string
  children?: TreeNode[]
}
