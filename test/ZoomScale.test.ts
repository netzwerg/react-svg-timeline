import { Domain } from '../src'
import {
  nextBiggerZoomScale,
  nextSmallerZoomScale,
  currentZoomScale,
  zoomScaleWidth,
  ZoomLevels,
} from '../src/ZoomScale'

describe('ZoomScale for time-range: 3 days', () => {
  const threeDays: Domain = [0, 3 * zoomScaleWidth(ZoomLevels.ONE_DAY)]

  it('nextSmallerZoomScale', () => {
    expect(nextSmallerZoomScale(threeDays)).toEqual(ZoomLevels.ONE_DAY)
  })
  it('nextBiggerZoomScale', () => {
    expect(nextBiggerZoomScale(threeDays)).toEqual(ZoomLevels.ONE_WEEK)
  })
})

describe('ZoomScale for time-range: [1-12] hours', () => {
  const fiveHours: Domain = [0, 5 * zoomScaleWidth(ZoomLevels.ONE_HOUR)]
  const threeHours: Domain = [0, 3 * zoomScaleWidth(ZoomLevels.ONE_HOUR)]

  it('nextSmallerZoomScale', () => {
    expect(nextSmallerZoomScale(fiveHours)).toEqual(ZoomLevels.ONE_HOUR)
  })
  it('nextBiggerZoomScale', () => {
    expect(nextBiggerZoomScale(fiveHours)).toEqual(ZoomLevels.TWELVE_HOURS)
  })

  it('nextSmallerZoomScale', () => {
    expect(nextSmallerZoomScale(threeHours)).toEqual(ZoomLevels.ONE_HOUR)
  })
  it('nextBiggerZoomScale', () => {
    expect(nextBiggerZoomScale(threeHours)).toEqual(ZoomLevels.TWELVE_HOURS)
  })
})

describe('ZoomScale for time-range: [15-60] minutes', () => {
  const twentyFiveMins: Domain = [0, 25 * zoomScaleWidth(ZoomLevels.ONE_MIN)]
  const fortyMins: Domain = [0, 40 * zoomScaleWidth(ZoomLevels.ONE_MIN)]

  it('nextSmallerZoomScale', () => {
    expect(nextSmallerZoomScale(twentyFiveMins)).toEqual(ZoomLevels.TEN_MINS)
  })
  it('nextBiggerZoomScale', () => {
    expect(nextBiggerZoomScale(twentyFiveMins)).toEqual(ZoomLevels.ONE_HOUR)
  })

  it('nextSmallerZoomScale', () => {
    expect(nextSmallerZoomScale(fortyMins)).toEqual(ZoomLevels.FIFTEEN_MINS)
  })
  it('nextBiggerZoomScale', () => {
    expect(nextBiggerZoomScale(fortyMins)).toEqual(ZoomLevels.THREE_HOURS)
  })
})

describe('ZoomScale', () => {
  const zero = new Date('0000-01-01').getTime()
  const zero100 = new Date('0100-01-01').getTime()

  it('can handle negative numbers', () => {
    expect(currentZoomScale([zero, zero100])).toEqual(ZoomLevels.MAX)
    expect(nextBiggerZoomScale([zero, zero100])).toEqual(ZoomLevels.MAX)
    expect(nextSmallerZoomScale([zero, zero100])).toEqual(ZoomLevels.TEN_YEARS)
  })
})
