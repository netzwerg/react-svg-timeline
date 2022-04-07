export const noOp = () => {
  /* ignorance is bliss */
}

const INDIGO_500 = '#3f51b5'
const YELLOW_A100 = '#ffff8d'
const YELLOW_A100_TRANSPARENT = 'rgba(255, 255, 141, 0.5)'

export const defaultEventColor = INDIGO_500
export const defaultClusterColor = INDIGO_500
export const defaultLaneColor = INDIGO_500

export const selectionColor = YELLOW_A100_TRANSPARENT
export const selectionColorOpaque = YELLOW_A100

export const defaultSingleEventMarkHeight = 20

/**
 * Returns an array of numbers from start (inclusive) to end (exclusive)
 */
export const range = (start: number, end: number) =>
  new Array(end - start).fill(undefined).map((_v_, index) => index + start)

/** Clamps a given number to a given range */
export const clamp = (number: number, min: number, max: number): number => {
  return Math.min(Math.max(number, min), max)
}

export const diff = (value1: number, value2: number): number => {
  return Math.abs(Math.max(value1, value2) - Math.min(value1, value2))
}
