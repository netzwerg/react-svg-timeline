import React from 'react'
import { makeStyles } from '@material-ui/core'
import { ScaleLinear } from 'd3-scale'
import { TrimHover, TrimNone } from '../InteractionHandling'
import TrimHandle from './TrimHandle'
import Triangle, { TriangleDirection } from '../Triangle'
import { useTimelineTheme } from '../theme'
import { TrimmerTheme } from '../theme/model'

const useStyles = makeStyles(() => ({
  trimmerArea: (trimmerTheme: TrimmerTheme) => ({
    fill: trimmerTheme.trimRangeInsideColor,
    opacity: trimmerTheme.trimRangeInsideOpacity,
  }),
  trimmerAreaHighlight: (trimmerTheme: TrimmerTheme) => ({
    fill: trimmerTheme.trimRangeInsideHighlightColor,
    opacity: trimmerTheme.trimRangeInsideHighlightOpacity,
  }),
  triangle: (trimmerTheme: TrimmerTheme) => ({
    fill: trimmerTheme.trimTriangleColor,
  }),
}))

interface Props {
  startX: number
  endX: number
  height: number
  width: number
  timeScale: ScaleLinear<number, number>
  highlightActiveArea: boolean
  setTrimMode: (trimHoverMode: TrimHover | TrimNone) => void
  dateFormat: (ms: number) => string
}

export function Trimmer({
  startX,
  endX,
  timeScale,
  height,
  width,
  highlightActiveArea,
  setTrimMode,
  dateFormat,
}: Props) {
  const trimmerTheme = useTimelineTheme().trimmer
  const classes = useStyles(trimmerTheme)

  const [y1, y2] = [0, height]
  const [scaledStartX, scaledEndX] = [timeScale(startX)!, timeScale(endX)!]

  return (
    <g>
      <rect
        className={highlightActiveArea ? classes.trimmerAreaHighlight : classes.trimmerArea}
        x={Math.min(scaledStartX, scaledEndX)}
        y={y1}
        width={Math.abs(scaledEndX - scaledStartX)}
        height={y2}
      />
      {scaledStartX > 0 ? (
        <TrimHandle
          x={scaledStartX}
          dateString={dateFormat(startX)}
          label="Date from"
          height={height}
          onMouseEnter={() => setTrimMode({ variant: 'trim hover start' })}
          onMouseLeave={() => setTrimMode({ variant: 'none' })}
        />
      ) : (
        <Triangle
          x={25}
          y={height / 2}
          dimension={50}
          direction={TriangleDirection.Left}
          className={classes.triangle}
        />
      )}
      {width - scaledEndX > 0 ? (
        <TrimHandle
          x={scaledEndX}
          dateString={dateFormat(endX)}
          label="Date to"
          height={height}
          onMouseEnter={() => setTrimMode({ variant: 'trim hover end' })}
          onMouseLeave={() => setTrimMode({ variant: 'none' })}
        />
      ) : (
        <Triangle
          x={width - 25}
          y={height / 2}
          dimension={50}
          direction={TriangleDirection.Right}
          className={classes.triangle}
        />
      )}
    </g>
  )
}
