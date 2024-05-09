import * as React from 'react'
import { useMemo, useRef } from 'react'
import { noOp } from '../utils'
import { ScaleLinear } from 'd3-scale'
import { EventComponentFactory, EventComponentRole, TimelineEvent } from '../model'
import { EventTooltip } from '../tooltip/EventTooltip'
import { useTimelineTheme } from '../theme/useTimelineTheme'

const useEventBackgroundStyle = () => {
  const theme = useTimelineTheme().base
  return {
    strokeWidth: 0,
    fill: theme.backgroundColor,
  }
}

const useEventCircleStyle = () => {
  const theme = useTimelineTheme()
  return {
    stroke: theme.event.markLineColor,
    strokeWidth: theme.event.markLineWidth,
    strokeOpacity: theme.event.markOpacity,
    fillOpacity: theme.event.markOpacity,
  }
}

const useEventPeriodStyle = () => {
  const theme = useTimelineTheme()
  return {
    stroke: theme.event.markLineColor,
    strokeWidth: theme.event.markLineWidth,
    strokeOpacity: theme.event.markOpacity,
    fillOpacity: theme.event.markOpacity,
  }
}

const useEventSelectedStyle = () => {
  const theme = useTimelineTheme().event
  return {
    stroke: theme.markSelectedLineColor,
    strokeWidth: theme.markLineWidth,
    fill: theme.markSelectedFillColor,
  }
}

export interface Props<EID extends string, LID extends string, E extends TimelineEvent<EID, LID>> {
  height: number
  events: ReadonlyArray<E>
  timeScale: ScaleLinear<number, number>
  y: number
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
  const theme = useTimelineTheme()
  const { events, height } = props
  const eventBackgroundStyle = useEventBackgroundStyle()
  const eventPeriodStyle = useEventPeriodStyle()
  const eventCircleStyle = useEventCircleStyle()
  const eventSelectedStyle = useEventSelectedStyle()
  const { eventComponent, timeScale, y } = props
  const defaultEventMarkProps = { ...props, eventMarkHeight: theme.event.markHeight }

  // shorter periods on top of longer ones
  const sortByEventDuration = (e: E) => -(e.endTimeMillis ? e.endTimeMillis - e.startTimeMillis : 0)

  const defaultEventComponent = (e: E, role: EventComponentRole) => {
    if (role === 'background') {
      // opaque background to prevent axis-/grid-lines from shining through
      return <DefaultEventMark e={e} style={eventBackgroundStyle} {...defaultEventMarkProps} />
    } else if (e.isSelected) {
      return <DefaultEventMark e={e} style={eventSelectedStyle} {...defaultEventMarkProps} />
    } else {
      if (e.endTimeMillis) {
        return <DefaultEventMark e={e} style={eventPeriodStyle} {...defaultEventMarkProps} />
      } else {
        return <DefaultEventMark e={e} style={eventCircleStyle} {...defaultEventMarkProps} />
      }
    }
  }

  const eventComponentFactory = eventComponent || defaultEventComponent

  // string-based deep-comparisons to determine whether marks should be re-rendered
  const comparableTimeScale = JSON.stringify({ domain: timeScale.domain(), range: timeScale.range() })

  // ignoring `isSelected` for background/foreground marks (selectionMarks are rendered specifically)
  const comparableEventsIgnoringSelectionAndPin = JSON.stringify(events, (key, value) => {
    if (key === 'isSelected' || key === 'isPinned') return undefined
    return value
  })

  const backgroundMarks = useMemo(
    () =>
      events.map((e: E) => (
        <InteractiveEventMark key={e.eventId} event={e} {...props}>
          {eventComponentFactory(e, 'background', timeScale, y)}
        </InteractiveEventMark>
      )),
    // TODO: Fix and check if this is still needed
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [comparableEventsIgnoringSelectionAndPin, comparableTimeScale, height, theme]
  )

  const foregroundMarks = useMemo(
    () =>
      events
        .filter((_) => true)
        .sort(sortByEventDuration)
        .map((e: E) => (
          <InteractiveEventMark key={e.eventId} event={e} {...props}>
            {eventComponentFactory(e, 'foreground', timeScale, y)}
          </InteractiveEventMark>
        )),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [comparableEventsIgnoringSelectionAndPin, comparableTimeScale, height, theme]
  )

  const selectionOrPinMarks = useMemo(
    () =>
      events
        .filter((e) => e.isSelected || e.isPinned)
        .sort(sortByEventDuration)
        .map((e: E) => (
          <InteractiveEventMark key={e.eventId} event={e} {...props}>
            {eventComponentFactory(e, 'foreground', timeScale, y)}
          </InteractiveEventMark>
        )),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [events, comparableTimeScale, height, theme]
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
  children: React.ReactNode
}

const InteractiveEventMark = <EID extends string, LID extends string, E extends TimelineEvent<EID, LID>>({
  event,
  y,
  timeScale,
  onEventClick = noOp,
  onEventHover = noOp,
  onEventUnhover = noOp,
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
        <EventTooltip type={tooltipType} y={y} parentWidth={parentWidth} triggerRef={triggerRef} text={event.tooltip} />
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
  eventMarkHeight: number
}

const DefaultEventMark = <EID extends string, LID extends string, E extends TimelineEvent<EID, LID>>({
  e,
  eventMarkHeight,
  style,
  y,
  timeScale,
}: DefaultEventMarkProps<EID, LID, E>) => {
  const theme = useTimelineTheme()
  const startX = timeScale(e.startTimeMillis)!
  const pinnedStrokeStyle = e.isPinned ? { stroke: theme.event.markPinnedLineColor } : {}
  if (e.endTimeMillis === undefined) {
    return (
      <circle
        style={{ ...style, ...pinnedStrokeStyle }}
        cx={startX}
        cy={y}
        r={eventMarkHeight / 2}
        fill={e.color ?? theme.event.markFillColor}
      />
    )
  } else {
    const endX = timeScale(e.endTimeMillis)!
    const width = endX - startX
    return (
      <rect
        style={{ ...style, ...pinnedStrokeStyle }}
        x={startX}
        y={y - eventMarkHeight / 2}
        width={width}
        height={eventMarkHeight}
        fill={e.color ?? theme.event.markFillColor}
      />
    )
  }
}
