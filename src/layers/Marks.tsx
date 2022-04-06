import * as React from 'react'
import { useMemo, useRef } from 'react'
import { defaultEventColor, defaultSingleEventMarkHeight, noOp, selectionColor, selectionColorOpaque } from '../utils'
import { ScaleLinear } from 'd3-scale'
import { Theme } from '@material-ui/core'
import { EventComponentFactory, EventComponentRole, TimelineEvent } from '../model'
import useTheme from '@material-ui/core/styles/useTheme'
import { EventTooltip, TooltipClasses, useTooltipStyle } from '../tooltip'
import { useTimelineTheme } from '../theme'

const useEventBackgroundStyle = () => {
  const theme = useTimelineTheme().base
  return {
    strokeWidth: 0,
    fill: theme.backgroundColor,
  }
}

const useEventCircleStyle = () => {
  const theme = useTimelineTheme().base
  return {
    stroke: theme.backgroundColor,
    strokeWidth: 2,
    fillOpacity: 0.5,
  }
}

const useEventPeriodStyle = () => {
  const theme = useTimelineTheme().base
  return {
    stroke: theme.backgroundColor,
    strokeWidth: 2,
    fillOpacity: 0.5,
  }
}

const useEventSelectedStyle = () => {
  return {
    stroke: selectionColorOpaque,
    strokeWidth: 2,
    fill: selectionColor,
  }
}

export interface Props<EID extends string, LID extends string, E extends TimelineEvent<EID, LID>> {
  height: number
  events: ReadonlyArray<E>
  timeScale: ScaleLinear<number, number>
  y: number
  eventMarkerHeight?: number
  eventComponent?: EventComponentFactory<EID, LID, E>
  onEventHover?: (eventId: EID) => void
  onEventUnhover?: (eventId: EID) => void
  onEventClick?: (eventId: EID) => void
}

/**
 * Events are drawn semi-transparently, such that 'event accumulations' become visible.
 *
 * First, all events are drawn in opaque background color (to prevent axis- & grid-lines from shining through
 * semi-transparent events). Next, draw the actual events semi-transparently, in the following drawing order: long event
 * periods first, shorter event periods later, event circles next, selected events last.
 *
 * This (1) assures that short periods or single events lying inside a longer event period are still selectable, and
 * (2) that the selection is always visible.
 */
export const Marks = <EID extends string, LID extends string, E extends TimelineEvent<EID, LID>>(
  props: Props<EID, LID, E>
) => {
  const { events, height } = props
  const timelineTheme = useTimelineTheme()
  const eventBackgroundStyle = useEventBackgroundStyle()
  const eventPeriodStyle = useEventPeriodStyle()
  const eventCircleStyle = useEventCircleStyle()
  const eventSelectedStyle = useEventSelectedStyle()
  const tooltipClasses = useTooltipStyle(timelineTheme.tooltip)
  const { eventComponent, timeScale, y } = props

  // shorter periods on top of longer ones
  const sortByEventDuration = (e: E) => -(e.endTimeMillis ? e.endTimeMillis - e.startTimeMillis : 0)

  const defaultEventComponent = (e: E, role: EventComponentRole) => {
    if (role === 'background') {
      // opaque background to prevent axis-/grid-lines from shining through
      return <DefaultEventMark e={e} style={eventBackgroundStyle} {...props} />
    } else if (e.isSelected) {
      return <DefaultEventMark e={e} style={eventSelectedStyle} {...props} />
    } else {
      if (e.endTimeMillis) {
        return <DefaultEventMark e={e} style={eventPeriodStyle} {...props} />
      } else {
        return <DefaultEventMark e={e} style={eventCircleStyle} {...props} />
      }
    }
  }

  const eventComponentFactory = eventComponent || defaultEventComponent

  // string-based deep-comparisons to determine whether marks should be re-rendered
  const comparableEvents = JSON.stringify(events)
  const comparableTimeScale = JSON.stringify({ domain: timeScale.domain(), range: timeScale.range() })

  // ignoring `isSelected` for background/foreground marks (selectionMarks are rendered specifically)
  const comparableEventsIgnoringSelectionAndPin = JSON.stringify(events, (key, value) => {
    if (key == 'isSelected' || key === 'isPinned') return undefined
    return value
  })

  const backgroundMarks = useMemo(
    () =>
      events.map((e: E) => (
        <InteractiveEventMark key={e.eventId} event={e} tooltipClasses={tooltipClasses} {...props}>
          {eventComponentFactory(e, 'background', timeScale, y)}
        </InteractiveEventMark>
      )),
    [comparableEventsIgnoringSelectionAndPin, comparableTimeScale, height]
  )

  const foregroundMarks = useMemo(
    () =>
      events
        .filter((_) => true)
        .sort(sortByEventDuration)
        .map((e: E) => (
          <InteractiveEventMark key={e.eventId} event={e} tooltipClasses={tooltipClasses} {...props}>
            {eventComponentFactory(e, 'foreground', timeScale, y)}
          </InteractiveEventMark>
        )),
    [comparableEventsIgnoringSelectionAndPin, comparableTimeScale, height]
  )

  const selectionOrPinMarks = useMemo(
    () =>
      events
        .filter((e) => e.isSelected || e.isPinned)
        .sort(sortByEventDuration)
        .map((e: E) => (
          <InteractiveEventMark key={e.eventId} event={e} tooltipClasses={tooltipClasses} {...props}>
            {eventComponentFactory(e, 'foreground', timeScale, y)}
          </InteractiveEventMark>
        )),
    [comparableEvents, comparableTimeScale, height]
  )

  return (
    <g>
      {backgroundMarks}
      {foregroundMarks}
      {selectionOrPinMarks}
    </g>
  )
}

