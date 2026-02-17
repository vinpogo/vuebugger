import { beforeEach, expect, test, vi } from 'vitest'
import {
  byGroupId,
  byUid,
  onUpdate,
  remove,
  upsert,
} from './registry'

const mockA = vi.fn()
const mockB = vi.fn()
const mockC = vi.fn()
onUpdate(() => {
  mockA()
  mockB()
})
onUpdate(mockC)

beforeEach(() => {
  vi.clearAllMocks()
  byUid.clear()
  byGroupId.clear()
})

test('runs all callbacks on upsert', () => {
  upsert({
    componentName: 'foo',
    groupId: '21',
    debugState: {},
    uid: '',
    componentInstance: null,
  })

  expect(mockA).toHaveBeenCalledOnce()
  expect(mockB).toHaveBeenCalledOnce()
  expect(mockC).toHaveBeenCalledOnce()
})
test('runs all callbacks on remove', () => {
  remove({
    componentName: 'foo',
    groupId: '21',
    debugState: {},
    uid: '',
    componentInstance: null,
  })

  expect(mockA).toHaveBeenCalledOnce()
  expect(mockB).toHaveBeenCalledOnce()
  expect(mockC).toHaveBeenCalledOnce()
})

test('upserts entry', () => {
  const entry = {
    componentName: 'foo',
    groupId: '21',
    debugState: {},
    uid: 'someuid',
    componentInstance: null,
  }
  upsert(entry)

  expect(byUid.get('someuid')).toBe(entry)
})

test('upserts mutliple entries in same group', () => {
  const entryA = {
    componentName: 'foo',
    groupId: '21',
    debugState: {},
    uid: 'someuid',
    componentInstance: null,
  }
  const entryB = {
    componentName: 'foo',
    groupId: '21',
    debugState: {},
    uid: 'someotheruid',
    componentInstance: null,
  }
  upsert(entryA)
  upsert(entryB)
  expect(byGroupId.size).toBe(1)
  expect(byGroupId.get('21')?.size).toBe(2)
  expect(byGroupId.get('21')?.has('someuid')).toBe(true)
  expect(byGroupId.get('21')?.has('someotheruid')).toBe(
    true,
  )
})

test('removes entry', () => {
  const entry = {
    componentName: 'foo',
    groupId: '21',
    debugState: {},
    uid: '',
    componentInstance: null,
  }
  upsert(entry)
  remove(entry)

  expect(byUid.get('foo')).toBeUndefined()
  expect(byGroupId.size).toBe(0)
})
