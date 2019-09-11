import * as React from 'react'
import { useEffect, useState } from 'react'
import { List as ImmutableList } from 'immutable'
import { Domain, EventComponentFactory, TimelineEvent, TimelineEventId, TimelineLane } from './model'
import { nextBiggerZoomScale, nextSmallerZoomScale, ZoomScale, zoomScaleWidth } from './ZoomScale'
import { scaleLinear } from 'd3-scale'
import { MouseAwareSvg, SvgCoordinates } from './MouseAwareSvg'
import { MouseCursor } from './MouseCursor'
import { GridLines } from './GridLines'
import { ExpandedMarks } from './ExpandedMarks'
import { InteractionHandling } from './InteractionHandling'
import { noOp } from './shared'

export type TimelineProps = Readonly<{
    width: number
    height: number
    events: ImmutableList<TimelineEvent>
    lanes: ImmutableList<TimelineLane>
    dateFormat: (ms: number) => string
    eventComponent?: EventComponentFactory
    onEventHover?: (eventId: TimelineEventId) => void
    onEventUnhover?: (eventId: TimelineEventId) => void
    onEventClick?: (eventId: TimelineEventId) => void
}>

type Animation =
    | 'none'
    | Readonly<{
          startMs: number
          fromDomain: Domain
          toDomain: Domain
      }>

export const calcMaxDomain = (events: ImmutableList<TimelineEvent>): Domain => {
    const timeMin = events.map(e => e.startTimeMillis).min()
    const timeMax = events.map(e => (e.endTimeMillis === undefined ? e.startTimeMillis : e.endTimeMillis)).max()
    return [timeMin || NaN, timeMax || NaN]
}

const animationDuration = 1000

