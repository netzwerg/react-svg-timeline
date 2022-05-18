export const noOp = () => {
  /* ignorance is bliss */
}

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
