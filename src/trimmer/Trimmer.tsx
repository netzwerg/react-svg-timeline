import React from 'react'
import { makeStyles } from '@material-ui/core'
import { orange } from '@material-ui/core/colors'
import { ScaleLinear } from 'd3-scale'
import { TrimHover, TrimNone } from '../InteractionHandling'
import TrimHandle from './TrimHandle'

const useStyles = makeStyles(() => ({
  trimmerArea: {
    fill: orange.A200,
    opacity: 0.1,
  },
}))

interface Props {
  startX: number
  endX: number
  height: number
  timeScale: ScaleLinear<number, number>
  setTrimMode: (trimHoverMode: TrimHover | TrimNone) => void
  dateFormat: (ms: number) => string
}

export function Trimmer({ startX, endX, timeScale, height, setTrimMode, dateFormat }: Props) {
  const classes = useStyles()

  const [y1, y2] = [0, height]
  const [scaledStartX, scaledEndX] = [timeScale(startX)!, timeScale(endX)!]

  return (
    <g>
      <rect
        className={classes.trimmerArea}
        x={Math.min(scaledStartX, scaledEndX)}
        y={y1}
        width={Math.abs(scaledEndX - scaledStartX)}
        height={y2}
      />
      <TrimHandle
        x={scaledStartX}
        dateString={dateFormat(startX)}
        label="Date from"
        height={height}
        onMouseEnter={() => setTrimMode({ variant: 'trim hover start', otherX: endX })}
        onMouseLeave={() => setTrimMode({ variant: 'none' })}
      />
      <TrimHandle
        x={scaledEndX}
        dateString={dateFormat(endX)}
        label="Date to"
        height={height}
        onMouseEnter={() => setTrimMode({ variant: 'trim hover end', otherX: startX })}
        onMouseLeave={() => setTrimMode({ variant: 'none' })}
      />
    </g>
  )
}
