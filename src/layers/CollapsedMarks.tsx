import * as React from 'react'
import { Marks } from './Marks'
import { ScaleLinear } from 'd3-scale'
import { EventComponentFactory, TimelineEvent } from '../model'

interface Props<EID extends string, LID extends string, E extends TimelineEvent<EID, LID>> {
  height: number
  events: ReadonlyArray<E>
  comparableEvents: string
  timeScale: ScaleLinear<number, number>
  eventMarkerHeight?: number
  eventComponent?: EventComponentFactory<EID, LID, E>
  onEventHover?: (eventId: EID) => void
  onEventUnhover?: (eventId: EID) => void
  onEventClick?: (eventId: EID) => void
}

export const CollapsedMarks = <EID extends string, LID extends string, E extends TimelineEvent<EID, LID>>({
  height,
  events,
  comparableEvents,
  timeScale,
  eventComponent,
  onEventHover,
  onEventUnhover,
  onEventClick,
}: Props<EID, LID, E>) => {
  const y = height / 2

  return (
    <g>
      <Marks
        height={height}
        events={events}
        comparableEvents={comparableEvents}
        timeScale={timeScale}
        y={y}
        eventComponent={eventComponent}
        onEventHover={onEventHover}
        onEventUnhover={onEventUnhover}
        onEventClick={onEventClick}
      />
    </g>
  )
}
