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
import { TimelineLayer } from '.'

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
  layers?: ReadonlyArray<TimelineLayer>
  theme?: TimelineTheme
  onEventHover?: (eventId: EID) => void
  onEventUnhover?: (eventId: EID) => void
  onEventClick?: (eventId: EID) => void
  onZoomRangeChange?: (startMillis: number, endMillis: number) => void
  onCursorMove?: (millisAtCursor?: number, startMillis?: number, endMillis?: number) => void
  onTrimRangeChange?: (startMillis: number, endMillis: number) => void
  onInteractionEnd?: () => void
  tooltipArrow?: boolean
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
  isTrimming = false,
  trimRange,
  layers = ['grid', 'axes', 'interaction', 'marks'],
  theme,
  onEventHover = noOp,
  onEventUnhover = noOp,
  onEventClick,
  onZoomRangeChange,
  onCursorMove,
  onTrimRangeChange,
  onInteractionEnd,
  tooltipArrow = true,
}: TimelineProps<EID, LID, E>) => {
  {
    const {
      domain,
      setDomain,
      maxDomain,
      maxDomainStart,
      maxDomainEnd,
      currentZoomScale,
      nextSmallerZoomScale,
      timeScale,
      yScale,
    } = useTimeline({ width, height, events, lanes, zoomLevels, customRange, onZoomRangeChange })

    const { isAnimationInProgress, setAnimation } = useTimelineAnimation({ maxDomainStart, maxDomainEnd, setDomain })

    const {
      eventsInsideDomain,
      eventClustersInsideDomain,
      isNoEventSelected,
      isMouseOverEvent,
      onEventHoverDecorated,
      onEventUnhoverDecorated,
    } = useEvents(
      events,
      domain,
      currentZoomScale,
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

    const layerById = {
      grid: (
        <GridLines
          key="grid"
          height={height}
          domain={domain}
          smallerZoomScale={nextSmallerZoomScale}
          timeScale={timeScale}
        />
      ),
      axes:
        laneDisplayMode === 'expanded' ? (
          <Axes key="axes" lanes={lanes} yScale={yScale} />
        ) : (
          <Axis key="axis" y={height / 2} />
        ),
      interaction: (
        <Interaction
          key="interaction"
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
      ),
      marks: showMarks && (
        <g key="marks">
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
              tooltipArrow={tooltipArrow}
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
              tooltipArrow={tooltipArrow}
            />
          )}
        </g>
      ),
    }

    return (
      <TimelineThemeProvider theme={theme}>
        <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
          {
            // TODO: Support custom layers
            layers.map((layer) => layerById[layer])
          }
        </svg>
      </TimelineThemeProvider>
    )
  }
}
