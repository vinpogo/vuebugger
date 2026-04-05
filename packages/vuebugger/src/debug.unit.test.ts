import { expect, test, vi } from 'vitest'
import { effectScope, nextTick, ref } from 'vue'

import {
  debug,
  moduleScopes,
  setUidGenerator,
} from './debug'
import { byGroupId, byUid } from './registry'

// ---- helpers ----------------------------------------------------------------

let counter = 0
const setup = () => {
  counter++
  const id = `test-${counter}`
  setUidGenerator(() => id)
  return id
}

const teardown = () => {
  byUid.clear()
  byGroupId.clear()
  moduleScopes.clear()
}

// ---- debug() without options ------------------------------------------------

test('returns state unchanged', () => {
  setup()
  const state = { count: 1 }
  const result = debug('useForm', state)
  expect(result).toBe(state)
  teardown()
})

test('registers entry immediately', async () => {
  const id = setup()
  const state = { count: 1 }

  const scope = effectScope()
  scope.run(() => {
    debug('useForm', state)
  })

  await nextTick()

  expect(byUid.size).toBe(1)
  const uid = [...byUid.keys()][0]
  expect(uid).toContain(`useForm-${id}`)
  expect(byUid.get(uid)?.debugState).toBe(state)
  expect(byGroupId.has('useForm')).toBe(true)

  scope.stop()
  teardown()
})

test('removes entry on scope dispose', async () => {
  setup()
  const state = { count: 1 }

  const scope = effectScope()
  scope.run(() => {
    debug('useForm', state)
  })

  await nextTick()
  expect(byUid.size).toBe(1)

  scope.stop()
  await nextTick()

  expect(byUid.size).toBe(0)
  expect(byGroupId.size).toBe(0)

  teardown()
})

test('re-upserts entry on state change', async () => {
  setup()
  const state = { count: ref(0) }

  const scope = effectScope()
  scope.run(() => {
    debug('useForm', state)
  })

  await nextTick()
  expect(byUid.size).toBe(1)
  const uid = [...byUid.keys()][0]

  state.count.value = 99
  await nextTick()

  expect(byUid.size).toBe(1)
  expect(byUid.get(uid)?.debugState).toBe(state)

  scope.stop()
  teardown()
})

// ---- debug() with options.enable: () => boolean ----------------------------

test('enable getter — does NOT register when initially false', async () => {
  setup()
  const state = { count: 1 }

  const scope = effectScope()
  scope.run(() => {
    debug('useForm', state, { enable: () => false })
  })

  await nextTick()

  expect(byUid.size).toBe(0)
  expect(byGroupId.size).toBe(0)

  scope.stop()
  teardown()
})

test('enable getter — registers when initially true', async () => {
  const id = setup()
  const state = { count: 1 }

  const scope = effectScope()
  scope.run(() => {
    debug('useForm', state, { enable: () => true })
  })

  await nextTick()

  expect(byUid.size).toBe(1)
  const uid = [...byUid.keys()][0]
  expect(uid).toContain(`useForm-${id}`)

  scope.stop()
  teardown()
})

test('enable getter — registers when condition switches false → true', async () => {
  const id = setup()
  const active = ref(false)
  const state = { count: 1 }

  const scope = effectScope()
  scope.run(() => {
    debug('useForm', state, { enable: () => active.value })
  })

  await nextTick()
  expect(byUid.size).toBe(0)

  active.value = true
  await nextTick()

  expect(byUid.size).toBe(1)
  const uid = [...byUid.keys()][0]
  expect(uid).toContain(`useForm-${id}`)

  scope.stop()
  teardown()
})

test('enable getter — removes when condition switches true → false', async () => {
  setup()
  const active = ref(true)
  const state = { count: 1 }

  const scope = effectScope()
  scope.run(() => {
    debug('useForm', state, { enable: () => active.value })
  })

  await nextTick()
  expect(byUid.size).toBe(1)

  active.value = false
  await nextTick()

  expect(byUid.size).toBe(0)
  expect(byGroupId.size).toBe(0)

  scope.stop()
  teardown()
})

test('enable getter — removes on scope dispose when condition is true', async () => {
  setup()
  const state = { count: 1 }

  const scope = effectScope()
  scope.run(() => {
    debug('useForm', state, { enable: () => true })
  })

  await nextTick()
  expect(byUid.size).toBe(1)

  scope.stop()
  await nextTick()

  expect(byUid.size).toBe(0)
  expect(byGroupId.size).toBe(0)

  teardown()
})

