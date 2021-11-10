import * as React from 'react'
import makeStyles from '@material-ui/core/styles/makeStyles'
import { Theme } from '@material-ui/core'
import { LineAxisTheme } from './theme/model'
import { useTimelineTheme } from './theme'

const useAxisStyles = makeStyles((theme: Theme) => ({
  axis: (lineAxisTheme: LineAxisTheme) => ({
    stroke: lineAxisTheme.strokeColor ? lineAxisTheme.strokeColor : theme.palette.grey['500'],
    strokeWidth: lineAxisTheme.strokeWidth ? lineAxisTheme.strokeWidth : 2,
  }),
}))

export const Axis = ({ y }: { y: number }) => {
  const lineAxisTheme = useTimelineTheme().lineAxis || {}
  const classes = useAxisStyles(lineAxisTheme)
  return <line x1={0} y1={y} x2="100%" y2={y} className={classes.axis} />
}
