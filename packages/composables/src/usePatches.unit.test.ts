import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { usePatches } from './usePatches'

describe('patches', () => {
  it('no patches returns initial data', () => {
    const initialData = { foo: 'bar' }
    const { data } = usePatches(initialData)

    expect(data.value).toEqual(initialData)
  })

  it('applies patch to data', async () => {
    const initialData = { foo: 'bar' }
    const { data, patch } = usePatches(initialData)
    patch((data) => (data.foo = 'new value'))

    await nextTick()

    expect(data.value.foo).toBe('new value')
  })

  it('applies multiple patches to data', async () => {
    const initialData = { foo: 'bar', fo: 'baz' }
    const { data, patch } = usePatches(initialData)
    patch((data) => (data.foo = 'new value'))
    patch((data) => (data.fo = 'another value'))

    await nextTick()
    expect(data.value.foo).toBe('new value')
    expect(data.value.fo).toBe('another value')
  })

  it('automatically cleans redundant patches', async () => {
    const initialData = { foo: 'bar', bar: 'baz' }
    const { data, patches, patch } = usePatches(initialData)

    patch((data) => (data.foo = 'new value'))
    patch((data) => (data.bar = 'new value'))
    data.value = { foo: 'race condition', bar: 'new value' }

    await nextTick()
    expect(patches.value).toHaveLength(1)
    expect(data.value).toEqual({
      foo: 'new value',
      bar: 'new value',
    })
  })

  it('removes all patches', async () => {
    const initialData = { foo: 'bar', bar: 'baz' }
    const { data, patches, patch, reset } =
      usePatches(initialData)
    patch((data) => (data.foo = 'new value'))
    patch((data) => (data.bar = 'new value'))
    reset()

    await nextTick()
    expect(patches.value).toHaveLength(0)
    expect(data.value).toEqual({ foo: 'bar', bar: 'baz' })
  })
})
