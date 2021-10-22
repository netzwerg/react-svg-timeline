import React from 'react'
import { ScaleLinear } from 'd3-scale'

import { useZoomLevels } from '../../hooks/useZoomLevels'

import { Domain } from '../../model'
import { ZoomLevels, ZoomScale, zoomScaleWidth } from '../../shared/ZoomScale'
import { InteractionHandling } from './InteractionHandling'
import { MouseAwareSvg, SvgCoordinates } from './MouseAwareSvg'
import { MouseCursor } from './MouseCursor'
import { Trimmer, TrimRange, useTrimming } from './trimmer'

export interface InteractionProps {
  width: number
  height: number
  domain: Domain
  maxDomain: Domain
  maxDomainStart: number
  maxDomainEnd: number
  isDomainChangePossible: boolean
  timeScale: ScaleLinear<number, number>
  zoomLevels: ReadonlyArray<ZoomLevels>
  isTrimming: boolean
  trimRange?: Domain
  isAnimationInProgress: boolean
  isNoEventSelected: boolean
  onDomainChange: (domain: Domain, animated: boolean) => void
  dateFormat: (ms: number) => string
  onCursorMove?: (millisAtCursor?: number, startMillis?: number, endMillis?: number) => void
  onTrimRangeChange?: (startMillis: number, endMillis: number) => void
  onInteractionEnd?: () => void
}

export const Interaction = ({
  width,
  height,
  domain,
  maxDomain,
  maxDomainStart,
  maxDomainEnd,
  isDomainChangePossible,
  timeScale,
  zoomLevels,
  isTrimming,
  trimRange,
  isAnimationInProgress,
  isNoEventSelected,
  onDomainChange,
  dateFormat,
  onCursorMove,
  onTrimRangeChange,
  onInteractionEnd,
}: InteractionProps) => {
  const [, smallerZoomScale, biggerZoomScale] = useZoomLevels(domain, zoomLevels)

  const zoomWidth = zoomScaleWidth(smallerZoomScale)
  const currentDomainWidth = domain[1] - domain[0]
  const maxDomainWidth = maxDomainEnd - maxDomainStart

  const isZoomInPossible = smallerZoomScale !== 'minimum'
  const isZoomOutPossible = currentDomainWidth < maxDomainWidth

  return (
    <MouseAwareSvg width={width} height={height}>
      {(mousePosition: SvgCoordinates) => {
        const timeAtCursor = timeScale.invert(mousePosition.x)

        const getDomainSpan = (time: number, width: number): Domain => [
          Math.max(maxDomainStart, time - width / 2),
          Math.min(maxDomainEnd, time + width / 2),
        ]

        const setDomainAnimated = (newDomain: Domain) => onDomainChange(newDomain, true)

        const updateDomain = (zoomScale: ZoomScale) => () => {
          if (isDomainChangePossible) {
            const newZoomWidth = zoomScaleWidth(zoomScale)
            setDomainAnimated(getDomainSpan(timeAtCursor, newZoomWidth))
          }
        }

        const onZoomScrub = () => {
          if (onCursorMove) {
            onCursorMove(timeAtCursor, ...getDomainSpan(timeAtCursor, zoomWidth))
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

        const onZoomInCustomInProgress = (mouseStartX: number, mouseEndX: number) => {
          if (isDomainChangePossible && onCursorMove) {
            const newMin = timeScale.invert(mouseStartX)
            const newMax = timeScale.invert(mouseEndX)
            onCursorMove(newMax, newMin, newMax)
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
              onDomainChange([newDomainMin, newDomainMax], false)
            }
          }
        }

        const [onTrimStart, onTrimEnd] = useTrimming(maxDomain, timeScale, onTrimRangeChange, trimRange)

        return (
          <InteractionHandling
            width={width}
            height={height}
            mousePosition={mousePosition}
            isAnimationInProgress={isAnimationInProgress}
            isZoomInPossible={isZoomInPossible}
            isZoomOutPossible={isZoomOutPossible}
            isTrimming={isTrimming}
            onHover={onZoomScrub}
            onZoomIn={onZoomIn}
            onZoomOut={onZoomOut}
            onZoomInCustom={onZoomInCustom}
            onZoomInCustomInProgress={onZoomInCustomInProgress}
            onZoomReset={onZoomReset}
            onPan={onPan}
            onTrimStart={onTrimStart}
            onTrimEnd={onTrimEnd}
            onInteractionEnd={onInteractionEnd}
          >
            {(cursor, interactionMode, setTrimHoverMode) => {
              return (
                <g>
                  {isNoEventSelected && interactionMode.type !== 'trim' ? (
                    <MouseCursor
                      mousePosition={mousePosition.x}
                      cursorLabel={dateFormat(timeAtCursor)}
                      cursor={cursor}
                      interactionMode={interactionMode}
                      zoomRangeStart={timeScale(timeAtCursor - zoomWidth / 2)!}
                      zoomRangeEnd={timeScale(timeAtCursor + zoomWidth / 2)!}
                      zoomScale={smallerZoomScale}
                      isZoomInPossible={isZoomInPossible}
                    />
                  ) : (
                    <g />
                  )}
                  {trimRange && (
                    <TrimRange
                      startX={timeScale(trimRange[0])!}
                      endX={timeScale(trimRange[1])!}
                      height={height}
                      width={width}
                    />
                  )}
                  {interactionMode.type === 'trim' && timeScale && (
                    <Trimmer
                      startX={trimRange ? trimRange[0] : maxDomain[0]}
                      endX={trimRange ? trimRange[1] : maxDomain[1]}
                      height={height}
                      width={width}
                      timeScale={timeScale}
                      setTrimMode={setTrimHoverMode}
                      dateFormat={dateFormat}
                      highlightActiveArea={interactionMode.variant === 'trim pan end'}
                    />
                  )}
                </g>
              )
            }}
          </InteractionHandling>
        )
      }}
    </MouseAwareSvg>
  )
}
