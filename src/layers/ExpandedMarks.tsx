import * as React from 'react'
import { Marks } from './Marks'
import { ScaleBand, ScaleLinear } from 'd3-scale'
import { EventComponentFactory, TimelineEvent, TimelineLane } from '../model'

interface Props<EID extends string, LID extends string, E extends TimelineEvent<EID, LID>> {
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

  return <g>{marks}</g>
}
