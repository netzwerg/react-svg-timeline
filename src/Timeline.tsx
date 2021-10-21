import React, { useCallback, useEffect, useState } from 'react'
import { Domain, EventComponentFactory, LaneDisplayMode, TimelineEvent, TimelineLane } from './model'
import { defaultOrderedZoomLevels, ZoomLevels } from './shared/ZoomScale'
import { scaleBand, scaleLinear } from 'd3-scale'
import { GridLines } from './layers/GridLines'
import { ExpandedMarks } from './layers/ExpandedMarks'
import { InteractionLayer } from './layers/interaction'
import { noOp } from './utils'
import { CollapsedMarks } from './layers/CollapsedMarks'
import { useEvents } from './hooks'
import { EventClusters } from './layers/EventClusters'
import { TimelineTheme } from './theme'
import { TimelineThemeProvider } from './theme/TimelineThemeProvider'
import { useZoomLevels } from './hooks/useZoomLevels'
import { Axes } from './layers/Axes'
import { Axis } from './layers/Axis'

export interface TimelineProps<EID extends string, LID extends string, E extends TimelineEvent<EID, LID>> {
  width: number
  height: number
  events: ReadonlyArray<E>
  lanes: ReadonlyArray<TimelineLane<LID>>
  dateFormat: (ms: number) => string
  eventComponent?: EventComponentFactory<EID, LID, E>
  laneDisplayMode?: LaneDisplayMode
  suppressMarkAnimation?: boolean
  enableEventClustering?: boolean
  customRange?: Domain
  zoomLevels?: ReadonlyArray<ZoomLevels>
  isTrimming?: boolean
  trimRange?: Domain
  theme?: TimelineTheme
  onEventHover?: (eventId: EID) => void
  onEventUnhover?: (eventId: EID) => void
  onEventClick?: (eventId: EID) => void
  onZoomRangeChange?: (startMillis: number, endMillis: number) => void
  onCursorMove?: (millisAtCursor?: number, startMillis?: number, endMillis?: number) => void
  onTrimRangeChange?: (startMillis: number, endMillis: number) => void
  onInteractionEnd?: () => void
}

type Animation =
  | 'none'
  | Readonly<{
      startMs: number
      fromDomain: Domain
      toDomain: Domain
    }>

export const calcMaxDomain = <EID extends string, LID extends string, E extends TimelineEvent<EID, LID>>(
  events: ReadonlyArray<E>
): Domain => {
  const timeMin = Math.min(...events.map((e) => e.startTimeMillis))
  const timeMax = Math.max(...events.map((e) => (e.endTimeMillis === undefined ? e.startTimeMillis : e.endTimeMillis)))
  return [timeMin || NaN, timeMax || NaN]
}

const animationDuration = 1000

