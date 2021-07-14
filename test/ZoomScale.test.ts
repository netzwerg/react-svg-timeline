import { Domain } from '../src'
import {
  nextBiggerZoomScale,
  nextSmallerZoomScale,
  currentZoomScale,
  zoomScaleWidth,
  ZoomLevels,
  orderedScales,
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

  it('should handle normal ranges correctly', () => {
    for (let i = 1; i < orderedScales.length - 1; i++) {
      expect(currentZoomScale([0, zoomScaleWidth(orderedScales[i])])).toEqual(orderedScales[i])
    }
  })

  it(`should handle ranges smaller than ${orderedScales[orderedScales.length - 1]} correctly`, () => {
    expect(currentZoomScale([0, zoomScaleWidth(orderedScales[orderedScales.length - 1])])).toEqual(
      orderedScales[orderedScales.length - 1]
    )
    expect(nextSmallerZoomScale([0, zoomScaleWidth(orderedScales[orderedScales.length - 1])])).toEqual(ZoomLevels.MIN)
    expect(nextBiggerZoomScale([0, zoomScaleWidth(orderedScales[orderedScales.length - 1])])).toEqual(
      orderedScales[orderedScales.length - 2]
    )
  })

  it(`should handle ranges larger than ${ZoomLevels.TEN_YEARS} correctly`, () => {
    expect(currentZoomScale([0, zoomScaleWidth(orderedScales[0])])).toEqual(orderedScales[0])
    expect(nextSmallerZoomScale([0, zoomScaleWidth(orderedScales[0])])).toEqual(orderedScales[1])
    expect(nextBiggerZoomScale([0, zoomScaleWidth(orderedScales[0])])).toEqual(ZoomLevels.MAX)
  })

  it(`should handle range width of ${ZoomLevels.MIN} correctly`, () => {
    expect(currentZoomScale([0, zoomScaleWidth(ZoomLevels.MIN)])).toEqual(ZoomLevels.MIN)
    expect(nextSmallerZoomScale([0, zoomScaleWidth(ZoomLevels.MIN)])).toEqual(ZoomLevels.MIN)
    expect(nextBiggerZoomScale([0, zoomScaleWidth(ZoomLevels.MIN)])).toEqual(ZoomLevels.ONE_MIN)
  })

  it(`should handle range width of ${ZoomLevels.MAX} correctly`, () => {
    expect(currentZoomScale([0, zoomScaleWidth(ZoomLevels.MAX)])).toEqual(ZoomLevels.MAX)
    expect(nextSmallerZoomScale([0, zoomScaleWidth(ZoomLevels.MAX)])).toEqual(ZoomLevels.TEN_YEARS)
    expect(nextBiggerZoomScale([0, zoomScaleWidth(ZoomLevels.MAX)])).toEqual(ZoomLevels.MAX)
  })

  it('should calculate nextSmallerZoomScale to be at least 50% smaller than currentZoomScale', () => {
    const twentyThreeHours: Domain = [0, 23 * zoomScaleWidth(ZoomLevels.ONE_HOUR)]
    const twentyFourHours: Domain = [0, 24 * zoomScaleWidth(ZoomLevels.ONE_HOUR)]
    const twentyFiveHours: Domain = [0, 25 * zoomScaleWidth(ZoomLevels.ONE_HOUR)]
    const twelveHours: Domain = [0, 12 * zoomScaleWidth(ZoomLevels.ONE_HOUR)]
    const elevenHours: Domain = [0, 11 * zoomScaleWidth(ZoomLevels.ONE_HOUR)]

    expect(nextSmallerZoomScale(twentyFiveHours)).toEqual(ZoomLevels.TWELVE_HOURS)
    expect(nextSmallerZoomScale(twentyFourHours)).toEqual(ZoomLevels.TWELVE_HOURS)
    expect(nextSmallerZoomScale(twentyThreeHours)).toEqual(ZoomLevels.SIX_HOURS)
    expect(nextSmallerZoomScale(twelveHours)).toEqual(ZoomLevels.SIX_HOURS)
    expect(nextSmallerZoomScale(elevenHours)).toEqual(ZoomLevels.THREE_HOURS)
  })

  it('should calculate nextBiggerZoomScale to be at least 50% bigger than currentZoomScale', () => {
    const oneDay: Domain = [0, 1 * zoomScaleWidth(ZoomLevels.ONE_DAY)]
    const threeDays: Domain = [0, 3 * zoomScaleWidth(ZoomLevels.ONE_DAY)]
    const fourDays: Domain = [0, 4 * zoomScaleWidth(ZoomLevels.ONE_DAY)]
    const sixDays: Domain = [0, 6 * zoomScaleWidth(ZoomLevels.ONE_DAY)]
    const sevenDays: Domain = [0, 7 * zoomScaleWidth(ZoomLevels.ONE_DAY)]

    expect(nextBiggerZoomScale(oneDay)).toEqual(ZoomLevels.ONE_WEEK)
    expect(nextBiggerZoomScale(threeDays)).toEqual(ZoomLevels.ONE_WEEK)
    expect(nextBiggerZoomScale(fourDays)).toEqual(ZoomLevels.ONE_MONTH)
    expect(nextBiggerZoomScale(sixDays)).toEqual(ZoomLevels.ONE_MONTH)
    expect(nextBiggerZoomScale(sevenDays)).toEqual(ZoomLevels.ONE_MONTH)
  })
})
