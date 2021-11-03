import { diff, range } from '../src/utils'

describe('shared range', () => {
  it('should return a filled array', () => {
    expect(range(10, 15)).toEqual([10, 11, 12, 13, 14])
  })
})

describe('shared diff', () => {
  it('should return the difference between two positive numbers', () => {
    expect(diff(1, 4)).toEqual(3)
  })
  it('should not care about the order of the arguments', () => {
    expect(diff(4, 1)).toEqual(3)
  })
  it('should return the difference between a negative and a positive number', () => {
    expect(diff(-4, 1)).toEqual(5)
  })
  it('should return the difference between two negative numbers', () => {
    expect(diff(-4, -1)).toEqual(3)
  })
})
