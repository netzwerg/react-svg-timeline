import React from 'react'
import { makeStyles } from '@material-ui/core'
import { useTimelineTheme } from '../theme'
import { TrimmerTheme } from '../theme/model'

const useStyles = makeStyles(() => ({
  trimRange: (trimmerTheme: TrimmerTheme) => ({
    fill: trimmerTheme.trimRangeOutsideColor,
    opacity: trimmerTheme.trimRangeOutsideOpacity,
  }),
}))

interface Props {
  startX: number
  endX: number
  height: number
  width: number
}

export function TrimRange({ startX, endX, height, width }: Props) {
  const trimmerStyle = useTimelineTheme().trimmer
  const classes = useStyles(trimmerStyle)
  const [y1, y2] = [0, height]
  return (
    <g>
      {startX > 0 && <rect className={classes.trimRange} x={0} y={y1} width={startX} height={y2} />}
      {width - endX > 0 && <rect className={classes.trimRange} x={endX} y={y1} width={width - endX} height={y2} />}
    </g>
  )
}
