import * as React from 'react'
import { Marks } from './Marks'
import { ScaleLinear } from 'd3-scale'
import { EventComponentFactory, TimelineEvent } from './model'
import { Axis } from './Axis'

interface Props<EID extends string, LID extends string, E extends TimelineEvent<EID, LID>> {
  mouseCursor: React.ReactNode
  height: number
  events: ReadonlyArray<E>
  timeScale: ScaleLinear<number, number>
  eventMarkerHeight?: number
  eventComponent?: EventComponentFactory<EID, LID, E>
  onEventHover?: (eventId: EID) => void
  onEventUnhover?: (eventId: EID) => void
  onEventClick?: (eventId: EID) => void
  tooltipArrow?: boolean
}

export const CollapsedMarks = <EID extends string, LID extends string, E extends TimelineEvent<EID, LID>>(
  props: Props<EID, LID, E>
) => {
  const {
    mouseCursor,
    height,
    events,
    timeScale,
    eventComponent,
    onEventHover,
    onEventUnhover,
    onEventClick,
    tooltipArrow,
  } = props
  const y = height / 2

  return (
    <g>
      <Axis y={y} />
      {mouseCursor}
      {
        <Marks
          height={height}
          events={events}
          timeScale={timeScale}
          y={y}
          eventComponent={eventComponent}
          onEventHover={onEventHover}
          onEventUnhover={onEventUnhover}
          onEventClick={onEventClick}
          tooltipArrow={tooltipArrow}
        />
      }
    </g>
  )
}