interface InteractiveGroupProps<EID extends string, LID extends string, E extends TimelineEvent<EID, LID>> {
  event: E
  timeScale: ScaleLinear<number, number>
  y: number
  onEventHover?: (eventId: EID) => void
  onEventUnhover?: (eventId: EID) => void
  onEventClick?: (eventId: EID) => void
  tooltipClasses: TooltipClasses
  children: React.ReactNode
}

const InteractiveEventMark = <EID extends string, LID extends string, E extends TimelineEvent<EID, LID>>({
  event,
  y,
  timeScale,
  onEventClick = noOp,
  onEventHover = noOp,
  onEventUnhover = noOp,
  tooltipClasses,
  children,
}: InteractiveGroupProps<EID, LID, E>) => {
  const eventId = event.eventId

  const onMouseEnter = () => onEventHover(eventId)
  const onMouseLeave = () => onEventUnhover(eventId)
  const onMouseClick = () => onEventClick(eventId)

  const startX = timeScale(event.startTimeMillis)!
  const parentWidth = timeScale.range()[1]
  const tooltipType = event.endTimeMillis ? 'period' : { singleEventX: startX }

  const triggerRef = useRef<SVGGElement>(null)

  return (
    <g
      pointerEvents={'bounding-box'}
      cursor={'default'}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onMouseClick}
    >
      <g ref={triggerRef}>{children}</g>
      {event.tooltip ? (
        <EventTooltip
          type={tooltipType}
          y={y}
          parentWidth={parentWidth}
          triggerRef={triggerRef}
          text={event.tooltip}
          classes={tooltipClasses}
        />
      ) : (
        <g />
      )}
    </g>
  )
}

interface DefaultEventMarkProps<EID extends string, LID extends string, E extends TimelineEvent<EID, LID>>
  extends Omit<Props<EID, LID, E>, 'events'> {
  e: E
  style: React.CSSProperties
  eventMarkerHeight?: number
}

const DefaultEventMark = <EID extends string, LID extends string, E extends TimelineEvent<EID, LID>>({
  e,
  eventMarkerHeight = defaultSingleEventMarkHeight,
  style,
  y,
  timeScale,
}: DefaultEventMarkProps<EID, LID, E>) => {
  const theme: Theme = useTheme()
  const startX = timeScale(e.startTimeMillis)!
  const strokeColor = e.isPinned ? (theme.palette.type === 'dark' ? 'white' : 'black') : undefined
  if (e.endTimeMillis === undefined) {
    return (
      <circle
        style={{ ...style, stroke: strokeColor }}
        cx={startX}
        cy={y}
        r={eventMarkerHeight / 2}
        fill={e.color || defaultEventColor}
      />
    )
  } else {
    const endX = timeScale(e.endTimeMillis)!
    const width = endX - startX
    return (
      <rect
        style={{ ...style, stroke: strokeColor }}
        x={startX}
        y={y - eventMarkerHeight / 2}
        width={width}
        height={eventMarkerHeight}
        fill={e.color || defaultEventColor}
      />
    )
  }
}
