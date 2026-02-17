import { describe, expect, it } from 'vitest'
import {
  deleteContent,
  generateKey,
  getContent,
  setContent,
} from './state'

describe('content management', () => {
  it('sets and gets content by key', () => {
    const key = 'test-key'
    const content = { text: 'Hello' }

    setContent(key, content)
    expect(getContent(key)).toEqual(content)

    deleteContent(key)
  })

  it('deletes content by key', () => {
    const key = 'test-key'
    const content = { text: 'Hello' }

    setContent(key, content)
    deleteContent(key)
    expect(getContent(key)).toBeUndefined()
  })

  it('returns undefined for non-existent key', () => {
    expect(getContent('non-existent')).toBeUndefined()
  })
})

describe('key generation', () => {
  it('keys are unique', () => {
    const key1 = generateKey()
    const key2 = generateKey()

    expect(key1).not.toBe(key2)
    expect(typeof key1).toBe('string')
    expect(typeof key2).toBe('string')
  })

  it('generates valid UUID format', () => {
    const key = generateKey()
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

    expect(key).toMatch(uuidRegex)
  })
})
