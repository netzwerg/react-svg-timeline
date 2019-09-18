import { range } from '../src/shared'

describe('shared', () => {
    it('range', () => {
        expect(range(10, 15)).toEqual([10, 11, 12, 13, 14])
    })
})