export const Timeline = ({
    width,
    height,
    events,
    lanes,
    dateFormat,
    eventComponent,
    onEventHover = noOp,
    onEventUnhover = noOp,
    onEventClick
}: TimelineProps) => {
    {
        const maxDomain = calcMaxDomain(events)
        const maxDomainStart = maxDomain[0]
        const maxDomainEnd = maxDomain[1]

        const [domain, setDomain] = useState<Domain>(maxDomain)
        const [animation, setAnimation] = useState<Animation>('none')
        const [isMouseOverEvent, setIsMouseOverEvent] = useState(false)

        const now = Date.now()

        useEffect(() => {
            setAnimation('none')
            setDomain([maxDomainStart, maxDomainEnd])
        }, [maxDomainStart, maxDomainEnd])

        useEffect(() => {
            if (animation !== 'none') {
                const elapsed = now - animation.startMs
                if (elapsed < animationDuration) {
                    const t = elapsed / animationDuration
                    const deltaStart = t * (animation.toDomain[0] - animation.fromDomain[0])
                    const deltaEnd = t * (animation.toDomain[1] - animation.fromDomain[1])

                    const animatedDomain: Domain = [
                        animation.fromDomain[0] + deltaStart,
                        animation.fromDomain[1] + deltaEnd
                    ]
                    requestAnimationFrame(() => {
                        setDomain(animatedDomain)
                        if (
                            animatedDomain[0] === animation.toDomain[0] &&
                            animatedDomain[1] === animation.toDomain[1]
                        ) {
                            setAnimation('none')
                        }
                    })
                } else {
                    setDomain(animation.toDomain)
                    setAnimation('none')
                }
            }
        }, [animation, now])

        const isNoEventSelected = events.filter(e => e.isSelected).isEmpty()
        const smallerZoomScale = nextSmallerZoomScale(domain)
        const biggerZoomScale = nextBiggerZoomScale(domain)
        const zoomWidth = zoomScaleWidth(smallerZoomScale)
        const currentDomainWidth = domain[1] - domain[0]
        const maxDomainWidth = maxDomainEnd - maxDomainStart

        const isZoomInPossible = smallerZoomScale !== 'minimum'
        const isZoomOutPossible = currentDomainWidth < maxDomainWidth
        const isAnimationInProgress = animation !== 'none'
        const isDomainChangePossible = !isAnimationInProgress && !isMouseOverEvent

        return (
            <MouseAwareSvg width={width} height={height}>
                {(mousePosition: SvgCoordinates) => {
                    const timeScalePadding = 50
                    const timeScale = scaleLinear()
                        .domain(domain)
                        .range([timeScalePadding, width - timeScalePadding])

                    const timeAtCursor = timeScale.invert(mousePosition.x)

                    const setDomainAnimated = (newDomain: Domain) =>
                        setAnimation({ startMs: Date.now(), fromDomain: domain, toDomain: newDomain })

                    const updateDomain = (zoomScale: ZoomScale) => () => {
                        if (isDomainChangePossible) {
                            const newZoomWidth = zoomScaleWidth(zoomScale)
                            const newMin = Math.max(maxDomainStart, timeAtCursor - newZoomWidth / 2)
                            const newMax = Math.min(maxDomainEnd, timeAtCursor + newZoomWidth / 2)
                            setDomainAnimated([newMin, newMax])
                        }
                    }

                    const onZoomIn = updateDomain(smallerZoomScale)
                    const onZoomOut = updateDomain(biggerZoomScale)

                    const onZoomInCustom = (mouseStartX: number, mouseEndX: number) => {
                        if (isDomainChangePossible) {
                            const newMin = timeScale.invert(mouseStartX)
                            const newMax = timeScale.invert(mouseEndX)
                            setDomainAnimated([newMin, newMax])
                        }
                    }

                    const onZoomReset = () => {
                        if (isDomainChangePossible) {
                            setDomainAnimated([maxDomainStart, maxDomainEnd])
                        }
                    }

                    const onPan = (pixelDelta: number) => {
                        if (isDomainChangePossible) {
                            const [domainMin, domainMax] = domain
                            const [rangeMin, rangeMax] = timeScale.range()
                            const domainDelta = (pixelDelta / (rangeMax - rangeMin)) * (domainMax - domainMin)
                            const [newDomainMin, newDomainMax] = [domainMin + domainDelta, domainMax + domainDelta]
                            if (newDomainMin > maxDomainStart && newDomainMax < maxDomainEnd) {
                                setDomain([newDomainMin, newDomainMax])
                            }
                        }
                    }

                    const onEventHoverDecorated = (eventId: TimelineEventId) => {
                        setIsMouseOverEvent(true)
                        onEventHover(eventId)
                    }

                    const onEventUnhoverDecorated = (eventId: TimelineEventId) => {
                        setIsMouseOverEvent(false)
                        onEventUnhover(eventId)
                    }

                    return (
                        <InteractionHandling
                            mousePosition={mousePosition}
                            isAnimationInProgress={isAnimationInProgress}
                            isZoomInPossible={isZoomInPossible}
                            isZoomOutPossible={isZoomOutPossible}
                            onZoomIn={onZoomIn}
                            onZoomOut={onZoomOut}
                            onZoomInCustom={onZoomInCustom}
                            onZoomReset={onZoomReset}
                            onPan={onPan}
                        >
                            {(cursor, interactionMode) => {
                                const mouseCursor = isNoEventSelected ? (
                                    <MouseCursor
                                        mousePosition={mousePosition.x}
                                        cursorLabel={dateFormat(timeAtCursor)}
                                        cursor={cursor}
                                        interactionMode={interactionMode}
                                        zoomRangeStart={timeScale(timeAtCursor - zoomWidth / 2)}
                                        zoomRangeEnd={timeScale(timeAtCursor + zoomWidth / 2)}
                                        zoomScale={smallerZoomScale}
                                        isZoomInPossible={isZoomInPossible}
                                    />
                                ) : (
                                    <g />
                                )

                                return (
                                    <g>
                                        <GridLines height={height} domain={domain} timeScale={timeScale} />
                                        <ExpandedMarks
                                            mouseCursor={mouseCursor}
                                            events={events}
                                            lanes={lanes}
                                            timeScale={timeScale}
                                            height={height}
                                            eventComponent={eventComponent}
                                            onEventHover={onEventHoverDecorated}
                                            onEventUnhover={onEventUnhoverDecorated}
                                            onEventClick={onEventClick}
                                        />
                                    </g>
                                )
                            }}
                        </InteractionHandling>
                    )
                }}
            </MouseAwareSvg>
        )
    }
}
