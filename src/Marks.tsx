import * as React from 'react'
import { useMemo, useRef } from 'react'
import { defaultEventColor, noOp, selectionColor, selectionColorOpaque } from './shared'
import { ScaleLinear, scaleLinear } from 'd3-scale'
import { Theme } from '@material-ui/core'
import { EventComponentFactory, EventComponentRole, TimelineEvent } from './model'
import { Tooltip } from 'react-svg-tooltip'
import makeStyles from '@material-ui/core/styles/makeStyles'
import useTheme from '@material-ui/core/styles/useTheme'
import TextSize from './TextSize'

const useStyles = makeStyles((theme: Theme) => ({
  eventBackground: {
    strokeWidth: 0,
    fill: theme.palette.background.paper,
  },
  eventRect: {
    stroke: theme.palette.background.paper,
    strokeWidth: 2,
    fillOpacity: 0.5,
  },
  eventCircle: {
    stroke: theme.palette.background.paper,
    strokeWidth: 2,
    fillOpacity: 0.5,
  },
  selectedEvent: {
    stroke: selectionColorOpaque,
    strokeWidth: 2,
    fill: selectionColor,
  },
}))

export interface Props<EID, LID> {
  height: number
  events: ReadonlyArray<TimelineEvent<EID, LID>>
  timeScale: ScaleLinear<number, number>
  y: number
  eventMarkerHeight?: number
  eventComponent?: EventComponentFactory<EID, LID>
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
export const Marks = <EID extends string, LID extends string>(props: Props<EID, LID>) => {
  const { events, height } = props
  const classes = useStyles()
  const { eventComponent, timeScale, y } = props

  // shorter periods on top of longer ones
  const sortByEventDuration = (e: TimelineEvent<EID, LID>) =>
    -(e.endTimeMillis ? e.endTimeMillis - e.startTimeMillis : 0)

  const defaultEventComponent = (e: TimelineEvent<EID, LID>, role: EventComponentRole) => {
    if (role === 'background') {
      // opaque background to prevent axis-/grid-lines from shining through
      return <DefaultEventMark e={e} className={classes.eventBackground} {...props} />
    } else if (e.isSelected) {
      return <DefaultEventMark e={e} className={classes.selectedEvent} {...props} />
    } else {
      if (e.endTimeMillis) {
        return <DefaultEventMark e={e} className={classes.eventRect} {...props} />
      } else {
        return <DefaultEventMark e={e} className={classes.eventCircle} {...props} />
      }
    }
  }

  const eventComponentFactory = eventComponent || defaultEventComponent

  // string-based deep-comparisons to determine whether marks should be re-rendered
  const comparableEvents = JSON.stringify(events)
  const comparableTimeScale = JSON.stringify({ domain: timeScale.domain(), range: timeScale.range() })

  // ignoring `isSelected` for background/foreground marks (selectionMarks are rendered specifically)
  const comparableEventsIgnoringSelection = JSON.stringify(events, (key, value) => {
    if (key == 'isSelected') return undefined
    return value
  })

  const backgroundMarks = useMemo(
    () =>
      events.map((e: TimelineEvent<EID, LID>) => (
        <InteractiveEventMark key={e.eventId} event={e} {...props}>
          {eventComponentFactory(e, 'background', timeScale, y)}
        </InteractiveEventMark>
      )),
    [comparableEventsIgnoringSelection, comparableTimeScale, height]
  )

  const foregroundMarks = useMemo(
    () =>
      events
        .filter((_) => true)
        .sort(sortByEventDuration)
        .map((e: TimelineEvent<EID, LID>) => (
          <InteractiveEventMark key={e.eventId} event={e} {...props}>
            {eventComponentFactory(e, 'foreground', timeScale, y)}
          </InteractiveEventMark>
        )),
    [comparableEventsIgnoringSelection, comparableTimeScale, height]
  )

  const selectionMarks = useMemo(
    () =>
      events
        .filter((e) => e.isSelected)
        .sort(sortByEventDuration)
        .map((e: TimelineEvent<EID, LID>) => (
          <InteractiveEventMark key={e.eventId} event={e} {...props}>
            {eventComponentFactory(e, 'foreground', timeScale, y)}
          </InteractiveEventMark>
        )),
    [comparableEvents, comparableTimeScale, height]
  )

  return (
    <g>
      {backgroundMarks}
      {foregroundMarks}
      {selectionMarks}
    </g>
  )
}

interface InteractiveGroupProps<EID, LID> {
  event: TimelineEvent<EID, LID>
  timeScale: ScaleLinear<number, number>
  y: number
  onEventHover?: (eventId: EID) => void
  onEventUnhover?: (eventId: EID) => void
  onEventClick?: (eventId: EID) => void
  children: React.ReactNode
}

const InteractiveEventMark = <EID, LID>({
  event,
  y,
  timeScale,
  onEventClick = noOp,
  onEventHover = noOp,
  onEventUnhover = noOp,
  children,
}: InteractiveGroupProps<EID, LID>) => {
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

interface DefaultEventMarkProps<EID, LID> extends Omit<Props<EID, LID>, 'events'> {
  e: TimelineEvent<EID, LID>
  className: string
  eventMarkerHeight?: number
}

const DefaultEventMark = <EID, LID>({
  e,
  eventMarkerHeight = 20,
  className,
  y,
  timeScale,
}: DefaultEventMarkProps<EID, LID>) => {
  const theme: Theme = useTheme()
  const startX = timeScale(e.startTimeMillis)!
  const strokeColor = e.isPinned ? (theme.palette.type === 'dark' ? 'white' : 'black') : undefined
  if (e.endTimeMillis === undefined) {
    return (
      <circle
        cx={startX}
        cy={y}
        r={eventMarkerHeight / 2}
        className={className}
        fill={e.color || defaultEventColor}
        style={{ stroke: strokeColor }}
      />
    )
  } else {
    const endX = timeScale(e.endTimeMillis)!
    const width = endX - startX
    return (
      <rect
        x={startX}
        y={y - eventMarkerHeight / 2}
        width={width}
        height={eventMarkerHeight}
        className={className}
        fill={e.color || defaultEventColor}
        style={{ stroke: strokeColor }}
      />
    )
  }
}

const TOOLTIP_FONT_SIZE = 14

const useTooltipStyle = makeStyles((theme: Theme) => ({
  svg: {
    textAlign: 'left',
  },
  background: {
    fill: theme.palette.text.secondary,
    strokeWidth: 0,
  },
  text: {
    fill: 'white',
    dominantBaseline: 'middle',
    textAnchor: 'middle',
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: TOOLTIP_FONT_SIZE,
  },
}))

interface EventTooltipProps {
  type: { singleEventX: number } | 'period'
  y: number
  parentWidth: number
  text: string
  triggerRef: React.RefObject<SVGElement>
}

/**
 * Calculates the `width` and `height` of the passed tooltip text.
 */
const getTooltipDimensions = (inputText: string) => {
  const text = inputText || ''
  const textLines = text.split('\n')
  const numLinesInText = textLines.length
  const isMultiLineText = numLinesInText > 1
  const horizontalPadding = 15
  const verticalPadding = 5

  let width = 0

  // Calculate required width from the passed text.
  if (isMultiLineText) {
    let maxWidth = 0
    textLines.forEach((textLine) => {
      const textLineWidth = TextSize.getTextWidth(textLine, TOOLTIP_FONT_SIZE)
      maxWidth = Math.max(textLineWidth, maxWidth)
    })
    width = maxWidth + horizontalPadding * 2
  } else {
    width = TextSize.getTextWidth(text, TOOLTIP_FONT_SIZE) + horizontalPadding * 2
  }

  const singleLineHeight = 30
  const tooltipHeight = (isMultiLineText ? 20 * numLinesInText : singleLineHeight) + verticalPadding

  return {
    textLines: textLines,
    tooltipWidth: width,
    tooltipHeight: tooltipHeight,
    baseHeight: singleLineHeight,
  }
}

interface TooltipTextProps {
  textLines: string[]
  className: string
  tooltipWidth: number
  tooltipHeight: number
}

const TooltipText = ({ textLines, className, tooltipWidth, tooltipHeight }: TooltipTextProps) => {
  return (
    <text className={className} width={tooltipWidth} height={tooltipHeight}>
      {textLines.map((textLine, index) => {
        return (
          <tspan dy="1.2em" x="10" key={index} textAnchor="start">
            {textLine}
          </tspan>
        )
      })}
    </text>
  )
}

const EventTooltip = ({ type, y, parentWidth, text, triggerRef }: EventTooltipProps) => {
  const classes = useTooltipStyle()

  const { textLines, tooltipWidth, tooltipHeight, baseHeight } = getTooltipDimensions(text)

  return (
    <Tooltip triggerRef={triggerRef}>
      {(xOffset, yOffset) => {
        // tooltip follows the mouse, these offsets can be used to counteract this behavior

        // single events: tooltip does NOT follow the mouse (to have a less jumpy user experience)
        // event periods: tooltip does follow the mouse (because rectangular periods can easily get off screen)
        const tooltipX = type === 'period' ? 0 : type.singleEventX - xOffset

        const tooltipYPadding = 12
        const tooltipY = y - yOffset - tooltipHeight - tooltipYPadding // don't follow mouse
        const baseY = y - yOffset - baseHeight - tooltipYPadding

        // determines how the rectangular tooltip area is offset to the left/right of the arrow
        // the closer to the left edge, the more the rect is shifted to the right (same for right edge)
        const safetyMargin = 15
        const tooltipOffset = scaleLinear()
          .domain([0, parentWidth])
          .range([safetyMargin, tooltipWidth - safetyMargin])

        const arrowDimension = 20

        const svgX = tooltipX - tooltipOffset(xOffset)!
        const svgY = tooltipY - arrowDimension / 2

        return (
          <g>
            <svg x={svgX} y={svgY} width={tooltipWidth} height={tooltipHeight} className={classes.svg}>
              <rect width="100%" height="100%" rx={3} ry={3} className={classes.background} />
              <TooltipText
                textLines={textLines}
                tooltipHeight={tooltipHeight}
                tooltipWidth={tooltipWidth}
                className={classes.text}
              />
            </svg>
            <ArrowDown tipX={tooltipX} baseY={baseY} dimension={arrowDimension} className={classes.background} />)
          </g>
        )
      }}
    </Tooltip>
  )
}

interface ArrowDownProps {
  tipX: number
  baseY: number
  dimension: number
  className: string
}

const ArrowDown = ({ tipX, baseY, dimension, className }: ArrowDownProps) => {
  return (
    <svg
      x={tipX - dimension / 2}
      y={baseY + dimension / 2 + 5} // the triangle is only of height 5
      viewBox={`0 0 10 10`} // path is expressed for a 10x10 square
      width={dimension}
      height={dimension}
    >
      <path className={className} d={`M0 2.5 l 5 5 5-5z`} />
    </svg>
  )
}
