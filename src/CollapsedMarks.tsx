import * as React from 'react'
import { Marks } from './Marks'
import { ScaleLinear } from 'd3-scale'
import { EventComponentFactory, TimelineEvent } from './model'
import { Axis } from './Axis'

interface Props<EID, LID> {
  mouseCursor: React.ReactNode
  height: number
  events: ReadonlyArray<TimelineEvent<EID, LID>>
  timeScale: ScaleLinear<number, number>
  eventMarkerHeight?: number
  eventComponent?: EventComponentFactory<EID, LID>
  onEventHover?: (eventId: EID) => void
  onEventUnhover?: (eventId: EID) => void
  onEventClick?: (eventId: EID) => void
}

export const CollapsedMarks = <EID extends string, LID extends string>({
  mouseCursor,
  height,
  events,
  timeScale,
  eventComponent,
  onEventHover,
  onEventUnhover,
  onEventClick
}: Props<EID, LID>) => {
  const y = height / 2

  const marks = events.map(e => {
    return (
      <g key={`marks-${e.eventId}`}>
        <Marks
          events={events}
          timeScale={timeScale}
          y={y}
          eventComponent={eventComponent}
          onEventHover={onEventHover}
          onEventUnhover={onEventUnhover}
          onEventClick={onEventClick}
        />
      </g>
    )
  })

  return (
    <g>
      <Axis y={y} />
      {mouseCursor}
      {marks}
    </g>
  )
}
