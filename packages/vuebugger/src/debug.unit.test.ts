import { expect, test, vi } from 'vitest'
import { effectScope, nextTick, ref } from 'vue'

import { debug, setUidGenerator } from './debug'
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
