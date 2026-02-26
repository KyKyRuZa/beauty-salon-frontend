import { describe, it, expect } from 'vitest'

describe('Unit Tests', () => {
  it('должен успешно запускаться', () => {
    expect(true).toBe(true)
  })

  it('должен корректно складывать числа', () => {
    expect(2 + 2).toBe(4)
  })
})
