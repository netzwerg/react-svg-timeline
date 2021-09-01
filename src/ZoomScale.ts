import { Domain } from './model'
import { diff } from './shared'

export const oneSec = 1000 //in ms
export const oneMin = 60 * oneSec
export const fiveMins = 5 * oneMin
export const tenMins = 10 * oneMin
export const fifteenMins = 15 * oneMin
export const halfHour = 30 * oneMin
export const oneHour = 60 * oneMin
export const threeHours = 3 * oneHour
export const sixHours = 6 * oneHour
export const twelveHours = 12 * oneHour
export const dayDuration = 24 * oneHour
export const weekDuration = 7 * dayDuration
export const monthDuration = 30 * dayDuration
export const yearDuration = 365 * dayDuration

export enum ZoomLevels {
  MIN = 'minimum',
  TEN_MS = '10 ms',
  HUNDRED_MS = '100 ms',
  FIVEHUNDRED_MS = '500 ms',
  ONE_SEC = '1 sec',
  FIVE_SECS = '5 secs',
  TEN_SECS = '10 secs',
  THIRTY_SECS = '30 secs',
  ONE_MIN = '1 min',
  FIVE_MINS = '5 mins',
  TEN_MINS = '10 mins',
  FIFTEEN_MINS = '15 mins',
  THIRTY_MINS = '30 mins',
  ONE_HOUR = '1 hour',
  THREE_HOURS = '3 hours',
  SIX_HOURS = '6 hours',
  TWELVE_HOURS = '12 hours',
  ONE_DAY = '1 day',
  ONE_WEEK = '1 week',
  ONE_MONTH = '1 month',
  ONE_YEAR = '1 year',
  TEN_YEARS = '10 years',
  MAX = 'maximum',
}

export type ZoomScale = ZoomLevels

export const defaultOrderedZoomLevels: ReadonlyArray<ZoomLevels> = [
  ZoomLevels.TEN_YEARS,
  ZoomLevels.ONE_YEAR,
  ZoomLevels.ONE_MONTH,
  ZoomLevels.ONE_WEEK,
  ZoomLevels.ONE_DAY,
  ZoomLevels.TWELVE_HOURS,
  ZoomLevels.SIX_HOURS,
  ZoomLevels.THREE_HOURS,
  ZoomLevels.ONE_HOUR,
  ZoomLevels.THIRTY_MINS,
  ZoomLevels.FIFTEEN_MINS,
  ZoomLevels.TEN_MINS,
  ZoomLevels.FIVE_MINS,
  ZoomLevels.ONE_MIN,
]

export const zoomScaleWidth = (scale: ZoomLevels): number => {
  switch (scale) {
    case ZoomLevels.MAX:
      return Number.MAX_SAFE_INTEGER
    case ZoomLevels.TEN_YEARS:
      return 10 * yearDuration
    case ZoomLevels.ONE_YEAR:
      return yearDuration
    case ZoomLevels.ONE_MONTH:
      return monthDuration
    case ZoomLevels.ONE_WEEK:
      return weekDuration
    case ZoomLevels.ONE_DAY:
      return dayDuration
    case ZoomLevels.TWELVE_HOURS:
      return twelveHours
    case ZoomLevels.SIX_HOURS:
      return sixHours
    case ZoomLevels.THREE_HOURS:
      return threeHours
    case ZoomLevels.ONE_HOUR:
      return oneHour
    case ZoomLevels.THIRTY_MINS:
      return halfHour
    case ZoomLevels.FIFTEEN_MINS:
      return fifteenMins
    case ZoomLevels.TEN_MINS:
      return tenMins
    case ZoomLevels.FIVE_MINS:
      return fiveMins
    case ZoomLevels.ONE_MIN:
      return oneMin
    case ZoomLevels.THIRTY_SECS:
      return 30 * oneSec
    case ZoomLevels.TEN_SECS:
      return 10 * oneSec
    case ZoomLevels.FIVE_SECS:
      return 5 * oneSec
    case ZoomLevels.ONE_SEC:
      return oneSec
    case ZoomLevels.FIVEHUNDRED_MS:
      return 500
    case ZoomLevels.HUNDRED_MS:
      return 100
    case ZoomLevels.TEN_MS:
      return 10
    case ZoomLevels.MIN:
      return 0
    default:
      return 0
  }
}

export const currentZoomScale = (
  currentDomain: Domain,
  orderedSelectedZoomLevels: ReadonlyArray<ZoomLevels>
): ZoomLevels => {
  const range = diff(currentDomain[1], currentDomain[0])

  if (range > zoomScaleWidth(orderedSelectedZoomLevels[0])) {
    return ZoomLevels.MAX
  } else if (range <= zoomScaleWidth(ZoomLevels.MIN)) {
    return ZoomLevels.MIN
  } else {
    return [...orderedSelectedZoomLevels].reverse().find((s) => range <= zoomScaleWidth(s)) || ZoomLevels.MAX
  }
}

export const nextSmallerZoomScale = (
  currentDomain: Domain,
  orderedSelectedZoomLevels: ReadonlyArray<ZoomLevels>
): ZoomLevels => {
  const range = diff(currentDomain[1], currentDomain[0]) / 2
  return orderedSelectedZoomLevels.find((s) => zoomScaleWidth(s) <= range) || ZoomLevels.MIN
}

export const nextBiggerZoomScale = (
  currentDomain: Domain,
  orderedSelectedZoomLevels: ReadonlyArray<ZoomLevels>
): ZoomLevels => {
  const range = diff(currentDomain[1], currentDomain[0]) * 2
  return [...orderedSelectedZoomLevels].reverse().find((s) => zoomScaleWidth(s) > range) || ZoomLevels.MAX
}
