import React from 'react'
import { makeStyles } from '@material-ui/core'
import { grey } from '@material-ui/core/colors'

const useStyles = makeStyles(() => ({
  trimRange: {
    fill: grey.A200,
    opacity: 0.1,
  },
}))

interface Props {
  startX: number
  endX: number
  height: number
  width: number
}

export function TrimRange({ startX, endX, height, width }: Props) {
  const classes = useStyles()

  const [y1, y2] = [0, height]

  return (
    <g>
      <rect className={classes.trimRange} x={0} y={y1} width={startX} height={y2} />
      <rect className={classes.trimRange} x={endX} y={y1} width={width - endX} height={y2} />
    </g>
  )
}
