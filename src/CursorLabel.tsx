import React from 'react'
import { makeStyles, Theme } from '@material-ui/core'
import { orange } from '@material-ui/core/colors'

const useStyles = makeStyles((theme: Theme) => ({
  label: {
    fill: orange.A200,
    textAnchor: 'middle',
    dominantBaseline: 'middle',
    fontFamily: theme.typography.caption.fontFamily,
    cursor: 'default',
  },
}))

interface Props {
  x: number
  overline: string
  label: string
  y: number | string
  cursor: string
}

function CursorLabel({ x, y, overline, label, cursor }: Props) {
  const classes = useStyles()

  return (
    <text className={classes.label} x={x} y={y} cursor={cursor}>
      <tspan x={x} cursor={cursor}>
        {overline}
      </tspan>
      <tspan x={x} dy={18} cursor={cursor}>
        {label}
      </tspan>
    </text>
  )
}

export default CursorLabel
