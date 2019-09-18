import { grey, indigo, yellow } from '@material-ui/core/colors'

export const noOp = () => {
    /* ignorance is bliss */
}
export const defaultEventColor = indigo['500']
export const defaultLaneColor = indigo['500']

export const defaultDarkGrey = grey['800']
export const selectionColor = 'rgba(255, 255, 141, 0.5)' // transparent yellow A100
export const selectionColorOpaque = yellow.A100

export const range = (start: number, end: number) =>
    new Array(end - start + 1).fill(undefined).map((_v_, index) => index + start)
