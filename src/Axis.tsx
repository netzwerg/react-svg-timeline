import * as React from 'react'
import makeStyles from '@material-ui/core/styles/makeStyles'
import { Theme } from '@material-ui/core'

const useAxisStyles = makeStyles((theme: Theme) => ({
    axis: {
        stroke: theme.palette.grey['500'],
        strokeWidth: 2
    }
}))

export const Axis = ({ y }: { y: number }) => {
    const classes = useAxisStyles()
    return <line x1={0} y1={y} x2="100%" y2={y} className={classes.axis} />
}
