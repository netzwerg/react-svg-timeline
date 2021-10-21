import React from 'react'
import { ScaleBand } from 'd3-scale'
import { makeStyles, Theme } from '@material-ui/core'
import { TimelineLane } from '../model'
import { Axis } from './Axis'
import { defaultLaneColor } from '../shared'

const LANE_LABEL_FONT_SIZE = '16px'
const useStyles = makeStyles((theme: Theme) => ({
  conceptLabel: {
    fontSize: LANE_LABEL_FONT_SIZE,
    fontFamily: theme.typography.fontFamily,
    fontWeight: 600,
    opacity: 0.4,
  },
}))

export interface AxesProps<LID extends string> {
  lanes: ReadonlyArray<TimelineLane<LID>>
  yScale: ScaleBand<LID>
}

export const Axes = <LID extends string>({ lanes, yScale }: AxesProps<LID>) => {
  const classes = useStyles()
  const fontSize = 0.8 * yScale.bandwidth()

  return (
    <>
      {lanes.map((lane: TimelineLane<LID>) => {
        const labelXOffset = 10
        const labelYOffset = -0.5 * yScale.bandwidth()
        const y = yScale(lane.laneId)!
        return (
          <g key={`axis-${lane.laneId}`}>
            <Axis y={y} />
            <text
              className={classes.conceptLabel}
              fontSize={fontSize}
              x={labelXOffset}
              y={y + labelYOffset}
              fill={lane.color || defaultLaneColor}
            >
              {lane.label}
            </text>
          </g>
        )
      })}
    </>
  )
}
