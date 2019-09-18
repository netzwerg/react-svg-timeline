import { grey, indigo, yellow } from '@material-ui/core/colors'

export const noOp = () => {
    /* ignorance is bliss */
}
export const defaultEventColor = indigo['500']
export const defaultLaneColor = indigo['500']

export const defaultDarkGrey = grey['800']
export const selectionColor = 'rgba(255, 255, 141, 0.5)' // transparent yellow A100
export const selectionColorOpaque = yellow.A100

/**
 * Returns an array of numbers from start (inclusive) to end (exclusive)
 */
export const range = (start: number, end: number) =>
    new Array(end - start).fill(undefined).map((_v_, index) => index + start)
