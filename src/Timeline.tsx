import React, { useCallback } from 'react'

import { Domain, EventComponentFactory, LaneDisplayMode, TimelineEvent, TimelineLane } from './model'

import { TimelineTheme } from './theme'
import { TimelineThemeProvider } from './theme/TimelineThemeProvider'

import { useEvents, useTimeline, useTimelineAnimation } from './hooks'

import { noOp } from './utils'

import { defaultOrderedZoomLevels, ZoomLevels } from './shared/ZoomScale'

import { GridLines } from './layers/GridLines'
import { ExpandedMarks } from './layers/ExpandedMarks'
import { Interaction } from './layers/interaction'
import { CollapsedMarks } from './layers/CollapsedMarks'
import { EventClusters } from './layers/EventClusters'
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
    const [
      domain,
      setDomain,
      maxDomain,
      maxDomainStart,
      maxDomainEnd,
      zoomScale,
      smallerZoomScale,
      timeScale,
      yScale,
    ] = useTimeline({ width, height, events, lanes, zoomLevels, customRange, onZoomRangeChange })

    const [isAnimationInProgress, setAnimation] = useTimelineAnimation({ maxDomainStart, maxDomainEnd, setDomain })

    const [
      eventsInsideDomain,
      eventClustersInsideDomain,
      isNoEventSelected,
      isMouseOverEvent,
      onEventHoverDecorated,
      onEventUnhoverDecorated,
    ] = useEvents(
      events,
      domain,
      zoomScale,
      laneDisplayMode === 'expanded',
      enableEventClustering,
      onEventHover,
      onEventUnhover
    )

    const showMarks = suppressMarkAnimation ? !isAnimationInProgress : true

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
          <Interaction
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
