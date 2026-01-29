import type { VuebuggerEntry } from './types'

export const byUid = new Map<
  VuebuggerEntry['uid'],
  VuebuggerEntry
>()

export const byGroupId = new Map<
  VuebuggerEntry['groupId'],
  Set<VuebuggerEntry['uid']>
>()

const callbacks: ((
  componentInstance: VuebuggerEntry['componentInstance'],
) => void)[] = []
const runCallbacks = (
  componentInstance: VuebuggerEntry['componentInstance'],
) => callbacks.forEach((cb) => cb(componentInstance))
const withCallbacks =
  (fn: (entry: VuebuggerEntry) => void) =>
  (entry: VuebuggerEntry) => {
    fn(entry)
    runCallbacks(entry.componentInstance)
  }

export const upsert = withCallbacks(
  (entry: VuebuggerEntry) => {
    const { uid, groupId } = entry
    byUid.set(uid, entry)
    const group = byGroupId.get(groupId)
    if (!group) byGroupId.set(groupId, new Set([uid]))
    else group.add(uid)
  },
)

export const remove = withCallbacks(
  (entry: VuebuggerEntry) => {
    const { uid, groupId } = entry
    byUid.delete(uid)
    const group = byGroupId.get(groupId)
    group?.delete(uid)
    if (group?.size === 0) byGroupId.delete(groupId)
  },
)

export const onUpdate = (
  fn: (
    componentInstance: VuebuggerEntry['componentInstance'],
  ) => void,
) => {
  callbacks.push(fn)
}