test('enable getter — removes on scope dispose even when condition is false', async () => {
  setup()
  const active = ref(true)
  const state = { count: 1 }

  const scope = effectScope()
  scope.run(() => {
    debug('useForm', state, { enable: () => active.value })
  })

  await nextTick()
  expect(byUid.size).toBe(1)

  scope.stop()
  await nextTick()

  expect(byUid.size).toBe(0)

  teardown()
})

test('enable getter — does NOT re-register on state change while false', async () => {
  setup()
  const active = ref(false)
  const state = { count: ref(0) }

  const scope = effectScope()
  scope.run(() => {
    debug('useForm', state, { enable: () => active.value })
  })

  await nextTick()
  expect(byUid.size).toBe(0)

  state.count.value = 99
  await nextTick()

  expect(byUid.size).toBe(0)

  scope.stop()
  teardown()
})

// ---- debug() with options.enable: Ref<boolean> ------------------------------

test('enable ref — registers when ref is true', async () => {
  setup()
  const active = ref(true)
  const state = { count: 1 }

  const scope = effectScope()
  scope.run(() => {
    debug('useForm', state, { enable: active })
  })

  await nextTick()
  expect(byUid.size).toBe(1)

  scope.stop()
  teardown()
})

test('enable ref — registers when ref switches false → true', async () => {
  setup()
  const active = ref(false)
  const state = { count: 1 }

  const scope = effectScope()
  scope.run(() => {
    debug('useForm', state, { enable: active })
  })

  await nextTick()
  expect(byUid.size).toBe(0)

  active.value = true
  await nextTick()

  expect(byUid.size).toBe(1)

  scope.stop()
  teardown()
})

test('enable ref — removes when ref switches true → false', async () => {
  setup()
  const active = ref(true)
  const state = { count: 1 }

  const scope = effectScope()
  scope.run(() => {
    debug('useForm', state, { enable: active })
  })

  await nextTick()
  expect(byUid.size).toBe(1)

  active.value = false
  await nextTick()

  expect(byUid.size).toBe(0)

  scope.stop()
  teardown()
})

// ---- debug() with options.enable: boolean -----------------------------------

test('enable boolean true — registers immediately', async () => {
  setup()
  const state = { count: 1 }

  const scope = effectScope()
  scope.run(() => {
    debug('useForm', state, { enable: true })
  })

  await nextTick()
  expect(byUid.size).toBe(1)

  scope.stop()
  teardown()
})

test('enable boolean false — never registers', async () => {
  setup()
  const state = { count: 1 }

  const scope = effectScope()
  scope.run(() => {
    debug('useForm', state, { enable: false })
  })

  await nextTick()
  expect(byUid.size).toBe(0)

  scope.stop()
  teardown()
})

// ---- module-level / HMR -----------------------------------------------------

test('HMR: re-executing debug outside a scope with same groupId stops old scope and keeps only one entry', async () => {
  setup()
  const state = { count: 1 }

  // First "module execution"
  debug('myStore', state)
  await nextTick()
  expect(byUid.size).toBe(1)
  expect(moduleScopes.size).toBe(1)
  const firstScope = moduleScopes.get('myStore')

  // Simulate HMR: module re-executes, same groupId
  setup()
  const state2 = { count: 2 }
  debug('myStore', state2)
  await nextTick()

  // Old scope should be stopped, only one entry remains
  expect(firstScope?.active).toBe(false)
  expect(byUid.size).toBe(1)
  expect(moduleScopes.size).toBe(1)
  expect(moduleScopes.get('myStore')).not.toBe(firstScope)

  teardown()
})

test('module-level: registers entry outside a component scope', async () => {
  setup()
  const state = { count: 1 }

  debug('myStore', state)
  await nextTick()

  expect(byUid.size).toBe(1)
  expect(moduleScopes.has('myStore')).toBe(true)

  teardown()
})

// ---- production guard -------------------------------------------------------

test('production guard: returns state but registers nothing when DEV is false', async () => {
  vi.stubEnv('DEV', false)

  setup()
  const state = { count: 1 }

  const result = debug('useForm', state)

  await nextTick()

  expect(result).toBe(state)
  expect(byUid.size).toBe(0)

  vi.unstubAllEnvs()
  teardown()
})
