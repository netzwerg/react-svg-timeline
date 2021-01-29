import React from 'react'
import { makeStyles, Theme } from '@material-ui/core'
import { orange } from '@material-ui/core/colors'
import { ScaleLinear } from 'd3-scale'
import { TrimHover, TrimNone } from './InteractionHandling'

const useStyles = makeStyles((theme: Theme) => ({
  cursor: {
    stroke: orange.A200,
    strokeWidth: 6,
  },
  label: {
    fill: orange.A200,
    textAnchor: 'middle',
    dominantBaseline: 'middle',
    fontFamily: theme.typography.caption.fontFamily,
    cursor: 'default',
  },
  zoomRange: {
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
}

function Trimmer({ startX, endX, timeScale, height, setTrimMode }: Props) {
  const classes = useStyles()

  const [y1, y2] = [0, height]
  const [scaledStartX, scaledEndX] = [timeScale(startX)!, timeScale(endX)!]

  return (
    <g>
      <line
        className={classes.cursor}
        x1={scaledStartX}
        y1={y1}
        x2={scaledStartX}
        y2={y2}
        onMouseEnter={() => setTrimMode({ variant: 'trim hover start', otherX: endX })}
        onMouseLeave={() => setTrimMode({ variant: 'none' })}
      />
      <line
        className={classes.cursor}
        x1={scaledEndX}
        y1={y1}
        x2={scaledEndX}
        y2={y2}
        onMouseEnter={() => setTrimMode({ variant: 'trim hover end', otherX: startX })}
        onMouseLeave={() => setTrimMode({ variant: 'none' })}
      />
      <rect
        className={classes.zoomRange}
        x={Math.min(scaledStartX, scaledEndX)}
        y={y1}
        width={Math.abs(scaledEndX - scaledStartX)}
        height={y2}
      />
    </g>
  )
}

export default Trimmer
