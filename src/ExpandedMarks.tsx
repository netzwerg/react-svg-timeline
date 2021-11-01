import * as React from 'react'
import { Marks } from './Marks'
import { ScaleBand, ScaleLinear } from 'd3-scale'
import { Theme } from '@material-ui/core'
import { EventComponentFactory, TimelineEvent, TimelineLane } from './model'
import { Axis } from './Axis'
import { defaultLaneColor } from './shared'
import makeStyles from '@material-ui/core/styles/makeStyles'

const LANE_LABEL_FONT_SIZE = '16px'
const useStyles = makeStyles((theme: Theme) => ({
  conceptLabel: {
    fontSize: LANE_LABEL_FONT_SIZE,
    fontFamily: theme.typography.fontFamily,
    fontWeight: 600,
    opacity: 0.4,
  },
}))

interface Props<EID extends string, LID extends string, E extends TimelineEvent<EID, LID>> {
  mouseCursor: React.ReactNode
  height: number
  events: ReadonlyArray<E>
  eventMarkerHeight?: number
  lanes: ReadonlyArray<TimelineLane<LID>>
  timeScale: ScaleLinear<number, number>
  yScale: ScaleBand<LID>
  eventComponent?: EventComponentFactory<EID, LID, E>
  onEventHover?: (eventId: EID) => void
  onEventUnhover?: (eventId: EID) => void
  onEventClick?: (eventId: EID) => void
  tooltipArrow?: boolean
}

export const ExpandedMarks = <EID extends string, LID extends string, E extends TimelineEvent<EID, LID>>({
  mouseCursor,
  height,
  events,
  lanes,
  timeScale,
  yScale,
  eventComponent,
  onEventHover,
  onEventUnhover,
  onEventClick,
  tooltipArrow,
}: Props<EID, LID, E>) => {
  const classes = useStyles()
  const fontSize = 0.8 * yScale.bandwidth()

  const axes = lanes.map((lane: TimelineLane<LID>) => {
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
  })

  const marks = lanes.map((lane: TimelineLane<LID>) => {
    const laneSpecificEvents = events.filter((e) => e.laneId === lane.laneId)
    return (
      <g key={`marks-${lane.laneId}`}>
        <Marks
          height={height}
          events={laneSpecificEvents}
          timeScale={timeScale}
          y={yScale(lane.laneId)!}
          eventComponent={eventComponent}
          onEventHover={onEventHover}
          onEventUnhover={onEventUnhover}
          onEventClick={onEventClick}
          tooltipArrow={tooltipArrow}
        />
      </g>
    )
  })

  return (
    <g>
      {axes}
      {mouseCursor}
      {marks}
    </g>
  )
}