export const Timeline = <EID extends string, LID extends string, E extends TimelineEvent<EID, LID>>({
  width,
  height,
  events,
  lanes,
  dateFormat,
  eventComponent,
  laneDisplayMode = 'expanded',
  suppressMarkAnimation = false,
  enableEventClustering = false,
  customRange,
  zoomLevels = defaultOrderedZoomLevels,
  theme,
  onEventHover = noOp,
  onEventUnhover = noOp,
  onEventClick,
  onZoomRangeChange,
  onCursorMove,
  isTrimming = false,
  trimRange,
  onTrimRangeChange,
  onInteractionEnd,
}: TimelineProps<EID, LID, E>) => {
  {
    const maxDomain = customRange ?? calcMaxDomain(events)
    const maxDomainStart = maxDomain[0]
    const maxDomainEnd = maxDomain[1]

    const [domain, setDomain] = useState<Domain>(maxDomain) // TODO --> onRangeChange-Event when domain changes?
    const [animation, setAnimation] = useState<Animation>('none')
    const [isMouseOverEvent, setIsMouseOverEvent] = useState(false)

    const [zoomScale, smallerZoomScale] = useZoomLevels(domain, zoomLevels)

    const now = Date.now()

    useEffect(() => {
      setAnimation('none')
      setDomain([maxDomainStart, maxDomainEnd])
    }, [maxDomainStart, maxDomainEnd])

    useEffect(() => {
      if (onZoomRangeChange) {
        onZoomRangeChange(...domain)
      }
    }, [domain, onZoomRangeChange])

    useEffect(() => {
      if (animation !== 'none') {
        const elapsed = now - animation.startMs
        if (elapsed < animationDuration) {
          const t = elapsed / animationDuration
          const deltaStart = t * (animation.toDomain[0] - animation.fromDomain[0])
          const deltaEnd = t * (animation.toDomain[1] - animation.fromDomain[1])

          const animatedDomain: Domain = [animation.fromDomain[0] + deltaStart, animation.fromDomain[1] + deltaEnd]
          requestAnimationFrame(() => {
            setDomain(animatedDomain)
            if (animatedDomain[0] === animation.toDomain[0] && animatedDomain[1] === animation.toDomain[1]) {
              setAnimation('none')
            }
          })
        } else {
          setDomain(animation.toDomain)
          setAnimation('none')
        }
      }
    }, [animation, now])

    const [eventsInsideDomain, eventClustersInsideDomain] = useEvents(
      events,
      domain,
      zoomScale,
      laneDisplayMode === 'expanded',
      enableEventClustering
    )

    const isNoEventSelected = eventsInsideDomain.filter((e) => e.isSelected).length === 0

    const isAnimationInProgress = animation !== 'none'

    const showMarks = suppressMarkAnimation ? !isAnimationInProgress : true

    const timeScalePadding = 50
    const timeScale = scaleLinear()
      .domain(domain)
      .range([timeScalePadding, width - timeScalePadding])

    const yScale = scaleBand()
      .domain(lanes.map((l) => l.laneId))
      .range([0, height])
      .paddingInner(0.3)
      .paddingOuter(0.8)

    const onEventHoverDecorated = (eventId: EID) => {
      setIsMouseOverEvent(true)
      onEventHover(eventId)
    }

    const onEventUnhoverDecorated = (eventId: EID) => {
      setIsMouseOverEvent(false)
      onEventUnhover(eventId)
    }

    const handleDomainChange = useCallback(
      (newDomain: Domain, animated: boolean) => {
        if (animated) {
          setAnimation({ startMs: Date.now(), fromDomain: domain, toDomain: newDomain })
        } else {
          setDomain(newDomain)
        }
      },
      [domain]
    )

    return (
      <TimelineThemeProvider theme={theme}>
        <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
          <GridLines height={height} domain={domain} smallerZoomScale={smallerZoomScale} timeScale={timeScale} />
          {laneDisplayMode === 'expanded' ? <Axes lanes={lanes} yScale={yScale} /> : <Axis y={height / 2} />}
          <InteractionLayer
            width={width}
            height={height}
            domain={domain}
            maxDomain={maxDomain}
            maxDomainStart={maxDomainStart}
            maxDomainEnd={maxDomainEnd}
            isDomainChangePossible={!isAnimationInProgress && !isMouseOverEvent}
            timeScale={timeScale}
            zoomLevels={zoomLevels}
            isTrimming={isTrimming}
            trimRange={trimRange}
            isAnimationInProgress={isAnimationInProgress}
            isNoEventSelected={isNoEventSelected}
            onDomainChange={handleDomainChange}
            dateFormat={dateFormat}
            onCursorMove={onCursorMove}
            onInteractionEnd={onInteractionEnd}
            onTrimRangeChange={onTrimRangeChange}
          />
          <g>
            {showMarks && (
              <g>
                <EventClusters
                  height={height}
                  eventClusters={eventClustersInsideDomain}
                  timeScale={timeScale}
                  yScale={yScale}
                  expanded={laneDisplayMode === 'expanded'}
                />
                {laneDisplayMode === 'expanded' ? (
                  <ExpandedMarks
                    events={eventsInsideDomain}
                    lanes={lanes}
                    timeScale={timeScale}
                    yScale={yScale}
                    height={height}
                    eventComponent={eventComponent}
                    onEventHover={onEventHoverDecorated}
                    onEventUnhover={onEventUnhoverDecorated}
                    onEventClick={onEventClick}
                  />
                ) : (
                  <CollapsedMarks
                    events={eventsInsideDomain}
                    timeScale={timeScale}
                    height={height}
                    eventComponent={eventComponent}
                    onEventHover={onEventHoverDecorated}
                    onEventUnhover={onEventUnhoverDecorated}
                    onEventClick={onEventClick}
                  />
                )}
              </g>
            )}
          </g>
        </svg>
      </TimelineThemeProvider>
    )
  }
}
