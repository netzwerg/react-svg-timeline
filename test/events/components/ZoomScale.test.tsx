import { Domain } from '../../../src'
import { nextBiggerZoomScale, nextSmallerZoomScale, zoomScaleWidth } from '../../../src/ZoomScale'

describe('ZoomScale', () => {
    const threeDays: Domain = [0, 3 * zoomScaleWidth('1 day')]

    it('nextSmallerZoomScale', () => {
        expect(nextSmallerZoomScale(threeDays)).toEqual('1 day')
    })
    it('nextBiggerZoomScale', () => {
        expect(nextBiggerZoomScale(threeDays)).toEqual('1 week')
    })
})
