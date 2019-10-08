import { Domain } from './model'

export const dayDuration = 86400000
export const weekDuration = 7 * dayDuration
export const monthDuration = 30 * dayDuration
export const yearDuration = 365 * dayDuration

export type ZoomScale = 'maximum' | '10 years' | '1 year' | '1 month' | '1 week' | '1 day' | 'minimum'

const orderedScales: ReadonlyArray<ZoomScale> = ['10 years', '1 year', '1 month', '1 week', '1 day']

export const zoomScaleWidth = (scale: ZoomScale): number => {
  switch (scale) {
    case 'maximum':
      return Number.MAX_SAFE_INTEGER
    case '10 years':
      return 10 * yearDuration
    case '1 year':
      return yearDuration
    case '1 month':
      return monthDuration
    case '1 week':
      return weekDuration
    case '1 day':
      return dayDuration
    case 'minimum':
      return 0
    default:
      return 0
  }
}

export const nextSmallerZoomScale = (currentDomain: Domain): ZoomScale => {
  const range = (currentDomain[1] - currentDomain[0]) / 2
  return orderedScales.find(s => zoomScaleWidth(s) <= range) || 'minimum'
}

export const nextBiggerZoomScale = (currentDomain: Domain): ZoomScale => {
  const range = (currentDomain[1] - currentDomain[0]) * 2
  return [...orderedScales].reverse().find(s => zoomScaleWidth(s) > range) || 'maximum'
}
